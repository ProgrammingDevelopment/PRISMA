import fs from 'fs';
import path from 'path';

// --- TYPES ---
export interface KnowledgeEntry {
    id: string;
    question: string;
    answer: string;
    topic: string;
    keywords: string[];
    reward: number;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
    chatId: number;
    username: string;
}

export interface KnowledgeBase {
    entries: KnowledgeEntry[];
    metadata: {
        totalFeedback: number;
        positiveFeedback: number;
        negativeFeedback: number;
        positiveRate: number;
        lastUpdated: string;
    };
}

export interface FeedbackEntry {
    id: string;
    chatId: number;
    question: string;
    answer: string;
    type: 'positive' | 'negative';
    topic: string;
    timestamp: string;
}

export interface FeedbackLog {
    logs: FeedbackEntry[];
}

// Temporary store for pending feedback (question-answer pairs waiting for 👍👎)
export interface PendingFeedback {
    question: string;
    answer: string;
    chatId: number;
    username: string;
    timestamp: number;
}

// --- PATHS ---
const KNOWLEDGE_PATH = path.resolve(__dirname, 'knowledge-base.json');
const FEEDBACK_PATH = path.resolve(__dirname, 'feedback-log.json');

// --- TOPIC EXTRACTION ---
const TOPIC_KEYWORDS: Record<string, string[]> = {
    'keuangan': ['keuangan', 'kas', 'saldo', 'iuran', 'bayar', 'transfer', 'uang', 'pemasukan', 'pengeluaran', 'tagihan', 'biaya', 'dana'],
    'keamanan': ['keamanan', 'ronda', 'aman', 'bahaya', 'mencurigakan', 'pencurian', 'lapor', 'polisi', 'kriminal', 'patroli'],
    'jadwal': ['jadwal', 'kapan', 'waktu', 'tanggal', 'acara', 'kegiatan', 'agenda', 'kerja bakti', 'rapat', 'pengajian'],
    'pengumuman': ['pengumuman', 'berita', 'info', 'informasi', 'update', 'terbaru', 'penting', 'notice'],
    'registrasi': ['daftar', 'registrasi', 'register', 'warga baru', 'pindah', 'ktp', 'kk', 'domisili'],
    'layanan': ['surat', 'pengantar', 'dokumen', 'administrasi', 'fotokopi', 'cap', 'stempel', 'tanda tangan'],
    'pengurus': ['ketua', 'sekretaris', 'bendahara', 'pengurus', 'rt', 'rw', 'kontak', 'telepon', 'hubungi', 'whatsapp'],
    'kebersihan': ['sampah', 'bersih', 'kebersihan', 'lingkungan', 'got', 'selokan', 'nyamuk', 'tikus'],
    'umum': [] // fallback
};

export function extractTopic(text: string): string {
    const lower = text.toLowerCase();
    let bestTopic = 'umum';
    let bestScore = 0;

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
        if (topic === 'umum') continue;
        let score = 0;
        for (const kw of keywords) {
            if (lower.includes(kw)) score++;
        }
        if (score > bestScore) {
            bestScore = score;
            bestTopic = topic;
        }
    }
    return bestTopic;
}

export function extractKeywords(text: string): string[] {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    const stopwords = new Set(['yang', 'dan', 'ini', 'itu', 'ada', 'apa', 'untuk', 'dari', 'dengan', 'tidak', 'akan', 'bisa', 'saya', 'kami', 'kita', 'sudah', 'belum', 'mau', 'kalau', 'jika', 'dimana', 'kapan', 'siapa', 'bagaimana', 'gimana', 'tolong', 'mohon', 'dong', 'deh', 'sih', 'nih', 'lagi']);
    return [...new Set(words.filter(w => !stopwords.has(w)))].slice(0, 10);
}

// --- KNOWLEDGE BASE CRUD ---
export function loadKnowledge(): KnowledgeBase {
    try {
        const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        const initial: KnowledgeBase = {
            entries: [],
            metadata: {
                totalFeedback: 0,
                positiveFeedback: 0,
                negativeFeedback: 0,
                positiveRate: 0,
                lastUpdated: new Date().toISOString()
            }
        };
        saveKnowledge(initial);
        return initial;
    }
}

export function saveKnowledge(kb: KnowledgeBase): void {
    kb.metadata.lastUpdated = new Date().toISOString();
    if (kb.metadata.totalFeedback > 0) {
        kb.metadata.positiveRate = Math.round((kb.metadata.positiveFeedback / kb.metadata.totalFeedback) * 100);
    }
    fs.writeFileSync(KNOWLEDGE_PATH, JSON.stringify(kb, null, 2), 'utf-8');
}

export function addKnowledge(question: string, answer: string, chatId: number, username: string): KnowledgeEntry {
    const kb = loadKnowledge();
    const topic = extractTopic(question);
    const keywords = extractKeywords(question);

    // Check for duplicate (similar question from same topic)
    const existing = kb.entries.find(e =>
        e.topic === topic && keywordOverlap(e.keywords, keywords) >= 0.5
    );

    if (existing) {
        // Update existing: boost reward, update answer if reward is higher
        existing.reward += 1;
        existing.usageCount += 1;
        existing.updatedAt = new Date().toISOString();
        // If new answer, keep the one with higher cumulative reward
        if (existing.reward > 2) {
            existing.answer = answer; // update to latest approved answer
        }
        saveKnowledge(kb);
        return existing;
    }

    const entry: KnowledgeEntry = {
        id: `kb-${Date.now()}`,
        question,
        answer,
        topic,
        keywords,
        reward: 1,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chatId,
        username
    };

    kb.entries.push(entry);

    // Keep max 200 entries, remove lowest reward
    if (kb.entries.length > 200) {
        kb.entries.sort((a, b) => b.reward - a.reward);
        kb.entries = kb.entries.slice(0, 200);
    }

    saveKnowledge(kb);
    return entry;
}

