import TelegramBot from 'node-telegram-bot-api';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';

// --- AUTO-LOAD TOKEN FROM .env.bot ---
dotenv.config({ path: path.resolve(__dirname, '..', '.env.bot') });

// --- CONFIGURATION ---
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found!');
    console.error('   Create .env.bot file with TELEGRAM_BOT_TOKEN=your-token');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const BOT_START_TIME = Date.now();
let totalMessages = 0;

console.log('🤖 PRISMA RT 04 - Real-Time Intelligent Bot');
console.log('   Mode: Real-Time Data + Gemini AI + Broadcast');
console.log('   Security: Token loaded from environment');

// --- GEMINI AI INTEGRATION ---
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.warn('⚠️ GEMINI_API_KEY not found. AI Chat will be disabled.');
}
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const aiModel = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;

// --- CHAT HISTORY (per user, last 10 messages) ---
const chatHistory: Record<number, Content[]> = {};
const MAX_HISTORY = 10;

function getUserHistory(chatId: number): Content[] {
    if (!chatHistory[chatId]) chatHistory[chatId] = [];
    return chatHistory[chatId];
}

function addToHistory(chatId: number, role: 'user' | 'model', text: string) {
    const history = getUserHistory(chatId);
    history.push({ role, parts: [{ text }] });
    // Keep only last MAX_HISTORY entries
    if (history.length > MAX_HISTORY * 2) {
        chatHistory[chatId] = history.slice(-MAX_HISTORY * 2);
    }
}

// --- REAL-TIME DATA STORE ---
const DATA_STORE_PATH = path.resolve(__dirname, 'data-store.json');

interface DataStore {
    announcements: Array<{ id: string; title: string; date: string; description: string; type: string; pinned?: boolean }>;
    activities: Array<{ title: string; time: string; location: string }>;
    officials: Array<{ role: string; name: string; contact: string }>;
    finance: {
        balance: string;
        income: string;
        expense: string;
        lastUpdate: string;
        expenses_detail: Array<{ item: string; amount: string }>;
        payment_methods: string[];
    };
    subscribers: number[];
    stats: { totalMessages: number; startedAt: string };
}

function loadData(): DataStore {
    try {
        const raw = fs.readFileSync(DATA_STORE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        console.error('[DataStore] Failed to load data-store.json:', error);
        return {
            announcements: [],
            activities: [],
            officials: [],
            finance: { balance: "N/A", income: "N/A", expense: "N/A", lastUpdate: "N/A", expenses_detail: [], payment_methods: [] },
            subscribers: [],
            stats: { totalMessages: 0, startedAt: new Date().toISOString() }
        };
    }
}

function saveData(data: DataStore) {
    try {
        fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(data, null, 4), 'utf-8');
    } catch (error) {
        console.error('[DataStore] Failed to save data-store.json:', error);
    }
}

// Initialize stats
const initialData = loadData();
initialData.stats.startedAt = new Date().toISOString();
saveData(initialData);
console.log(`   Data Store: ${initialData.announcements.length} announcements, ${initialData.activities.length} activities loaded`);

// --- WEBSITE MONITORING ---
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const WEBSITE_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || "http://localhost:3000";
const MONITOR_INTERVAL = 5 * 60 * 1000;

