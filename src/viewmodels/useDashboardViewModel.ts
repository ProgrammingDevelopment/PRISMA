"use client"

// ViewModel: useDashboardViewModel
// State management untuk Dashboard — aggregates data from multiple repositories
// MVVM Pattern

import { useState, useCallback, useEffect } from 'react';
import { type StatistikWarga } from '@/models/entities/Warga';
import { type BalanceInfo } from '@/models/entities/Keuangan';
import { type SecurityStatsEntity } from '@/models/entities/Keamanan';
import { getWargaRepository } from '@/models/repositories/WargaRepository';
import { getKeuanganRepository } from '@/models/repositories/KeuanganRepository';
import { getKeamananRepository } from '@/models/repositories/KeamananRepository';

export interface DashboardViewState {
  statistikWarga: StatistikWarga;
  balanceInfo: BalanceInfo;
  securityStats: SecurityStatsEntity;
  isLoading: boolean;
  error: string | null;
  lastRefresh: string | null;
}

export function useDashboardViewModel() {
  const [state, setState] = useState<DashboardViewState>({
    statistikWarga: { totalWarga: 0, totalKK: 0, wargaAktif: 0, pendatangBaru: 0 },
    balanceInfo: { saldo: 0, lastUpdate: '-' },
    securityStats: { total: 0, pending: 0, resolved: 0, byPriority: { High: 0, Medium: 0, Low: 0 } },
    isLoading: true,
    error: null,
    lastRefresh: null,
  });

  const wargaRepo = getWargaRepository();
  const keuanganRepo = getKeuanganRepository();
  const keamananRepo = getKeamananRepository();

  // Load all dashboard data concurrently
  const loadDashboard = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [statistikWarga, balanceInfo, securityStats] = await Promise.all([
        wargaRepo.getStatistik(),
        keuanganRepo.getBalance(),
        keamananRepo.getStats(),
      ]);

      setState(prev => ({
        ...prev,
        statistikWarga,
        balanceInfo,
        securityStats,
        isLoading: false,
        lastRefresh: new Date().toLocaleTimeString('id-ID'),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Gagal memuat data dashboard: ${error}`,
      }));
    }
  }, [wargaRepo, keuanganRepo, keamananRepo]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  // Auto-load on mount
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    // State
    ...state,

    // Actions
    refresh,
    loadDashboard,
  };
}
