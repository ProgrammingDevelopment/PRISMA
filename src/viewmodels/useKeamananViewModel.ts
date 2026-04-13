"use client"

// ViewModel: useKeamananViewModel
// State management untuk modul Keamanan (Laporan, Statistik)
// MVVM Pattern — connects View to KeamananRepository

import { useState, useCallback, useEffect } from 'react';
import {
  type SecurityReportEntity,
  type SecurityStatsEntity,
  type IncidentTypeEntity,
  type SecurityReportSubmission,
  validateSecurityReport,
} from '@/models/entities/Keamanan';
import { getKeamananRepository } from '@/models/repositories/KeamananRepository';

export interface KeamananViewState {
  reports: SecurityReportEntity[];
  stats: SecurityStatsEntity;
  incidentTypes: IncidentTypeEntity[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submitSuccess: boolean;
}

export function useKeamananViewModel() {
  const [state, setState] = useState<KeamananViewState>({
    reports: [],
    stats: { total: 0, pending: 0, resolved: 0, byPriority: { High: 0, Medium: 0, Low: 0 } },
    incidentTypes: [],
    isLoading: true,
    isSubmitting: false,
    error: null,
    submitSuccess: false,
  });

  const repository = getKeamananRepository();

  // Load all security data
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [reports, stats] = await Promise.all([
        repository.getAll(),
        repository.getStats(),
      ]);

      const incidentTypes = repository.getIncidentTypes();

      setState(prev => ({
        ...prev,
        reports,
        stats,
        incidentTypes,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Gagal memuat data keamanan: ${error}`,
      }));
    }
  }, [repository]);

  // Submit a new security report
  const handleSubmitReport = useCallback(async (submission: SecurityReportSubmission) => {
    // Validate
    const validation = validateSecurityReport(submission);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const result = await repository.submitReport(submission);

      if (result.success) {
        setState(prev => ({ ...prev, isSubmitting: false, submitSuccess: true }));
        await loadData(); // Refresh data
        return {
          success: true,
          errors: [],
          reportId: result.data?.reportId,
          priority: result.data?.priority,
        };
      }

      setState(prev => ({ ...prev, isSubmitting: false }));
      return { success: false, errors: [result.error ?? 'Submit gagal'] };
    } catch (error) {
      setState(prev => ({ ...prev, isSubmitting: false }));
      return { success: false, errors: [`Gagal mengirim laporan: ${error}`] };
    }
  }, [repository, loadData]);

  // Reset submit success flag
  const resetSubmitState = useCallback(() => {
    setState(prev => ({ ...prev, submitSuccess: false, error: null }));
  }, []);

  // Auto-load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    ...state,

    // Actions
    loadData,
    handleSubmitReport,
    resetSubmitState,
  };
}