setInterval(async () => {
    try {
        const response = await fetch(WEBSITE_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (error) {
        console.error(`[Monitor] ${error instanceof Error ? error.message : error}`);
        if (ADMIN_CHAT_ID) {
            bot.sendMessage(ADMIN_CHAT_ID, `🚨 <b>ALERT: Web Down</b>\n${WEBSITE_URL}\n${error instanceof Error ? error.message : error}`, { parse_mode: 'HTML' })
                .catch(() => { });
        }
    }
}, MONITOR_INTERVAL);

// --- ERROR HANDLING ---
bot.on('polling_error', (error) => {
    console.error(`[Polling Error] ${'code' in error ? (error as Record<string, unknown>).code : 'UNKNOWN'}: ${error.message}`);
});

// --- INPUT VALIDATION ---
const MAX_INPUT_LENGTH = 500;
const RATE_LIMIT_MAP: Record<number, { count: number; resetAt: number }> = {};
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW = 60 * 1000;

function sanitizeBotInput(text: string): string {
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/\0/g, '')
        .slice(0, MAX_INPUT_LENGTH)
        .trim();
}

function checkBotRateLimit(chatId: number): boolean {
    const now = Date.now();
    const entry = RATE_LIMIT_MAP[chatId];
    if (!entry || now > entry.resetAt) {
        RATE_LIMIT_MAP[chatId] = { count: 1, resetAt: now + RATE_LIMIT_WINDOW };
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count++;
    return true;
}

// --- PDF GENERATOR ---
const generatePDF = (title: string, data: Record<string, string>, filename: string): string => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const outputDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const filePath = path.join(outputDir, filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.rect(0, 0, 600, 100).fill('#0f172a');
    doc.fontSize(24).font('Helvetica-Bold').fillColor('white').text('PRISMA RT 04', 50, 40);
    doc.fontSize(10).font('Helvetica').text('Sistem Informasi Digital Warga Kemayoran', 50, 70);

    doc.moveDown(5);
    doc.fillColor('#000000');
    doc.fontSize(20).text(title, { align: 'center', underline: true });

    doc.rect(50, 200, 500, 300).strokeColor('#e2e8f0').stroke();
    let y = 220;
    Object.entries(data).forEach(([key, val]) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`${key}:`, 70, y);
        doc.font('Helvetica').text(`${val}`, 200, y);
        y += 30;
    });

    doc.fontSize(10).text('Dokumen ini sah dan digenerate otomatis oleh sistem.', 50, 700, { align: 'center' });
    doc.end();
    return filePath;
};

// --- MENUS ---
const mainMenu = {
    reply_markup: {
        keyboard: [
            [{ text: '📢 Pusat Informasi' }, { text: '📝 Layanan Warga' }],
            [{ text: '📊 Data & Keuangan' }, { text: '🆘 Darurat & Kontak' }],
            [{ text: '🤖 Tanya AI Siaga' }]
        ],
        resize_keyboard: true
    }
};

const infoMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '📰 Pengumuman Terbaru', callback_data: 'info_news' }],
            [{ text: '📅 Jadwal Kegiatan', callback_data: 'info_schedule' }],
            [{ text: '👥 Struktur Organisasi', callback_data: 'info_structure' }],
            [{ text: '📖 Panduan Warga Baru', callback_data: 'info_guide' }]
        ]
    }
};

const serviceMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '📄 Buat Surat Pengantar', callback_data: 'srv_letter' }],
            [{ text: '🚨 Lapor Keamanan', callback_data: 'srv_security' }],
            [{ text: '👤 Registrasi Warga', callback_data: 'srv_register' }],
            [{ text: '🔍 Cek Status Laporan', callback_data: 'srv_status' }]
        ]
    }
};

const financeMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '💰 Cek Saldo & Kas', callback_data: 'fin_summary' }],
            [{ text: '📉 Histori Pengeluaran', callback_data: 'fin_expense' }],
            [{ text: '💳 Cara Bayar Iuran', callback_data: 'fin_pay' }]
        ]
    }
};

// --- STATE MANAGEMENT ---
const userState: Record<number, { step: string; data?: Record<string, string> }> = {};

// --- COMMAND HANDLERS ---

bot.onText(/\/start/, (msg) => {
    totalMessages++;
    bot.sendMessage(msg.chat.id,
        `👋 <b>Selamat Datang di Bot PRISMA RT 04!</b>\n\n` +
        `Saya adalah <b>Siaga</b>, asisten virtual cerdas berbasis AI yang siap membantu kebutuhan administrasi dan informasi Anda 24 jam.\n\n` +
        `🤖 Anda bisa bertanya apa saja tentang RT 04!\n` +
        `📋 Atau gunakan menu di bawah:\n`,
        { parse_mode: 'HTML', ...mainMenu }
    );
});

