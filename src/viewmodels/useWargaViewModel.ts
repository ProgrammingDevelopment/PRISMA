"use client"

// ViewModel: useWargaViewModel
// State management dan business logic untuk modul Warga
// MVVM Pattern — connects View (page.tsx) to Model (WargaRepository)

import { useState, useCallback, useEffect } from 'react';
import { type WargaEntity, type StatistikWarga, validateWarga } from '@/models/entities/Warga';
import { getWargaRepository } from '@/models/repositories/WargaRepository';
import type { PengurusEntity } from '@/models/entities/Warga';

export interface WargaViewState {
  wargaList: WargaEntity[];
  filteredWarga: WargaEntity[];
  pengurus: PengurusEntity[];
  statistik: StatistikWarga;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedWarga: WargaEntity | null;
}

export function useWargaViewModel() {
  const [state, setState] = useState<WargaViewState>({
    wargaList: [],
    filteredWarga: [],
    pengurus: [],
    statistik: { totalWarga: 0, totalKK: 0, wargaAktif: 0, pendatangBaru: 0 },
    isLoading: true,
    error: null,
    searchQuery: '',
    selectedWarga: null,
  });

  const repository = getWargaRepository();

  // Load initial data
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const [wargaList, pengurus, statistik] = await Promise.all([
        repository.getAll(),
        repository.getPengurus(),
        repository.getStatistik(),
      ]);

      setState(prev => ({
        ...prev,
        wargaList,
        filteredWarga: wargaList,
        pengurus,
        statistik,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Gagal memuat data warga: ${error}`,
      }));
    }
  }, [repository]);

  // Search/filter warga
  const handleSearch = useCallback((query: string) => {
    setState(prev => {
      const lowerQuery = query.toLowerCase();
      const filtered = query.trim()
        ? prev.wargaList.filter(w =>
            w.nama.toLowerCase().includes(lowerQuery) ||
            w.alamat.toLowerCase().includes(lowerQuery) ||
            w.status.toLowerCase().includes(lowerQuery)
          )
        : prev.wargaList;

      return { ...prev, searchQuery: query, filteredWarga: filtered };
    });
  }, []);

  // Add new warga
  const handleAddWarga = useCallback(async (data: Partial<WargaEntity>) => {
    const validation = validateWarga(data);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await repository.create(data);
      if (result.success) {
        await loadData(); // Refresh data
      }
      return { success: result.success, errors: result.error ? [result.error] : [] };
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, errors: [`Gagal menambah warga: ${error}`] };
    }
  }, [repository, loadData]);

  // Select warga for detail view
  const handleSelectWarga = useCallback((warga: WargaEntity | null) => {
    setState(prev => ({ ...prev, selectedWarga: warga }));
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
    handleSearch,
    handleAddWarga,
    handleSelectWarga,
  };
}
