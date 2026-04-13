// Model Entity: Keamanan
// Domain entity untuk laporan keamanan dan insiden

export interface SecurityReportEntity {
  id: number;
  jenisKejadian: string;
  lokasi: string;
  tanggalKejadian: string;
  waktuKejadian?: string;
  status: ReportStatus;
  priority: ReportPriority;
  namaPelapor: string;
  teleponPelapor: string;
  kronologi: string;
  createdAt?: string;
}

export type ReportStatus = 'Pending' | 'InProgress' | 'Resolved';
export type ReportPriority = 'Low' | 'Medium' | 'High';

export interface IncidentTypeEntity {
  id: string;
  label: string;
  priority: ReportPriority;
}

export interface SecurityStatsEntity {
  total: number;
  pending: number;
  resolved: number;
  byPriority: Record<ReportPriority, number>;
}

export interface SecurityReportSubmission {
  kronologi: string;
  tanggalKejadian: string;
  waktuKejadian?: string;
  lokasi?: string;
  namaPelapor: string;
  teleponPelapor: string;
  jenisKejadian: string;
}

// Factory function
export function createSecurityReport(data: SecurityReportSubmission): Omit<SecurityReportEntity, 'id'> {
  const incidentPriorities: Record<string, ReportPriority> = {
    theft: 'High',
    medical: 'High',
    disturbance: 'Medium',
    other: 'Low',
  };

  return {
    jenisKejadian: data.jenisKejadian,
    lokasi: data.lokasi ?? '',
    tanggalKejadian: data.tanggalKejadian,
    waktuKejadian: data.waktuKejadian,
    status: 'Pending',
    priority: incidentPriorities[data.jenisKejadian] ?? 'Medium',
    namaPelapor: data.namaPelapor,
    teleponPelapor: data.teleponPelapor,
    kronologi: data.kronologi,
    createdAt: new Date().toISOString(),
  };
}

// Validation
export function validateSecurityReport(report: Partial<SecurityReportSubmission>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!report.namaPelapor || report.namaPelapor.trim().length < 2) {
    errors.push('Nama pelapor minimal 2 karakter');
  }

  if (!report.kronologi || report.kronologi.trim().length < 10) {
    errors.push('Kronologi kejadian minimal 10 karakter');
  }

  if (!report.tanggalKejadian) {
    errors.push('Tanggal kejadian wajib diisi');
  }

  if (!report.jenisKejadian) {
    errors.push('Jenis kejadian wajib dipilih');
  }

  return { valid: errors.length === 0, errors };
}

// Compute statistics from reports
export function computeSecurityStats(reports: SecurityReportEntity[]): SecurityStatsEntity {
  return {
    total: reports.length,
    pending: reports.filter(r => r.status === 'Pending').length,
    resolved: reports.filter(r => r.status === 'Resolved').length,
    byPriority: {
      High: reports.filter(r => r.priority === 'High').length,
      Medium: reports.filter(r => r.priority === 'Medium').length,
      Low: reports.filter(r => r.priority === 'Low').length,
    },
  };
}

// Default incident types
export const DEFAULT_INCIDENT_TYPES: IncidentTypeEntity[] = [
  { id: 'theft', label: 'Pencurian', priority: 'High' },
  { id: 'disturbance', label: 'Keributan', priority: 'Medium' },
  { id: 'medical', label: 'Darurat Medis', priority: 'High' },
  { id: 'other', label: 'Lainnya', priority: 'Low' },
];