bot.onText(/\/help/, (msg) => {
    totalMessages++;
    bot.sendMessage(msg.chat.id,
        `ℹ️ <b>Bantuan Bot PRISMA RT 04</b>\n\n` +
        `<b>Perintah tersedia:</b>\n` +
        `/start - Mulai bot dan tampilkan menu\n` +
        `/help - Tampilkan bantuan\n` +
        `/register - Daftar warga baru\n` +
        `/report - Lapor keamanan\n` +
        `/finance - Lihat ringkasan keuangan\n` +
        `/contact - Kontak pengurus RT\n` +
        `/subscribe - Berlangganan notifikasi pengumuman\n` +
        `/status - Status sistem bot\n\n` +
        `💡 <b>Fitur AI:</b> Ketik pertanyaan apa saja dan saya akan menjawab!`,
        { parse_mode: 'HTML' }
    );
});

bot.onText(/\/register/, (msg) => {
    totalMessages++;
    bot.sendMessage(msg.chat.id,
        `👤 <b>REGISTRASI WARGA</b>\n\n` +
        `⚠️ <b>PERINGATAN PENTING:</b>\n` +
        `Data yang dimasukkan HARUS sesuai dengan KTP/KK fisik Anda.\n\n` +
        `Masukkan data: <b>Nama, No Rumah, No HP</b>\n\n` +
        `Contoh: <i>Andi Pratama, No 12B, 08123456789</i>`,
        { parse_mode: 'HTML' }
    );
    userState[msg.chat.id] = { step: 'REGISTER_INPUT' };
});

bot.onText(/\/report/, (msg) => {
    totalMessages++;
    bot.sendMessage(msg.chat.id,
        `🚨 <b>LAPOR KEAMANAN</b>\n\n` +
        `Jelaskan kejadian, lokasi, dan waktu.\n\n` +
        `Contoh: <i>Orang mencurigakan di depan Poskamling, jam 23.00</i>`,
        { parse_mode: 'HTML' }
    );
    userState[msg.chat.id] = { step: 'SECURITY_INPUT' };
});

bot.onText(/\/finance/, (msg) => {
    totalMessages++;
    const data = loadData();
    bot.sendMessage(msg.chat.id,
        `💰 <b>RINGKASAN KAS RT 04</b>\n\n` +
        `💵 Saldo Akhir: <b>${data.finance.balance}</b>\n\n` +
        `📥 Pemasukan: ${data.finance.income}\n` +
        `📤 Pengeluaran: ${data.finance.expense}\n\n` +
        `<i>Update: ${data.finance.lastUpdate}</i>`,
        { parse_mode: 'HTML' }
    );
});

bot.onText(/\/contact/, (msg) => {
    totalMessages++;
    const data = loadData();
    const contacts = data.officials.map(o => `• <b>${o.role}:</b> ${o.name}\n  📞 wa.me/${o.contact}`).join('\n\n');
    bot.sendMessage(msg.chat.id,
        `🚨 <b>KONTAK DARURAT & PENGURUS</b>\n\n${contacts}\n\n` +
        `📍 <b>Lokasi Sekretariat:</b>\nGg. Bugis No.95, RT 04/RW 09`,
        { parse_mode: 'HTML' }
    );
});

// --- /subscribe ---
bot.onText(/\/subscribe/, (msg) => {
    totalMessages++;
    const data = loadData();
    const chatId = msg.chat.id;

    if (data.subscribers.includes(chatId)) {
        // Unsubscribe
        data.subscribers = data.subscribers.filter(id => id !== chatId);
        saveData(data);
        bot.sendMessage(chatId, '🔕 Anda telah <b>berhenti berlangganan</b> notifikasi pengumuman.\n\nKetik /subscribe lagi untuk berlangganan ulang.', { parse_mode: 'HTML' });
    } else {
        data.subscribers.push(chatId);
        saveData(data);
        bot.sendMessage(chatId, '🔔 Anda telah <b>berlangganan</b> notifikasi pengumuman!\n\nAnda akan menerima pesan otomatis saat ada pengumuman baru.\nKetik /subscribe lagi untuk berhenti berlangganan.', { parse_mode: 'HTML' });
    }
});

