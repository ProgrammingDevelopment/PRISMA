import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Load RT 04 context data for system prompt
function loadDataStoreContext(): string {
    try {
        const dataPath = path.resolve(process.cwd(), 'scripts', 'data-store.json');
        const raw = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(raw);

        return `
PENGUMUMAN TERBARU:
${data.announcements?.map((a: { date: string; title: string; description: string }) => `- [${a.date}] ${a.title}: ${a.description}`).join('\n') || 'Tidak ada'}

JADWAL KEGIATAN:
${data.activities?.map((a: { title: string; time: string; location: string }) => `- ${a.title}: ${a.time} di ${a.location}`).join('\n') || 'Tidak ada'}

PENGURUS RT:
${data.officials?.map((o: { role: string; name: string; contact: string }) => `- ${o.role}: ${o.name} (WA: ${o.contact})`).join('\n') || 'Tidak ada'}

KEUANGAN:
- Saldo: ${data.finance?.balance || 'N/A'}
- Pemasukan: ${data.finance?.income || 'N/A'}
- Pengeluaran: ${data.finance?.expense || 'N/A'}
- Update terakhir: ${data.finance?.lastUpdate || 'N/A'}
- Cara bayar iuran: ${data.finance?.payment_methods?.join('; ') || 'N/A'}`;
    } catch {
        return '(Data RT 04 tidak tersedia)';
    }
}

const SYSTEM_PROMPT = `Anda adalah "Siaga", asisten virtual cerdas untuk RT 04 RW 09 Kelurahan Kemayoran, Jakarta Pusat.

KONTEKS DATA REAL-TIME RT 04:
${loadDataStoreContext()}

LOKASI SEKRETARIAT: Gg. Bugis No.95, RT 04/RW 09 Kemayoran

ATURAN:
1. Jawab dengan ramah, ringkas, dan profesional dalam bahasa Indonesia
2. Gunakan data real-time di atas untuk menjawab pertanyaan spesifik
3. Jika ditanya tentang hal di luar konteks RT, tetap jawab dengan baik sebagai asisten umum
4. Jangan mengarang data yang tidak ada di konteks
5. Jika relevan, arahkan pengguna ke halaman terkait di web PRISMA`;

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'kimi-k2.5:cloud';
const OLLAMA_FALLBACK_MODEL = 'llama3.2:1b';
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '';

// Server-side simple rate limiter
const ipStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkInternalRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = ipStore.get(ip);
    if (!entry || now > entry.resetAt) {
        ipStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count++;
    return true;
}

// Optimized prompt for smaller models (1B)
const COMPACT_SYSTEM_PROMPT = `Anda adalah "Siaga", asisten RT 04 Kemayoran.
DATA RT 04:
${loadDataStoreContext()}
ATURAN:
1. Ramah & Profesional.
2. Gunakan DATA di atas.
3. Jangan mengarang.
4. Jika di luar RT, jawab sebagai asisten umum.`;

async function callOllama(
    apiUrl: string,
    model: string,
    messages: Array<{ role: string; content: string }>,
    apiKey: string
): Promise<{ ok: boolean; status: number; reply?: string }> {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
            },
            body: JSON.stringify({ model, messages, stream: false }),
        });

        if (!response.ok) {
            return { ok: false, status: response.status };
        }

        const data = await response.json();
        return { ok: true, status: 200, reply: data.message?.content };
    } catch (e) {
        return { ok: false, status: 500 };
    }
}

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    if (!checkInternalRateLimit(ip)) {
        return NextResponse.json(
            { reply: "Terlalu banyak permintaan. Mohon tunggu 1 menit." },
            { status: 429 }
        );
    }

    try {
        const body = await req.json();
        const { message, history } = body;

        if (!message) {
            return NextResponse.json(
                { reply: "Pesan tidak boleh kosong." },
                { status: 400 }
            );
        }

        // Build messages
        const isFallbackActive = false; // Placeholder
        const messages: Array<{ role: string; content: string }> = [
            { role: 'system', content: SYSTEM_PROMPT }
        ];

        // Append history
        if (Array.isArray(history)) {
            for (const msg of history.slice(-10)) {
                if (msg.role && msg.content) {
                    messages.push({ role: msg.role, content: msg.content });
                }
            }
        }

        messages.push({ role: 'user', content: message });

        // Try primary model first
        let result = await callOllama(OLLAMA_API_URL, OLLAMA_MODEL, messages, OLLAMA_API_KEY);
        let finalIsFallback = false;

        // If rate-limited (429) or unavailable, fallback to local model
        if (!result.ok && (result.status === 429 || result.status === 503)) {
            console.warn(`Primary model ${OLLAMA_MODEL} returned ${result.status}, falling back to ${OLLAMA_FALLBACK_MODEL}...`);

            // Switch to compact prompt for 1B model
            messages[0].content = COMPACT_SYSTEM_PROMPT;

            const localUrl = 'http://localhost:11434/api/chat';
            result = await callOllama(localUrl, OLLAMA_FALLBACK_MODEL, messages, '');
            finalIsFallback = true;
        }

        if (!result.ok) {
            throw new Error(`Ollama API returned ${result.status}`);
        }

        const replyContent = result.reply || "Maaf, saya tidak mengerti.";
        return NextResponse.json({
            reply: replyContent,
            isFallback: finalIsFallback
        });

    } catch (error) {
        console.error("Error communicating with Ollama:", error);
        return NextResponse.json(
            { reply: "Maaf, koneksi ke asisten AI terputus. Pastikan Ollama aktif." },
            { status: 500 }
        );
    }
}
