"use client"

// ViewModel: useSuratViewModel
// State management untuk modul Surat Menyurat
// MVVM Pattern — connects View to SuratRepository

import { useState, useCallback, useEffect } from 'react';
import {
  type LetterTemplateEntity,
  type LetterSubmissionResult,
  validateLetterRequest,
} from '@/models/entities/Surat';
import { getSuratRepository } from '@/models/repositories/SuratRepository';

export interface SuratViewState {
  templates: LetterTemplateEntity[];
  filteredTemplates: LetterTemplateEntity[];
  selectedTemplate: LetterTemplateEntity | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submissionResult: LetterSubmissionResult | null;
  categoryFilter: string | null;
}

export function useSuratViewModel() {
  const [state, setState] = useState<SuratViewState>({
    templates: [],
    filteredTemplates: [],
    selectedTemplate: null,
    isLoading: true,
    isSubmitting: false,
    error: null,
    submissionResult: null,
    categoryFilter: null,
  });

  const repository = getSuratRepository();

  // Load templates
  const loadTemplates = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const templates = await repository.getAll();
      setState(prev => ({
        ...prev,
        templates,
        filteredTemplates: templates,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Gagal memuat template surat: ${error}`,
      }));
    }
  }, [repository]);

  // Filter by category
  const filterByCategory = useCallback((category: string | null) => {
    setState(prev => {
      const filtered = category
        ? prev.templates.filter(t => t.category === category)
        : prev.templates;
      return { ...prev, categoryFilter: category, filteredTemplates: filtered };
    });
  }, []);

  // Select a template
  const selectTemplate = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const template = await repository.getById(id);
      setState(prev => ({
        ...prev,
        selectedTemplate: template,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Gagal memuat detail template: ${error}`,
      }));
    }
  }, [repository]);

  // Submit letter request
  const handleSubmitRequest = useCallback(async (
    templateId: string,
    data: Record<string, string>
  ) => {
    // Validate
    const template = state.templates.find(t => t.id === templateId);
    if (!template) {
      return { success: false, errors: ['Template tidak ditemukan'] };
    }

    const validation = validateLetterRequest(templateId, data, template.requiredFields);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const result = await repository.submitRequest(templateId, data);
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        submissionResult: result,
      }));
      return { success: result.success, errors: result.message ? [result.message] : [] };
    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }));
      return { success: false, errors: [`Gagal mengirim permohonan: ${error}`] };
    }
  }, [repository, state.templates]);

  // Get download URL
  const getDownloadUrl = useCallback((templateId: string, format: 'docx' | 'pdf') => {
    return repository.getDownloadUrl(templateId, format);
  }, [repository]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedTemplate: null,
      submissionResult: null,
    }));
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    // State
    ...state,

    // Actions
    loadTemplates,
    filterByCategory,
    selectTemplate,
    handleSubmitRequest,
    getDownloadUrl,
    clearSelection,
  };
}