// --- /status ---
bot.onText(/\/status/, (msg) => {
    totalMessages++;
    const uptime = Date.now() - BOT_START_TIME;
    const hours = Math.floor(uptime / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);

    const memUsage = process.memoryUsage();
    const data = loadData();

    bot.sendMessage(msg.chat.id,
        `📊 <b>STATUS SISTEM BOT PRISMA</b>\n\n` +
        `⏱ <b>Uptime:</b> ${hours}j ${minutes}m ${seconds}s\n` +
        `💬 <b>Total Pesan:</b> ${totalMessages}\n` +
        `👥 <b>Subscriber:</b> ${data.subscribers.length} warga\n` +
        `📰 <b>Pengumuman:</b> ${data.announcements.length} aktif\n` +
        `🧠 <b>Memory:</b> ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)} MB\n` +
        `🤖 <b>AI Engine:</b> ${aiModel ? '✅ Gemini Active' : '❌ Offline'}\n` +
        `🌐 <b>Monitor:</b> ${WEBSITE_URL}\n\n` +
        `<i>Bot berjalan sejak ${new Date(BOT_START_TIME).toLocaleString('id-ID')}</i>`,
        { parse_mode: 'HTML' }
    );
});

// --- /broadcast (Admin Only) ---
bot.onText(/\/broadcast (.+)/, (msg, match) => {
    totalMessages++;
    const chatId = msg.chat.id;

    // Simple admin check: use ADMIN_CHAT_ID
    if (ADMIN_CHAT_ID && chatId.toString() !== ADMIN_CHAT_ID) {
        bot.sendMessage(chatId, '⛔ Hanya admin yang dapat menggunakan perintah ini.');
        return;
    }

    const broadcastText = match?.[1];
    if (!broadcastText) {
        bot.sendMessage(chatId, '⚠️ Format: /broadcast [pesan pengumuman]');
        return;
    }

    const data = loadData();

    // Add to announcements
    const newAnnouncement = {
        id: `ann-${Date.now()}`,
        title: broadcastText.slice(0, 80),
        date: new Date().toISOString().split('T')[0],
        description: broadcastText,
        type: 'urgent' as const,
        pinned: true
    };
    data.announcements.unshift(newAnnouncement);
    saveData(data);

    // Broadcast to subscribers
    let sent = 0;
    let failed = 0;
    const broadcastMsg = `📢 <b>PENGUMUMAN BARU RT 04</b>\n\n${broadcastText}\n\n<i>${new Date().toLocaleString('id-ID')}</i>`;

    data.subscribers.forEach(subId => {
        bot.sendMessage(subId, broadcastMsg, { parse_mode: 'HTML' })
            .then(() => sent++)
            .catch(() => failed++);
    });

    bot.sendMessage(chatId,
        `✅ <b>Broadcast berhasil!</b>\n\n` +
        `📨 Dikirim ke: ${data.subscribers.length} subscriber\n` +
        `📰 Ditambahkan ke pengumuman real-time`,
        { parse_mode: 'HTML' }
    );
});

// --- MESSAGE HANDLER ---
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text || text.startsWith('/')) return;

    totalMessages++;

    if (!checkBotRateLimit(chatId)) {
        bot.sendMessage(chatId, '⚠️ Terlalu banyak pesan. Mohon tunggu sebentar.');
        return;
    }

    // Main Menu Handling
    if (text === '📢 Pusat Informasi') {
        bot.sendMessage(chatId, '📂 <b>Pusat Informasi Warga</b>\nAkses berita, jadwal, dan struktur RT.', { parse_mode: 'HTML', ...infoMenu });
    }
    else if (text === '📝 Layanan Warga') {
        bot.sendMessage(chatId, '🛠 <b>Layanan Mandiri</b>\nBuat surat, lapor keamanan, atau daftar warga baru.', { parse_mode: 'HTML', ...serviceMenu });
    }
    else if (text === '📊 Data & Keuangan') {
        bot.sendMessage(chatId, '📈 <b>Transparansi Data</b>\nCek kas RT dan data statistik.', { parse_mode: 'HTML', ...financeMenu });
    }
    else if (text === '🆘 Darurat & Kontak') {
        const data = loadData();
        const contacts = data.officials.map(o => `• <b>${o.role}:</b> ${o.name}\n  📞 wa.me/${o.contact}`).join('\n\n');
        bot.sendMessage(chatId, `🚨 <b>KONTAK DARURAT & PENGURUS</b>\n\n${contacts}\n\n📍 <b>Lokasi Sekretariat:</b>\nGg. Bugis No.95, RT 04/RW 09`, { parse_mode: 'HTML' });
    }
    else if (text === '🤖 Tanya AI Siaga') {
        bot.sendMessage(chatId, '🤖 <b>Mode AI Aktif!</b>\n\nSilakan ketik pertanyaan apa saja tentang RT 04, layanan, keuangan, atau hal lainnya.\n\nSaya akan menjawab dengan cerdas! 💬', { parse_mode: 'HTML' });
    }
    // Input State Handling
    else if (userState[chatId]) {
        const sanitizedText = sanitizeBotInput(text);
        if (sanitizedText.length < 3) {
            bot.sendMessage(chatId, '⚠️ Input terlalu pendek. Mohon berikan informasi yang lebih detail.');
            return;
        }
        handleInput(chatId, sanitizedText, msg.from?.first_name || 'Warga');
    }
    // AI Fallback — any free text goes to Gemini
    else {
        handleAIChat(chatId, text, msg.from?.first_name || 'Warga');
    }
});

