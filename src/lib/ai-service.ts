/**
 * PRISMA AI Service Client
 * Client untuk mengakses semua fitur AI dari frontend
 */
import { secureFetch } from "./security";

const AI_API_BASE = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000/api/v1';

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

// API Client
class AIServiceClient {
    private baseUrl: string;

    constructor(baseUrl: string = AI_API_BASE) {
        this.baseUrl = baseUrl;
    }

    // Helper method
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await secureFetch(url, {
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `API Error: ${response.status}`);
        }

        return response.json();
    }

    // ==================== NLP ====================

    /**
     * Analyze sentiment of text
     */
    async analyzeSentiment(text: string): Promise<SentimentResult> {
        return this.request<SentimentResult>('/nlp/sentiment', {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    }

    /**
     * Analyze sentiment of multiple texts
     */
    async analyzeSentimentBatch(texts: string[]): Promise<{ results: SentimentResult[]; count: number }> {
        return this.request('/nlp/sentiment/batch', {
            method: 'POST',
            body: JSON.stringify({ texts }),
        });
    }

    /**
     * Chat with PRISMA virtual assistant
     */
    async chat(message: string, useAi: boolean = false): Promise<ChatResponse> {
        return this.request<ChatResponse>('/nlp/chat', {
            method: 'POST',
            body: JSON.stringify({ message, use_ai: useAi }),
        });
    }

    /**
     * Summarize text
     */
    async summarize(text: string, maxLength: number = 150): Promise<{
        original_text: string;
        summary: string;
        compression_ratio: number;
    }> {
        return this.request(`/nlp/summarize?max_length=${maxLength}`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    }

    /**
     * Translate text
     */
    async translate(text: string, sourceLang: string = 'id', targetLang: string = 'en'): Promise<{
        original_text: string;
        translated_text: string;
        source_lang: string;
        target_lang: string;
    }> {
        return this.request(`/nlp/translate?source_lang=${sourceLang}&target_lang=${targetLang}`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        });
    }

    // ==================== Vision ====================

    /**
     * Classify image
     */
    async classifyImage(file: File): Promise<{
        filename: string;
        predictions: {
            predicted_class: string;
            confidence: number;
            top_5: Array<{ class: string; confidence: number }>;
        };
    }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}/vision/classify`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Classification failed: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Detect objects in image
     */
    async detectObjects(file: File): Promise<{
        filename: string;
        detections: {
            num_detections: number;
            detections: Array<{
                class: string;
                confidence: number;
                bbox: { x1: number; y1: number; x2: number; y2: number };
            }>;
        };
    }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}/vision/detect`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Detection failed: ${response.status}`);
        }

        return response.json();
    }

    // ==================== Prediction ====================

    /**
     * Predict financial trends
     */
    async predictFinancial(monthsAhead: number = 6): Promise<PredictionResult> {
        return this.request(`/predict/financial?months_ahead=${monthsAhead}`, {
            method: 'POST',
        });
    }

    /**
     * Predict churn risk for citizens
     */
    async predictChurn(wargaData: Array<Record<string, unknown>>): Promise<{
        predictions: ChurnPrediction[];
        at_risk_count: number;
    }> {
        return this.request('/predict/churn', {
            method: 'POST',
            body: JSON.stringify(wargaData),
        });
    }

    /**
     * Predict activity participation
     */
    async predictActivity(eventData: Record<string, unknown>): Promise<{
        event: string;
        predicted_participation_rate: number;
        predicted_attendance: number;
        recommendations: string[];
    }> {
        return this.request('/predict/activity', {
            method: 'POST',
            body: JSON.stringify(eventData),
        });
    }

    // ==================== Clustering ====================

    /**
     * Cluster citizens into segments
     */
    async clusterCitizens(
        citizenData: Array<Record<string, unknown>>,
        nClusters: number = 4
    ): Promise<{
        clusters: ClusterResult[];
        n_clusters: number;
        segment_distribution: Record<string, number>;
    }> {
        return this.request(`/cluster/citizens?n_clusters=${nClusters}`, {
            method: 'POST',
            body: JSON.stringify(citizenData),
        });
    }

    // ==================== Recommendation ====================

    /**
     * Get activity recommendations for a citizen
     */
    async getActivityRecommendations(wargaId: string, n: number = 5): Promise<{
        warga_id: string;
        recommendations: ActivityRecommendation[];
        method: string;
    }> {
        return this.request(`/recommend/activities/${wargaId}?n=${n}`);
    }

    // ==================== Model Status ====================

    /**
     * Get status of all AI models
     */
    async getModelStatus(): Promise<{
        models: Record<string, { status: string; type: string }>;
        frameworks: Record<string, string>;
    }> {
        return this.request('/models/status');
    }

    /**
     * Check if AI backend is healthy
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`);
            return response.ok;
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
