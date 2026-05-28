// AIApiClient — REST API client for AI microservice

import { createApiClient, type ApiResponse } from './ApiClient';

export interface ChatRequest {
  message: string;
  history?: { role: string; content: string }[];
  context?: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  tokensUsed?: number;
}

export interface NLPAnalysisRequest {
  text: string;
  context?: string;
  task?: 'full' | 'sentiment' | 'summarization' | 'ner';
}

export interface NLPAnalysisResponse {
  summary?: string[];
  sentiment?: { label: string; score: number; confidence: number };
  entities?: { type: string; value: string; position: number }[];
  conclusion?: string;
}

const client = createApiClient('/ai');

export const AIApiClient = {
  async chat(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return client.post<ChatResponse>('/chat', request);
  },

  async analyzeText(request: NLPAnalysisRequest): Promise<ApiResponse<NLPAnalysisResponse>> {
    return client.post<NLPAnalysisResponse>('/nlp/analyze', request);
  },

  async analyzeSentiment(text: string): Promise<ApiResponse<{ label: string; score: number }>> {
    return client.post<{ label: string; score: number }>('/nlp/sentiment', { text });
  },

  async healthCheck(): Promise<boolean> {
    return client.healthCheck();
  },
};