// --- AI CHAT WITH FULL CONTEXT ---
async function handleAIChat(chatId: number, text: string, username: string) {
    if (!aiModel) {
        bot.sendMessage(chatId, "Maaf, fitur AI sedang tidak aktif. Silakan pilih menu di bawah ini:", mainMenu);
        return;
    }

    bot.sendChatAction(chatId, 'typing');

    // Load real-time data for context
    const data = loadData();

    const systemPrompt = `Anda adalah "Siaga", asisten virtual cerdas untuk RT 04 RW 09 Kelurahan Kemayoran, Jakarta Pusat.

KONTEKS DATA REAL-TIME RT 04:

PENGUMUMAN TERBARU:
${data.announcements.map(a => `- [${a.date}] ${a.title}: ${a.description}`).join('\n')}

JADWAL KEGIATAN:
${data.activities.map(a => `- ${a.title}: ${a.time} di ${a.location}`).join('\n')}

PENGURUS RT:
${data.officials.map(o => `- ${o.role}: ${o.name} (WA: ${o.contact})`).join('\n')}

KEUANGAN:
- Saldo: ${data.finance.balance}
- Pemasukan: ${data.finance.income}
- Pengeluaran: ${data.finance.expense}
- Update terakhir: ${data.finance.lastUpdate}
- Detail pengeluaran: ${data.finance.expenses_detail.map(e => `${e.item}: ${e.amount}`).join(', ')}
- Cara bayar iuran: ${data.finance.payment_methods.join('; ')}

LOKASI SEKRETARIAT: Gg. Bugis No.95, RT 04/RW 09 Kemayoran

ATURAN:
1. Jawab dengan ramah, ringkas, dan profesional dalam bahasa Indonesia
2. Gunakan data real-time di atas untuk menjawab pertanyaan spesifik
3. Jika ditanya tentang hal di luar konteks RT, tetap jawab dengan baik sebagai asisten umum
4. Jangan mengarang data yang tidak ada di konteks
5. Jika relevan, arahkan ke fitur bot (contoh: ketik /register untuk mendaftar)
6. Nama warga yang bertanya: ${username}`;

    // Add user message to history
    addToHistory(chatId, 'user', text);

    try {
        const chat = aiModel.startChat({
            history: getUserHistory(chatId).slice(0, -1), // exclude last (current) message
            systemInstruction: systemPrompt,
        });

        // Keep typing during generation
        const typingInterval = setInterval(() => {
            bot.sendChatAction(chatId, 'typing').catch(() => { });
        }, 4000);

        const result = await chat.sendMessage(text);
        clearInterval(typingInterval);

        const responseText = result.response.text();
        addToHistory(chatId, 'model', responseText);

        // Send with Markdown, fallback to plain text if it fails
        bot.sendMessage(chatId, responseText, { parse_mode: 'Markdown' })
            .catch(() => {
                bot.sendMessage(chatId, responseText);
            });
    } catch (error) {
        console.error("Gemini AI Error:", error);
        bot.sendMessage(chatId, "Maaf, terjadi kendala pada AI. Silakan coba lagi atau gunakan menu yang tersedia.", mainMenu);
    }
}

