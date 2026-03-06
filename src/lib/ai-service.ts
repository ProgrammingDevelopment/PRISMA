/**
 * PRISMA AI Service Client
 * Calls local Ollama AI via /api/chat endpoint
 * Falls back to mock responses when backend is unavailable
 */

// Types
export interface SentimentResult {
    text: string;
    sentiment: 'positif' | 'netral' | 'negatif';
    confidence: number;
    method: string;
}

export interface ChatResponse {
    user_input: string;
    response: string;
    intent: string;
    confidence: number;
}

export interface PredictionResult {
    predictions: number[];
    months_ahead: number;
    trend: 'naik' | 'turun' | 'stabil';
    confidence: number;
}

export interface ChurnPrediction {
    warga_id: string;
    churn_probability: number;
    risk_level: 'tinggi' | 'sedang' | 'rendah';
}

export interface ActivityRecommendation {
    id: string;
    name: string;
    score: number;
    reason?: string;
}

export interface ClusterResult {
    citizen_id: string;
    segment: string;
    segment_id: number;
}

// Mock responses for surat-related queries (fallback)
const SURAT_RESPONSES: Record<string, string> = {
    'domisili': 'Untuk Surat Keterangan Domisili, Anda memerlukan: nama lengkap, alamat, dan lama tinggal. Silakan download template "Surat Keterangan Domisili" di daftar template.',
    'sktm': 'Untuk SKTM (Surat Keterangan Tidak Mampu), Anda perlu menyiapkan: nama, alamat, pekerjaan, dan penghasilan. Template tersedia di kategori Administrasi.',
    'pindah': 'Untuk Surat Pengantar Pindah Domisili, siapkan: nama, alamat asal, alamat tujuan, dan alasan pindah.',
    'kematian': 'Untuk Surat Keterangan Kematian, diperlukan: nama almarhum, tanggal meninggal, tempat meninggal, dan penyebab.',
    'umum': 'Untuk Surat Keterangan RT Umum/Kelakuan Baik, cukup siapkan: nama, alamat, dan keperluan surat.',
    'keamanan': 'Untuk Laporan Keamanan, Anda perlu mengisi: kronologi kejadian, tanggal kejadian, nama pelapor, dan nomor telepon.',
};

// API Client — Real Ollama + Mock Fallback
class AIServiceClient {
    private chatApiUrl = '/api/chat';

    /**
     * Chat with PRISMA virtual assistant (Ollama AI)
     * Falls back to mock if backend is unavailable
     */
    async chat(message: string): Promise<ChatResponse> {
        try {
            const res = await fetch(this.chatApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            });

            if (res.ok) {
                const data = await res.json();
                return {
                    user_input: message,
                    response: data.reply || 'Tidak ada respons.',
                    intent: 'ai_response',
                    confidence: 0.95
                };
            }
        } catch {
            // Fall through to mock
        }

        // Fallback: simple keyword matching
        return this._mockChat(message);
    }

    private _mockChat(message: string): ChatResponse {
        const lowerMessage = message.toLowerCase();
        let response = 'Silakan cari template surat yang Anda butuhkan di daftar template di atas. Gunakan fitur pencarian untuk menemukan surat yang sesuai.';
        let intent = 'general';

        for (const [key, value] of Object.entries(SURAT_RESPONSES)) {
            if (lowerMessage.includes(key)) {
                response = value;
                intent = `surat_${key}`;
                break;
            }
        }

        if (lowerMessage.includes('cara') || lowerMessage.includes('bagaimana')) {
            response = 'Untuk menggunakan template surat:\n1. Download template dalam format .docx atau .pdf\n2. Isi field yang diperlukan\n3. Cetak dan serahkan ke sekretariat RT\n4. Ambil surat yang sudah jadi dalam 1-2 hari kerja';
            intent = 'how_to';
        }

        if (lowerMessage.includes('bantuan') || lowerMessage.includes('help')) {
            response = 'Saya bisa membantu Anda mencari template surat yang tepat. Ceritakan kebutuhan Anda, misalnya: "saya butuh surat domisili" atau "cara buat SKTM".';
            intent = 'help';
        }

        return {
            user_input: message,
            response,
            intent,
            confidence: 0.7
        };
    }

    /**
     * Analyze sentiment (Mock)
     */
    async analyzeSentiment(text: string): Promise<SentimentResult> {
        return {
            text,
            sentiment: 'netral',
            confidence: 0.75,
            method: 'mock'
        };
    }

    /**
     * Check if AI backend (Ollama) is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            const res = await fetch(this.chatApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'ping' }),
            });
            return res.ok;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const aiService = new AIServiceClient();

// Export class for custom instances
export { AIServiceClient };

// Utility functions
export function getSentimentColor(sentiment: string): string {
    const colors: Record<string, string> = {
        positif: 'text-green-600 bg-green-100',
        netral: 'text-gray-600 bg-gray-100',
        negatif: 'text-red-600 bg-red-100',
    };
    return colors[sentiment] || colors.netral;
}

export function getRiskColor(riskLevel: string): string {
    const colors: Record<string, string> = {
        tinggi: 'text-red-600 bg-red-100',
        sedang: 'text-yellow-600 bg-yellow-100',
        rendah: 'text-green-600 bg-green-100',
    };
    return colors[riskLevel] || colors.rendah;
}

export function getTrendIcon(trend: string): string {
    const icons: Record<string, string> = {
        naik: '📈',
        turun: '📉',
        stabil: '➡️',
    };
    return icons[trend] || icons.stabil;
}
