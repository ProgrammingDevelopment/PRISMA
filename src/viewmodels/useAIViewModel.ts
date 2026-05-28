"use client"

// ViewModel: useAIViewModel
// State management untuk modul AI Chat (Siaga Assistant)
// MVVM Pattern

import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIViewState {
  messages: ChatMessage[];
  isThinking: boolean;
  error: string | null;
  isOpen: boolean;
}

const MAX_HISTORY = 50;

export function useAIViewModel() {
  const [state, setState] = useState<AIViewState>({
    messages: [],
    isThinking: false,
    error: null,
    isOpen: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Send a message to AI
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage.trim(),
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg].slice(-MAX_HISTORY),
      isThinking: true,
      error: null,
    }));

    try {
      // Import AI service dynamically
      const { aiService } = await import('@/lib/ai-service');

      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await aiService.chat(userMessage);

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response?.response || 'Maaf, saya tidak dapat merespons saat ini.',
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMsg].slice(-MAX_HISTORY),
        isThinking: false,
      }));
    } catch (error) {
      // Fallback response
      const fallbackMsg: ChatMessage = {
        id: `ai-fallback-${Date.now()}`,
        role: 'assistant',
        content: 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti atau hubungi pengurus RT.',
        timestamp: Date.now(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, fallbackMsg].slice(-MAX_HISTORY),
        isThinking: false,
        error: `AI error: ${error}`,
      }));
    }
  }, []);

  // Toggle chat window
  const toggleChat = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  }, []);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(prev => ({ ...prev, isThinking: false }));
  }, []);

  return {
    // State
    ...state,

    // Actions
    sendMessage,
    toggleChat,
    clearHistory,
    cancelRequest,
  };
}