// --- CALLBACK QUERY HANDLER ---
bot.on('callback_query', (query) => {
    const chatId = query.message?.chat.id;
    const callbackData = query.data;
    if (!chatId || !callbackData) return;

    totalMessages++;

    if (!checkBotRateLimit(chatId)) {
        bot.answerCallbackQuery(query.id, { text: 'Terlalu banyak permintaan, tunggu sebentar.' });
        return;
    }

    // Load data fresh for every callback
    const data = loadData();

    // Info Actions
    if (callbackData === 'info_news') {
        const text = data.announcements.map((a, i) => `${i + 1}. <b>${a.title}</b> (${a.date})\n   ${a.description}`).join('\n\n');
        bot.sendMessage(chatId, `📰 <b>PENGUMUMAN TERBARU</b>\n\n${text || 'Belum ada pengumuman.'}`, { parse_mode: 'HTML' });
    }
    else if (callbackData === 'info_schedule') {
        const text = data.activities.map(a => `🗓 <b>${a.title}</b>\n   🕒 ${a.time}\n   📍 ${a.location}`).join('\n\n');
        bot.sendMessage(chatId, `📅 <b>JADWAL KEGIATAN</b>\n\n${text}`, { parse_mode: 'HTML' });
    }
    else if (callbackData === 'info_structure') {
        const text = data.officials.map(o => `👤 <b>${o.role}</b>: ${o.name}`).join('\n');
        bot.sendMessage(chatId, `🏛 <b>STRUKTUR PENGURUS</b>\n\n${text}`, { parse_mode: 'HTML' });
    }
    else if (callbackData === 'info_guide') {
        bot.sendMessage(chatId,
            `📖 <b>PANDUAN WARGA BARU</b>\n\n` +
            `1. Lapor diri ke Ketua RT max 1x24 jam.\n` +
            `2. Wajib ikut kerja bakti & ronda.\n` +
            `3. Iuran kebersihan Rp 25.000/bulan.\n` +
            `4. Tamu menginap wajib lapor.\n\n` +
            `Ketik /register untuk mendaftar database.`,
            { parse_mode: 'HTML' }
        );
    }

    // Service Actions
    else if (callbackData === 'srv_letter') {
        bot.sendMessage(chatId,
            '📝 <b>BUAT SURAT PENGANTAR</b>\n\n' +
            'Silakan ketik: <b>Jenis Surat, Nama Lengkap, Keperluan</b>\n\n' +
            'Contoh: <i>Surat Domisili, Budi Santoso, Mengurus Rekening Bank</i>',
            { parse_mode: 'HTML' }
        );
        userState[chatId] = { step: 'LETTER_INPUT' };
    }
    else if (callbackData === 'srv_security') {
        bot.sendMessage(chatId,
            '🚨 <b>LAPOR KEAMANAN</b>\n\n' +
            'Jelaskan kejadian, lokasi, dan waktu.\n\n' +
            'Contoh: <i>Orang mencurigakan di depan Poskamling, jam 23.00</i>',
            { parse_mode: 'HTML' }
        );
        userState[chatId] = { step: 'SECURITY_INPUT' };
    }
    else if (callbackData === 'srv_register') {
        bot.sendMessage(chatId,
            '👤 <b>REGISTRASI WARGA</b>\n\n' +
            '⚠️ <b>PERINGATAN:</b> Data HARUS sesuai KTP/KK fisik.\n\n' +
            'Masukkan: <b>Nama, No Rumah, No HP</b>\n\n' +
            'Contoh: <i>Andi Pratama, No 12B, 08123456789</i>',
            { parse_mode: 'HTML' }
        );
        userState[chatId] = { step: 'REGISTER_INPUT' };
    }
    else if (callbackData === 'srv_status') {
        bot.sendMessage(chatId, '🔍 Masukkan <b>ID TIKET</b> laporan Anda (Contoh: REG-123456):', { parse_mode: 'HTML' });
        userState[chatId] = { step: 'STATUS_CHECK' };
    }

    // Finance Actions
    else if (callbackData === 'fin_summary') {
        bot.sendMessage(chatId,
            `💰 <b>RINGKASAN KAS RT 04</b>\n\n` +
            `💵 Saldo Akhir: <b>${data.finance.balance}</b>\n\n` +
            `📥 Pemasukan: ${data.finance.income}\n` +
            `📤 Pengeluaran: ${data.finance.expense}\n\n` +
            `<i>Update: ${data.finance.lastUpdate}</i>`,
            { parse_mode: 'HTML' }
        );
    }
    else if (callbackData === 'fin_expense') {
        const details = data.finance.expenses_detail.map((e, i) => `${i + 1}. ${e.item}: ${e.amount}`).join('\n');
        bot.sendMessage(chatId, `📉 <b>DETAIL PENGELUARAN (Bulan Ini)</b>\n\n${details}`, { parse_mode: 'HTML' });
    }
    else if (callbackData === 'fin_pay') {
        const methods = data.finance.payment_methods.map((m, i) => `${i + 1}. ${m}`).join('\n');
        bot.sendMessage(chatId, `💳 <b>CARA BAYAR IURAN</b>\n\n${methods}\n\n<i>Mohon konfirmasi setelah transfer.</i>`, { parse_mode: 'HTML' });
    }

    bot.answerCallbackQuery(query.id);
});

