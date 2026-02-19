import TelegramBot from 'node-telegram-bot-api';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
const token = '8502149642:AAFDU7ICOcCAB2Iw7amaIYgUcuFB0Y2I70Q';
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 PRISMA RT 04 - Advanced Bot System Started');
console.log('   Mode: Full Features (Finance, Admin, Security, Info)');

// --- DATA STORE (Mirrors Web Content) ---

const ANNOUNCEMENTS = [
    { title: "Kerja Bakti Bulanan", date: "16 Feb 2026", desc: "Pembersihan lingkungan RT 04." },
    { title: "Jadwal Ronda Minggu III", date: "15 Feb 2026", desc: "Jadwal telah diperbarui." },
    { title: "Laporan Keuangan Jan 2026", date: "05 Feb 2026", desc: "Tersedia untuk diunduh." },
    { title: "Perbaikan Jalan Gg. Bugis", date: "14 Feb 2026", desc: "Waspada saat melintas." },
    { title: "Persiapan HUT RI ke-81", date: "20 Feb 2026", desc: "Rapat koordinasi panitia." }
];

const ACTIVITIES = [
    { title: "Kerja Bakti", time: "Minggu ke-3, 07.00 WIB", loc: "Lingkungan RT 04" },
    { title: "Ronda Malam", time: "Setiap Malam, 22.00 WIB", loc: "Poskamling" },
    { title: "Pengumpulan Sampah", time: "Senin/Rabu/Jumat, 06.00 WIB", loc: "Depan Rumah" },
    { title: "Rapat Warga", time: "Kuartal/Sesuai Kebutuhan", loc: "Rumah Ketua RT" }
];

const OFFICIALS = [
    { role: "Ketua RT", name: "Bpk. Rerry Adusundaru", contact: "6287872004448" },
    { role: "Sekretaris", name: "Ibu Sekretaris", contact: "6287872004448" },
    { role: "Bendahara", name: "Bpk. Bendahara", contact: "6287872004448" },
    { role: "Keamanan", name: "Koordinator Keamanan", contact: "6287872004448" }
];

const FINANCE_SUMMARY = {
    balance: "Rp 15.450.000",
    income: "Rp 4.500.000 (Iuran Warga)",
    expense: "Rp 2.300.000 (Operasional & Kebersihan)",
    lastUpdate: "12 Feb 2026"
};

// --- HELPER FUNCTIONS ---

const generatePDF = (title: string, data: any, filename: string): string => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filePath = path.join(__dirname, filename);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Header Color Stripe
    doc.rect(0, 0, 600, 100).fill('#0f172a'); // Slate 900

    // Logo Text
    doc.fontSize(24).font('Helvetica-Bold').fillColor('white').text('PRISMA RT 04', 50, 40);
    doc.fontSize(10).font('Helvetica').text('Sistem Informasi Digital Warga Kemayoran', 50, 70);

    // Title
    doc.moveDown(5);
    doc.fillColor('#000000');
    doc.fontSize(20).text(title, { align: 'center', underline: true });

    // Content Box
    doc.rect(50, 200, 500, 300).strokeColor('#e2e8f0').stroke();

    let y = 220;
    Object.entries(data).forEach(([key, val]) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`${key}:`, 70, y);
        doc.font('Helvetica').text(`${val}`, 200, y);
        y += 30;
    });

    // Footer
    doc.fontSize(10).text('Dokumen ini sah dan digenerate otomatis oleh sistem.', 50, 700, { align: 'center' });

    doc.end();
    return filePath;
};

// --- MENUS ---

const mainMenu = {
    reply_markup: {
        keyboard: [
            [{ text: '📢 Pusat Informasi' }, { text: '📝 Layanan Warga' }],
            [{ text: '📊 Data & Keuangan' }, { text: '🆘 Darurat & Kontak' }]
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
const userState: Record<number, { step: string, data?: any }> = {};

// --- HANDLERS ---

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
        `👋 <b>Selamat Datang di Bot PRISMA RT 04!</b>\n\n` +
        `Saya adalah asisten virtual yang siap membantu kebutuhan administrasi dan informasi Anda 24 jam.\n\n` +
        `Silakan pilih menu di bawah ini:`,
        { parse_mode: 'HTML', ...mainMenu }
    );
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

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
        const contacts = OFFICIALS.map(o => `• <b>${o.role}:</b> ${o.name}\n  📞 wa.me/${o.contact}`).join('\n\n');
        bot.sendMessage(chatId, `🚨 <b>KONTAK DARURAT & PENGURUS</b>\n\n${contacts}\n\n📍 <b>Lokasi Sekretariat:</b>\nGg. Bugis No.95, RT 04/RW 09`, { parse_mode: 'HTML' });
    }

    // Input State Handling
    if (userState[chatId]) {
        handleInput(chatId, text, msg.from?.first_name || 'Warga');
    }
});

// --- CALLBACK QUERY HANDLER ---

