// Database Service - Central service for all database operations
// Provides a clean API for frontend components to interact with database endpoints

import { ApiConfig } from '../config/apiConfig';

// Types
export interface AdministrationData {
    warga: WargaData[];
    pengurus: PengurusData[];
    statistik: StatistikData;
}

export interface WargaData {
    id: number;
    nama: string;
    alamat: string;
    status: string;
    telepon: string;
}

export interface PengurusData {
    id: number;
    nama: string;
    jabatan: string;
    periode: string;
}

export interface StatistikData {
    totalWarga: number;
    totalKK: number;
    wargaAktif: number;
    pendatangBaru: number;
}

export interface LetterTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    files: {
        docx: string;
        pdf: string;
    };
    requiredFields: string[];
}

export interface Transaction {
    id: string;
    tanggal: string;
    keterangan: string;
    kategori: string;
    tipe: 'pemasukan' | 'pengeluaran';
    jumlah: number;
}

export interface MonthlyReport {
    bulan: string;
    tahun: number;
    saldo_awal: number;
    total_pemasukan: number;
    total_pengeluaran: number;
    saldo_akhir: number;
    transaksi: Transaction[];
}

export interface ExpenseCategory {
    kategori: string;
    persentase: number;
    avgBulanan: number;
    keterangan: string;
}

export interface ExpenseSummary {
    avgMonthlyExpense: number;
    categories: ExpenseCategory[];
}

export interface SecurityReportSubmission {
    kronologi: string;
    tanggal_kejadian: string;
    waktu_kejadian?: string;
    lokasi?: string;
    nama_pelapor: string;
    telepon_pelapor: string;
    jenis_kejadian: string;
}

export interface IncidentType {
    id: string;
    label: string;
    priority: string;
}

// Security headers to include with all requests
const securityHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
};

// Helper function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            ...securityHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

// Database Service
export const databaseService = {
    // ======== ADMINISTRATION ========
    async getAdministrationData(type?: 'warga' | 'pengurus' | 'statistik'): Promise<AdministrationData | WargaData[] | PengurusData[] | StatistikData> {
        const queryParam = type ? `?type=${type}` : '';
        const result = await apiCall<{ success: boolean; data: AdministrationData }>(`/api/database/administrasi${queryParam}`);
        return result.data;
    },

    async addWarga(data: Partial<WargaData>): Promise<{ success: boolean; message: string }> {
        return apiCall('/api/database/administrasi', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // ======== SURAT MENYURAT ========
    async getLetterTemplates(category?: string): Promise<LetterTemplate[]> {
        const queryParam = category ? `?category=${category}` : '';
        const result = await apiCall<{ success: boolean; data: LetterTemplate[] }>(`/api/database/surat${queryParam}`);
        return result.data;
    },

    async getLetterTemplate(id: string): Promise<LetterTemplate | null> {
        const result = await apiCall<{ success: boolean; data: LetterTemplate }>(`/api/database/surat?id=${id}`);
        return result.data;
    },

    async submitLetterRequest(templateId: string, data: Record<string, string>): Promise<{ success: boolean; submissionId?: string; message?: string }> {
        return apiCall('/api/database/surat', {
            method: 'POST',
            body: JSON.stringify({ templateId, data }),
        });
    },

    getTemplateDownloadUrl(templateId: string, format: 'docx' | 'pdf'): string {
        return `/templates/surat/${templateId}.${format}`;
    },

    // ======== KEUANGAN ========
    async getCurrentBalance(): Promise<{ saldo: number; lastUpdate: string }> {
        const result = await apiCall<{ success: boolean; data: { saldo: number; lastUpdate: string } }>('/api/database/keuangan?type=current');
        return result.data;
    },

    async getMonthlyReports(): Promise<MonthlyReport[]> {
        const result = await apiCall<{ success: boolean; data: MonthlyReport[] }>('/api/database/keuangan?type=monthly');
        return result.data;
    },

    async getMonthlyReport(bulan: string, tahun: number): Promise<MonthlyReport | null> {
        const result = await apiCall<{ success: boolean; data: MonthlyReport }>(`/api/database/keuangan?type=monthly&bulan=${bulan}&tahun=${tahun}`);
        return result.data;
    },

    async getExpenseSummary(): Promise<ExpenseSummary> {
        const result = await apiCall<{ success: boolean; data: ExpenseSummary }>('/api/database/keuangan?type=expense-summary');
        return result.data;
    },

    getFinancialReportPdfUrl(bulan: string, tahun: number): string {
        return `/api/database/keuangan/pdf?bulan=${bulan}&tahun=${tahun}`;
    },

    // ======== KEAMANAN ========
    async getIncidentTypes(): Promise<IncidentType[]> {
        const result = await apiCall<{ success: boolean; data: IncidentType[] }>('/api/database/keamanan?type=types');
        return result.data;
    },

    async getSecurityStats(): Promise<{
        total: number;
        pending: number;
        resolved: number;
        byPriority: Record<string, number>;
    }> {
        const result = await apiCall<{ success: boolean; data: { total: number; pending: number; resolved: number; byPriority: Record<string, number> } }>('/api/database/keamanan?type=stats');
        return result.data;
    },

    async getRecentSecurityReports(): Promise<Array<{
        id: string;
        jenis_kejadian: string;
        lokasi: string;
        tanggal_kejadian: string;
        status: string;
        priority: string;
        nama_pelapor: string;
        telepon_display: string;
    }>> {
        const result = await apiCall<{ success: boolean; data: Array<{ id: string; jenis_kejadian: string; lokasi: string; tanggal_kejadian: string; status: string; priority: string; nama_pelapor: string; telepon_display: string }> }>('/api/database/keamanan?type=recent');
        return result.data;
    },

    async submitSecurityReport(report: SecurityReportSubmission): Promise<{
        success: boolean;
        reportId?: string;
        message?: string;
        priority?: string;
    }> {
        return apiCall('/api/database/keamanan', {
            method: 'POST',
            body: JSON.stringify(report),
        });
    },
};

export default databaseService;