// --- INPUT LOGIC ---
async function handleInput(chatId: number, text: string, username: string) {
    const state = userState[chatId];
    if (!state) return;

    let docType = '';
    let prefix = '';

    if (state.step === 'LETTER_INPUT') {
        docType = 'SURAT PENGANTAR';
        prefix = 'SRT';
    } else if (state.step === 'SECURITY_INPUT') {
        docType = 'LAPORAN KEAMANAN';
        prefix = 'SEC';
    } else if (state.step === 'REGISTER_INPUT') {
        docType = 'REGISTRASI WARGA';
        prefix = 'REG';
    } else if (state.step === 'STATUS_CHECK') {
        const ticketPattern = /^(SRT|SEC|REG)-\d{6}$/;
        if (!ticketPattern.test(text)) {
            bot.sendMessage(chatId, '⚠️ Format ID tiket tidak valid. Gunakan format: SRT-123456, SEC-123456, atau REG-123456');
            delete userState[chatId];
            return;
        }
        bot.sendMessage(chatId,
            `✅ <b>Status Tiket: ${text}</b>\n\n` +
            `Status: <b>Sedang Diproses</b>\n` +
            `Estimasi Selesai: 1-2 Hari Kerja`,
            { parse_mode: 'HTML' }
        );
        delete userState[chatId];
        return;
    }

    if (docType) {
        bot.sendMessage(chatId, '⏳ <b>Sedang memproses dokumen...</b>', { parse_mode: 'HTML' });

        const id = `${prefix}-${Date.now().toString().slice(-6)}`;
        const date = new Date().toLocaleString('id-ID');

        const pdfData: Record<string, string> = {
            'ID Tiket': id,
            'Tanggal': date,
            'Pemohon': username,
            'Jenis Dokumen': docType,
            'Detail': text,
            'Status': 'Menunggu Verifikasi Admin'
        };

        const fileName = `${prefix}-${id}.pdf`;
        const pdfPath = generatePDF(docType, pdfData, fileName);

        setTimeout(() => {
            try {
                bot.sendDocument(chatId, pdfPath, {
                    caption: `✅ <b>Permintaan Diterima!</b>\n\nID Tiket: <code>${id}</code>\n\nSimpan dokumen ini sebagai bukti pengajuan.`,
                    parse_mode: 'HTML'
                });
                setTimeout(() => {
                    try { fs.unlinkSync(pdfPath); } catch { /* ok */ }
                }, 5000);
            } catch {
                bot.sendMessage(chatId,
                    `✅ <b>Permintaan Diterima!</b>\n\nID Tiket: <code>${id}</code>\n\n` +
                    `⚠️ PDF tidak dapat dikirim, tapi data Anda sudah tercatat.`,
                    { parse_mode: 'HTML' }
                );
            }
            delete userState[chatId];
        }, 1500);
    }
}

// --- GRACEFUL SHUTDOWN ---
process.on('SIGINT', () => {
    console.log('\n🛑 Bot stopping...');
    const data = loadData();
    data.stats.totalMessages = totalMessages;
    saveData(data);
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Bot stopping...');
    const data = loadData();
    data.stats.totalMessages = totalMessages;
    saveData(data);
    bot.stopPolling();
    process.exit(0);
});
