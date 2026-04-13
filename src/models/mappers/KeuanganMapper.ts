// KeuanganMapper — Maps between data transfer objects and domain entities
// Handles snake_case (MockDB) ↔ camelCase (Entity) conversion

import {
  type TransactionEntity,
  type MonthlyReportEntity,
  type ExpenseSummaryEntity,
  formatRupiah,
} from '../entities/Keuangan';

// DTO from MockDB (snake_case)
export interface MonthlyReportDTO {
  bulan: string;
  tahun: number;
  saldo_awal: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
  transaksi: TransactionDTO[];
}

export interface TransactionDTO {
  id: string;
  tanggal: string;
  keterangan: string;
  kategori: string;
  tipe: 'pemasukan' | 'pengeluaran';
  jumlah: number;
}

export interface ExpenseSummaryDTO {
  avgMonthlyExpense: number;
  categories: ExpenseCategoryDTO[];
}

export interface ExpenseCategoryDTO {
  kategori: string;
  persentase: number;
  avgBulanan: number;
  keterangan: string;
  kategori_normalized?: string;
}

// Display model for UI
export interface MonthlyReportDisplayModel {
  bulan: string;
  tahun: number;
  saldoAwalFormatted: string;
  totalPemasukanFormatted: string;
  totalPengeluaranFormatted: string;
  saldoAkhirFormatted: string;
  isDeficit: boolean;
  transaksiCount: number;
}

/**
 * Map DTO → Entity
 */
export function toReportEntity(dto: MonthlyReportDTO): MonthlyReportEntity {
  return {
    bulan: dto.bulan,
    tahun: dto.tahun,
    saldoAwal: dto.saldo_awal,
    totalPemasukan: dto.total_pemasukan,
    totalPengeluaran: dto.total_pengeluaran,
    saldoAkhir: dto.saldo_akhir,
    transaksi: dto.transaksi.map(toTransactionEntity),
  };
}

export function toTransactionEntity(dto: TransactionDTO): TransactionEntity {
  return {
    id: dto.id,
    tanggal: dto.tanggal,
    keterangan: dto.keterangan,
    kategori: dto.kategori,
    tipe: dto.tipe,
    jumlah: dto.jumlah,
  };
}

export function toExpenseSummaryEntity(dto: ExpenseSummaryDTO): ExpenseSummaryEntity {
  return {
    avgMonthlyExpense: dto.avgMonthlyExpense,
    categories: dto.categories.map(c => ({
      kategori: c.kategori,
      persentase: c.persentase,
      avgBulanan: c.avgBulanan,
      keterangan: c.keterangan,
      kategoriNormalized: c.kategori_normalized,
    })),
  };
}

/**
 * Map Entity → Display Model (for UI rendering)
 */
export function toReportDisplayModel(entity: MonthlyReportEntity): MonthlyReportDisplayModel {
  return {
    bulan: entity.bulan,
    tahun: entity.tahun,
    saldoAwalFormatted: formatRupiah(entity.saldoAwal),
    totalPemasukanFormatted: formatRupiah(entity.totalPemasukan),
    totalPengeluaranFormatted: formatRupiah(entity.totalPengeluaran),
    saldoAkhirFormatted: formatRupiah(entity.saldoAkhir),
    isDeficit: entity.totalPengeluaran > entity.totalPemasukan,
    transaksiCount: entity.transaksi.length,
  };
}

/**
 * Batch convert
 */
export function toReportEntityList(dtos: MonthlyReportDTO[]): MonthlyReportEntity[] {
  return dtos.map(toReportEntity);
}

export function toReportDisplayModelList(entities: MonthlyReportEntity[]): MonthlyReportDisplayModel[] {
  return entities.map(toReportDisplayModel);
}