export function penalizeKnowledge(question: string): void {
    const kb = loadKnowledge();
    const topic = extractTopic(question);
    const keywords = extractKeywords(question);

    const match = kb.entries.find(e =>
        e.topic === topic && keywordOverlap(e.keywords, keywords) >= 0.5
    );

    if (match) {
        match.reward -= 1;
        match.updatedAt = new Date().toISOString();
        // Remove if reward drops below -3
        if (match.reward < -3) {
            kb.entries = kb.entries.filter(e => e.id !== match.id);
        }
        saveKnowledge(kb);
    }
}

// --- FEW-SHOT SELECTOR ---
export function findRelevantKnowledge(question: string, topN: number = 3): KnowledgeEntry[] {
    const kb = loadKnowledge();
    if (kb.entries.length === 0) return [];

    const topic = extractTopic(question);
    const keywords = extractKeywords(question);

    // Score each entry by: topic match + keyword overlap + reward
    const scored = kb.entries
        .filter(e => e.reward > 0) // only use positively-rated entries
        .map(e => {
            let score = 0;
            // Topic match: +3
            if (e.topic === topic) score += 3;
            // Keyword overlap
            score += keywordOverlap(e.keywords, keywords) * 5;
            // Reward bonus (normalized)
            score += Math.min(e.reward, 5) * 0.5;

            return { entry: e, score };
        })
        .filter(s => s.score > 1) // minimum relevance threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, topN);

    // Update usage count
    if (scored.length > 0) {
        const kb2 = loadKnowledge();
        for (const s of scored) {
            const entry = kb2.entries.find(e => e.id === s.entry.id);
            if (entry) entry.usageCount++;
        }
        saveKnowledge(kb2);
    }

    return scored.map(s => s.entry);
}

export function buildFewShotPrompt(entries: KnowledgeEntry[]): string {
    if (entries.length === 0) return '';

    const examples = entries.map((e, i) =>
        `Contoh ${i + 1}:\nPertanyaan: "${e.question}"\nJawaban yang baik: "${e.answer.slice(0, 300)}"`
    ).join('\n\n');

    return `\n\nBERIKUT CONTOH JAWABAN YANG PERNAH DINILAI BAIK OLEH WARGA:\n${examples}\n\nGunakan gaya dan pendekatan serupa ketika menjawab pertanyaan yang serupa, tapi JANGAN copy-paste. Adaptasi sesuai pertanyaan aktual.`;
}

// --- FEEDBACK LOGGING ---
export function loadFeedbackLog(): FeedbackLog {
    try {
        const raw = fs.readFileSync(FEEDBACK_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        const initial: FeedbackLog = { logs: [] };
        fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(initial, null, 2), 'utf-8');
        return initial;
    }
}

export function logFeedback(chatId: number, question: string, answer: string, type: 'positive' | 'negative'): void {
    const fb = loadFeedbackLog();
    const topic = extractTopic(question);

    fb.logs.push({
        id: `fb-${Date.now()}`,
        chatId,
        question,
        answer: answer.slice(0, 500),
        type,
        topic,
        timestamp: new Date().toISOString()
    });

    // Keep last 500 logs
    if (fb.logs.length > 500) {
        fb.logs = fb.logs.slice(-500);
    }

    fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(fb, null, 2), 'utf-8');

    // Update knowledge base metadata
    const kb = loadKnowledge();
    kb.metadata.totalFeedback++;
    if (type === 'positive') {
        kb.metadata.positiveFeedback++;
    } else {
        kb.metadata.negativeFeedback++;
    }
    saveKnowledge(kb);
}

// --- STATS ---
export function getLearningStats(): {
    totalKnowledge: number;
    totalFeedback: number;
    positiveRate: number;
    topTopics: { topic: string; count: number }[];
    avgReward: number;
} {
    const kb = loadKnowledge();

    const topicCounts: Record<string, number> = {};
    let totalReward = 0;
    for (const e of kb.entries) {
        topicCounts[e.topic] = (topicCounts[e.topic] || 0) + 1;
        totalReward += e.reward;
    }

    const topTopics = Object.entries(topicCounts)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        totalKnowledge: kb.entries.length,
        totalFeedback: kb.metadata.totalFeedback,
        positiveRate: kb.metadata.positiveRate,
        topTopics,
        avgReward: kb.entries.length > 0 ? Math.round((totalReward / kb.entries.length) * 10) / 10 : 0
    };
}

export function getTopKnowledge(n: number = 5): KnowledgeEntry[] {
    const kb = loadKnowledge();
    return kb.entries
        .sort((a, b) => b.reward - a.reward)
        .slice(0, n);
}

// --- HELPERS ---
function keywordOverlap(a: string[], b: string[]): number {
    if (a.length === 0 || b.length === 0) return 0;
    const setA = new Set(a);
    const overlap = b.filter(w => setA.has(w)).length;
    return overlap / Math.max(a.length, b.length);
}
