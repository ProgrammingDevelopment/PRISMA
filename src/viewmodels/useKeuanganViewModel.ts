"use client"

// ViewModel: useKeuanganViewModel
// State management untuk modul Keuangan (Laporan, Iuran, Pembayaran)
// MVVM Pattern — connects View to KeuanganRepository

import { useState, useCallback, useEffect } from 'react';
import {
  type MonthlyReportEntity,
  type ExpenseSummaryEntity,
  type BalanceInfo,
} from '@/models/entities/Keuangan';
import { getKeuanganRepository } from '@/models/repositories/KeuanganRepository';

export interface KeuanganViewState {
  reports: MonthlyReportEntity[];
  selectedReport: MonthlyReportEntity | null;
  balance: BalanceInfo;
  expenseSummary: ExpenseSummaryEntity;
  isLoading: boolean;
  error: string | null;
  selectedPeriod: { bulan: string; tahun: number } | null;
}

export function useKeuanganViewModel() {
  const [state, setState] = useState<KeuanganViewState>({
    reports: [],
    selectedReport: null,
    balance: { saldo: 0, lastUpdate: '-' },
    expenseSummary: { avgMonthlyExpense: 0, categories: [] },
    isLoading: true,
    error: null,
    selectedPeriod: null,
  });

  const repository = getKeuanganRepository();

  // Load all financial data
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [reports, balance, expenseSummary] = await Promise.all([
        repository.getAll(),
        repository.getBalance(),
        repository.getExpenseSummary(),
      ]);

      setState(prev => ({
        ...prev,
        reports,
        balance,
        expenseSummary,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Gagal memuat data keuangan: ${error}`,
      }));
    }
  }, [repository]);

  // Select specific month report
  const selectPeriod = useCallback(async (bulan: string, tahun: number) => {
    setState(prev => ({ ...prev, isLoading: true, selectedPeriod: { bulan, tahun } }));
    try {
      const report = await repository.getByPeriod(bulan, tahun);
      setState(prev => ({
        ...prev,
        selectedReport: report,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Gagal memuat laporan ${bulan} ${tahun}: ${error}`,
      }));
    }
  }, [repository]);

  // Clear selected period
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedReport: null,
      selectedPeriod: null,
    }));
  }, []);

  // Get total income for all periods
  const getTotalIncome = useCallback((): number => {
    return state.reports.reduce((sum, r) => sum + r.totalPemasukan, 0);
  }, [state.reports]);

  // Get total expenses for all periods
  const getTotalExpenses = useCallback((): number => {
    return state.reports.reduce((sum, r) => sum + r.totalPengeluaran, 0);
  }, [state.reports]);

  // Auto-load on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // State
    ...state,

    // Actions
    loadData,
    selectPeriod,
    clearSelection,

    // Computed
    getTotalIncome,
    getTotalExpenses,
  };
}
