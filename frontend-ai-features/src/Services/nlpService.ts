// Implements NLP analysis, data crawling, and conclusion generation
import { secureFetch } from "@/lib/security";

export interface NLPResult {
    summary: string[];
    sentiment: {
        label: string;
        score: number;
        confidence: number;
    };
    entities: {
        type: string;
        value: string;
        position: number;
    }[];
    conclusion: string;
    wordCount: number;
    tokenCount: number;
}

export interface CrawlData {
    sources: string[];
    totalDocuments: number;
    combinedContent: string;
    extractedInfo: {
        financialData: string[];
        securityData: string[];
        administrationData: string[];
        newsData: string[];
    };
    sourceMetadata: {
        source: string;
        description: string;
        documentCount: number;
    }[];
}

export interface DataSource {
    id: string;
    name: string;
    description: string;
    lastCrawl: string;
    documentCount: number;
}

export const nlpService = {
    /**
     * Get NLP service info and supported tasks
     */
    async getServiceInfo(): Promise<{
        service: string;
        model: string;
        supportedTasks: string[];
        methodology: Record<string, unknown>;
    }> {
        const response = await secureFetch('/api/nlp');
        const data = await response.json();
        return data;
    },

    /**
     * Perform full NLP analysis on text
     */
    async analyzeText(text: string, context: string = 'general'): Promise<NLPResult> {
        const response = await secureFetch('/api/nlp', {
            method: 'POST',
            body: JSON.stringify({
                text,
                context,
                task: 'full',
            }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'NLP analysis failed');
        }
        return data.data;
    },

    /**
     * Get text summarization only
     */
    async summarize(text: string): Promise<string[]> {
        const response = await secureFetch('/api/nlp', {
            method: 'POST',
            body: JSON.stringify({
                text,
                task: 'summarization',
            }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Summarization failed');
        }
        return data.data.summary;
    },

    /**
     * Get sentiment analysis only
     */
    async analyzeSentiment(text: string): Promise<{
        label: string;
        score: number;
        confidence: number;
    }> {
        const response = await secureFetch('/api/nlp', {
            method: 'POST',
            body: JSON.stringify({
                text,
                task: 'sentiment',
            }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Sentiment analysis failed');
        }
        return data.data.sentiment;
    },

    /**
     * Get named entity recognition only
     */
    async extractEntities(text: string): Promise<{
        type: string;
        value: string;
        position: number;
    }[]> {
        const response = await secureFetch('/api/nlp', {
            method: 'POST',
            body: JSON.stringify({
                text,
                task: 'ner',
            }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'NER failed');
        }
        return data.data.entities;
    },

    /**
     * List available data sources for crawling
     */
    async listDataSources(): Promise<DataSource[]> {
        const response = await secureFetch('/api/crawler?action=list');
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to list data sources');
        }
        return data.data.availableSources;
    },

    /**
     * Crawl data from specified sources
     */
    async crawlData(sources?: string[]): Promise<CrawlData> {
        const response = await secureFetch('/api/crawler', {
            method: 'POST',
            body: JSON.stringify({ sources }),
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Data crawling failed');
        }
        return data.data;
    },

    /**
     * Crawl data from a specific source
     */
    async crawlSource(source: string): Promise<{
        content: string;
        metadata: Record<string, unknown>;
    }> {
        const response = await secureFetch(`/api/crawler?action=crawl&source=${source}`);
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to crawl source');
        }
        return data.data;
    },

    /**
     * Extract key information from all sources
     */
    async extractKeyInfo(): Promise<{
        financialData: string[];
        securityData: string[];
        administrationData: string[];
        newsData: string[];
    }> {
        const response = await secureFetch('/api/crawler?action=extract');
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to extract key info');
        }
        return data.data.extractedData;
    },

    /**
     * Full pipeline: Crawl data + NLP analysis
     */
    async runFullPipeline(sources: string[], context: string = 'general'): Promise<{
        crawlData: CrawlData;
        nlpResult: NLPResult;
    }> {
        // Step 1: Crawl data
        const crawlData = await this.crawlData(sources);

        // Step 2: Analyze with NLP
        const nlpResult = await this.analyzeText(crawlData.combinedContent, context);

        return { crawlData, nlpResult };
    },
};

export default nlpService;
