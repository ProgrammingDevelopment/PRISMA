// KeamananRepository — Data access for Security domain
// Delegates to SqliteDB

import { BaseRepository, QueryResult } from './BaseRepository';
import {
  type SecurityReportEntity,
  type SecurityStatsEntity,
  type IncidentTypeEntity,
  type SecurityReportSubmission,
  createSecurityReport,
  computeSecurityStats,
  DEFAULT_INCIDENT_TYPES,
} from '../entities/Keamanan';

const getSqliteDB = async () => {
  if (typeof window === 'undefined') return null;
  const { SqliteDB } = await import('@/lib/sqliteDB');
  return SqliteDB;
};

export class KeamananRepository extends BaseRepository<SecurityReportEntity> {
  async getAll(): Promise<SecurityReportEntity[]> {
    const SqliteDB = await getSqliteDB();
    if (!SqliteDB) return [];

    await SqliteDB.init();
    const rawReports = SqliteDB.getAllSecurityReports() as Record<string, unknown>[];
    return rawReports.map(r => ({
      id: r.id as number,
      jenisKejadian: (r.jenis_kejadian as string) ?? '',
      lokasi: (r.lokasi as string) ?? '',
      tanggalKejadian: (r.tanggal_kejadian as string) ?? '',
      status: (r.status as 'Pending' | 'InProgress' | 'Resolved') ?? 'Pending',
      priority: (r.priority as 'Low' | 'Medium' | 'High') ?? 'Medium',
      namaPelapor: (r.nama_pelapor as string) ?? '',
      teleponPelapor: (r.telepon_pelapor as string) ?? '',
      kronologi: (r.kronologi as string) ?? '',
      createdAt: (r.created_at as string) ?? '',
    }));
  }

  async getById(id: number): Promise<SecurityReportEntity | null> {
    const all = await this.getAll();
    return all.find(r => r.id === id) ?? null;
  }

  async create(entity: Partial<SecurityReportEntity>): Promise<QueryResult<SecurityReportEntity>> {
    void entity;
    return { success: false, error: 'Use submitReport() instead' };
  }

  async update(_id: number, _entity: Partial<SecurityReportEntity>): Promise<QueryResult<SecurityReportEntity>> {
    void _id;
    void _entity;
    return { success: false, error: 'Security report update not yet implemented' };
  }

  async delete(_id: number): Promise<QueryResult<void>> {
    void _id;
    return { success: false, error: 'Security report deletion not allowed' };
  }

  async submitReport(submission: SecurityReportSubmission): Promise<QueryResult<{ reportId: string; priority: string }>> {
    try {
      const SqliteDB = await getSqliteDB();
      if (!SqliteDB) return { success: false, error: 'Database not available' };

      await SqliteDB.init();
      const report = createSecurityReport(submission);

      // Map entity back to snake_case for SQLite
      SqliteDB.addSecurityReport({
        kronologi: report.kronologi,
        tanggal_kejadian: report.tanggalKejadian,
        waktu_kejadian: report.waktuKejadian,
        lokasi: report.lokasi,
        nama_pelapor: report.namaPelapor,
        telepon_pelapor: report.teleponPelapor,
        jenis_kejadian: report.jenisKejadian,
      });

      return {
        success: true,
        data: { reportId: Date.now().toString(), priority: report.priority },
      };
    } catch (error) {
      return { success: false, error: `Failed to submit report: ${error}` };
    }
  }

  async getStats(): Promise<SecurityStatsEntity> {
    const reports = await this.getAll();
    return computeSecurityStats(reports);
  }

  getIncidentTypes(): IncidentTypeEntity[] {
    return DEFAULT_INCIDENT_TYPES;
  }
}

// Singleton instance
let _instance: KeamananRepository | null = null;

export function getKeamananRepository(): KeamananRepository {
  if (!_instance) {
    _instance = new KeamananRepository();
  }
  return _instance;
}