bot.on('callback_query', (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;
    if (!chatId || !data) return;

    // Info Actions
    if (data === 'info_news') {
        const text = ANNOUNCEMENTS.map((a, i) => `${i + 1}. <b>${a.title}</b> (${a.date})\n   ${a.desc}`).join('\n\n');
        bot.sendMessage(chatId, `📰 <b>PENGUMUMAN TERBARU</b>\n\n${text}`, { parse_mode: 'HTML' });
    }
    else if (data === 'info_schedule') {
        const text = ACTIVITIES.map(a => `🗓 <b>${a.title}</b>\n   🕒 ${a.time}\n   📍 ${a.loc}`).join('\n\n');
        bot.sendMessage(chatId, `📅 <b>JADWAL KEGIATAN</b>\n\n${text}`, { parse_mode: 'HTML' });
    }
    else if (data === 'info_structure') {
        const text = OFFICIALS.map(o => `👤 <b>${o.role}</b>: ${o.name}`).join('\n');
        bot.sendMessage(chatId, `🏛 <b>STRUKTUR PENGURUS</b>\n\n${text}`, { parse_mode: 'HTML' });
    }
    else if (data === 'info_guide') {
        bot.sendMessage(chatId, `📖 <b>PANDUAN WARGA BARU</b>\n\n1. Lapor diri ke Ketua RT max 1x24 jam.\n2. Wajib ikut kerja bakti & ronda.\n3. Iuran kebersihan Rp 25.000/bulan.\n4. Tamu menginap wajib lapor.\n\nketik /register untuk mendaftar database.`, { parse_mode: 'HTML' });
    }

    // Service Actions
    else if (data === 'srv_letter') {
        bot.sendMessage(chatId, '📝 <b>BUAT SURAT PENGANTAR</b>\n\nSilakan ketik: <b>Jenis Surat, Nama Lengkap, Keperluan</b>\n\nContoh: <i>Surat Domisili, Budi Santoso, Mengurus Rekening Bank</i>', { parse_mode: 'HTML' });
        userState[chatId] = { step: 'LETTER_INPUT' };
    }
    else if (data === 'srv_security') {
        bot.sendMessage(chatId, '🚨 <b>LAPOR KEAMANAN</b>\n\nJelaskan kejadian, lokasi, dan waktu.\n\nContoh: <i>Orang mencurigakan di depan Poskamling, jam 23.00</i>', { parse_mode: 'HTML' });
        userState[chatId] = { step: 'SECURITY_INPUT' };
    }
    else if (data === 'srv_register') {
        bot.sendMessage(chatId, '👤 <b>REGISTRASI WARGA</b>\n\nMasukkan Nama, No Rumah, dan No HP.\n\nContoh: <i>Andi, No 12B, 08123456789</i>', { parse_mode: 'HTML' });
        userState[chatId] = { step: 'REGISTER_INPUT' };
    }
    else if (data === 'srv_status') {
        bot.sendMessage(chatId, '🔍 Masukkan <b>ID TIKET</b> laporan Anda (Contoh: REG-123456):', { parse_mode: 'HTML' });
        userState[chatId] = { step: 'STATUS_CHECK' };
    }

    // Finance Actions
    else if (data === 'fin_summary') {
        bot.sendMessage(chatId, `💰 <b>RINGKASAN KAS RT 04</b>\n\n💵 Saldo Akhir: <b>${FINANCE_SUMMARY.balance}</b>\n\n📥 Pemasukan: ${FINANCE_SUMMARY.income}\n📤 Pengeluaran: ${FINANCE_SUMMARY.expense}\n\n<i>Update: ${FINANCE_SUMMARY.lastUpdate}</i>`, { parse_mode: 'HTML' });
    }
    else if (data === 'fin_expense') {
        bot.sendMessage(chatId, '📉 <b>DETAIL PENGELUARAN (Bulan Ini)</b>\n\n1. Kebersihan: Rp 1.200.000\n2. Listrik Poskamling: Rp 300.000\n3. Konsumsi Ronda: Rp 500.000\n4. ATK: Rp 300.000', { parse_mode: 'HTML' });
    }
    else if (data === 'fin_pay') {
        bot.sendMessage(chatId, '💳 <b>CARA BAYAR IURAN</b>\n\n1. Cash ke Bendahara (Pak Budi)\n2. Transfer BCA: 123-456-7890 (a.n RT 04)\n3. QRIS (Scan di papan pengumuman)\n\n<i>Mohon konfirmasi setelah transfer.</i>', { parse_mode: 'HTML' });
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
        // Mock status check
        bot.sendMessage(chatId, `✅ <b>Status Tiket: ${text}</b>\n\nStatus: <b>Sedang Diproses</b>\nEstimasi Selesai: 1-2 Hari Kerja`, { parse_mode: 'HTML' });
        delete userState[chatId];
        return;
    }

    if (docType) {
        bot.sendMessage(chatId, '⏳ <b>Sedang memproses dokumen...</b>', { parse_mode: 'HTML' });

        const id = `${prefix}-${Date.now().toString().slice(-6)}`;
        const date = new Date().toLocaleString('id-ID');

        const pdfData = {
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
            bot.sendDocument(chatId, pdfPath, {
                caption: `✅ <b>Permintaan Diterima!</b>\n\nID Tiket: <code>${id}</code>\n\nSimpan dokumen ini sebagai bukti pengajuan. Admin kami akan segera memverifikasi data Anda.`,
                parse_mode: 'HTML'
            });
            fs.unlinkSync(pdfPath);
            delete userState[chatId];
        }, 1500);
    }
}
