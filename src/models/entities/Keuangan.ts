// Model Entity: Keuangan
// Domain entity untuk transaksi keuangan dan laporan bulanan

export interface TransactionEntity {
  id: string;
  tanggal: string;
  keterangan: string;
  kategori: string;
  tipe: TransactionType;
  jumlah: number;
  createdAt?: string;
}

export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface MonthlyReportEntity {
  bulan: string;
  tahun: number;
  saldoAwal: number;
  totalPemasukan: number;
  totalPengeluaran: number;
  saldoAkhir: number;
  transaksi: TransactionEntity[];
}

export interface ExpenseCategoryEntity {
  kategori: string;
  persentase: number;
  avgBulanan: number;
  keterangan: string;
  kategoriNormalized?: string;
}

export interface ExpenseSummaryEntity {
  avgMonthlyExpense: number;
  categories: ExpenseCategoryEntity[];
}

export interface BalanceInfo {
  saldo: number;
  lastUpdate: string;
}

// Factory function
export function createTransaction(data: Partial<TransactionEntity>): TransactionEntity {
  return {
    id: data.id ?? crypto.randomUUID?.() ?? `txn-${Date.now()}`,
    tanggal: data.tanggal ?? new Date().toISOString().split('T')[0],
    keterangan: data.keterangan ?? '',
    kategori: data.kategori ?? 'Lainnya',
    tipe: data.tipe ?? 'pengeluaran',
    jumlah: data.jumlah ?? 0,
    createdAt: data.createdAt ?? new Date().toISOString(),
  };
}

// Validation
export function validateTransaction(txn: Partial<TransactionEntity>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!txn.keterangan || txn.keterangan.trim().length < 3) {
    errors.push('Keterangan minimal 3 karakter');
  }

  if (!txn.tanggal) {
    errors.push('Tanggal wajib diisi');
  }

  if (txn.tipe && !['pemasukan', 'pengeluaran'].includes(txn.tipe)) {
    errors.push('Tipe transaksi tidak valid');
  }

  if (txn.jumlah === undefined || txn.jumlah < 0) {
    errors.push('Jumlah harus lebih dari 0');
  }

  return { valid: errors.length === 0, errors };
}

// Compute balance from report
export function computeBalance(reports: MonthlyReportEntity[]): BalanceInfo {
  if (reports.length === 0) {
    return { saldo: 0, lastUpdate: '-' };
  }
  const latest = reports[0];
  return {
    saldo: latest.saldoAkhir,
    lastUpdate: `${latest.bulan} ${latest.tahun}`,
  };
}

// Format currency to Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
