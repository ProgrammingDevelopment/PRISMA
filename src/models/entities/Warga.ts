// Model Entity: Warga
// Domain entity untuk data kependudukan warga RT 04

export interface WargaEntity {
  id: number;
  nama: string;
  alamat: string;
  status: WargaStatus;
  telepon: string;
  createdAt?: string;
}

export type WargaStatus = 'Tetap' | 'Kontrak' | 'Kost' | 'Baru';

export interface PengurusEntity {
  id: number;
  nama: string;
  jabatan: string;
  periode: string;
  kontak?: string;
}

export interface StatistikWarga {
  totalWarga: number;
  totalKK: number;
  wargaAktif: number;
  pendatangBaru: number;
}

// Factory function
export function createWargaEntity(data: Partial<WargaEntity>): WargaEntity {
  return {
    id: data.id ?? 0,
    nama: data.nama ?? '',
    alamat: data.alamat ?? '',
    status: (data.status as WargaStatus) ?? 'Baru',
    telepon: data.telepon ?? '',
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

// Validation
export function validateWarga(warga: Partial<WargaEntity>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!warga.nama || warga.nama.trim().length < 2) {
    errors.push('Nama warga minimal 2 karakter');
  }

  if (warga.status && !['Tetap', 'Kontrak', 'Kost', 'Baru'].includes(warga.status)) {
    errors.push('Status tidak valid');
  }

  if (warga.telepon && !/^[0-9+\-\s]{8,15}$/.test(warga.telepon)) {
    errors.push('Format nomor telepon tidak valid');
  }

  return { valid: errors.length === 0, errors };
}

// Compute statistics from warga list
export function computeStatistik(wargaList: WargaEntity[]): StatistikWarga {
  return {
    totalWarga: wargaList.length,
    totalKK: Math.floor(wargaList.length / 3) + 1,
    wargaAktif: wargaList.filter(w => w.status === 'Tetap').length,
    pendatangBaru: wargaList.filter(w => w.status === 'Baru' || w.status === 'Kontrak').length,
  };
}
