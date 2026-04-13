// KeuanganRepository — Data access for Keuangan domain
// Delegates to MockDB (local JSON data)

import { BaseRepository, QueryResult } from './BaseRepository';
import {
  type MonthlyReportEntity,
  type ExpenseSummaryEntity,
  type BalanceInfo,
  computeBalance,
} from '../entities/Keuangan';

const getMockDB = async () => {
  if (typeof window === 'undefined') return null;
  const { MockDB } = await import('@/lib/mockDatabase');
  return MockDB;
};

export class KeuanganRepository extends BaseRepository<MonthlyReportEntity, string> {
  async getAll(): Promise<MonthlyReportEntity[]> {
    const MockDB = await getMockDB();
    if (!MockDB) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reports = MockDB.getFinanceReports() as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return reports.map((r: any) => ({
      bulan: r.bulan as string,
      tahun: r.tahun as number,
      saldoAwal: (r.saldo_awal ?? r.saldoAwal ?? 0) as number,
      totalPemasukan: (r.total_pemasukan ?? r.totalPemasukan ?? 0) as number,
      totalPengeluaran: (r.total_pengeluaran ?? r.totalPengeluaran ?? 0) as number,
      saldoAkhir: (r.saldo_akhir ?? r.saldoAkhir ?? 0) as number,
      transaksi: ((r.transaksi as Array<Record<string, unknown>>) ?? []).map(t => ({
        id: (t.id as string) ?? '',
        tanggal: (t.tanggal as string) ?? '',
        keterangan: (t.keterangan as string) ?? '',
        kategori: (t.kategori as string) ?? '',
        tipe: (t.tipe as 'pemasukan' | 'pengeluaran') ?? 'pengeluaran',
        jumlah: (t.jumlah as number) ?? 0,
      })),
    }));
  }

  async getById(id: string): Promise<MonthlyReportEntity | null> {
    // id = "bulan-tahun" format, e.g., "Januari-2026"
    const [bulan, tahunStr] = id.split('-');
    return this.getByPeriod(bulan, parseInt(tahunStr, 10));
  }

  async getByPeriod(bulan: string, tahun: number): Promise<MonthlyReportEntity | null> {
    const reports = await this.getAll();
    return reports.find(r => r.bulan === bulan && r.tahun === tahun) ?? null;
  }

  async create(_entity: Partial<MonthlyReportEntity>): Promise<QueryResult<MonthlyReportEntity>> {
    void _entity;
    // Read-only data source for now
    return { success: false, error: 'Keuangan data is read-only in local mode' };
  }

  async update(_id: string, _entity: Partial<MonthlyReportEntity>): Promise<QueryResult<MonthlyReportEntity>> {
    void _id;
    void _entity;
    return { success: false, error: 'Keuangan data is read-only in local mode' };
  }

  async delete(_id: string): Promise<QueryResult<void>> {
    void _id;
    return { success: false, error: 'Keuangan data is read-only in local mode' };
  }

  async getBalance(): Promise<BalanceInfo> {
    const reports = await this.getAll();
    return computeBalance(reports);
  }

  async getExpenseSummary(): Promise<ExpenseSummaryEntity> {
    const MockDB = await getMockDB();
    if (!MockDB) {
      return { avgMonthlyExpense: 0, categories: [] };
    }

    const summary = MockDB.getFinanceSummary();
    return {
      avgMonthlyExpense: summary.avgMonthlyExpense ?? 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: ((summary.categories ?? []) as any[]).map((c: any) => ({
        kategori: (c.kategori as string) ?? '',
        persentase: (c.persentase as number) ?? 0,
        avgBulanan: (c.avgBulanan as number) ?? 0,
        keterangan: (c.keterangan as string) ?? '',
        kategoriNormalized: c.kategori_normalized as string | undefined,
      })),
    };
  }
}

// Singleton instance
let _instance: KeuanganRepository | null = null;

export function getKeuanganRepository(): KeuanganRepository {
  if (!_instance) {
    _instance = new KeuanganRepository();
  }
  return _instance;
}
