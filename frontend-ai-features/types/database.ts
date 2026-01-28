// Database Types and Interfaces
// Centralized type definitions for database operations

export interface WargaData {
    id: number;
    nama: string;
    alamat: string;
    status: 'Aktif' | 'Tidak Aktif';
    telepon: string;
    tanggal_daftar?: string;
}

export interface PengurusData {
    id: number;
    nama: string;
    jabatan: string;
    periode: string;
    telepon?: string;
}

export interface StatistikData {
    totalWarga: number;
    totalKK: number;
    wargaAktif: number;
    pendatangBaru: number;
}

export interface AdministrationData {
    warga: WargaData[];
    pengurus: PengurusData[];
    statistik: StatistikData;
}

export interface LetterTemplate {
    id: string;
    title: string;
    description: string;
    category: 'administrasi' | 'keamanan';
    files: {
        docx: string;
        pdf: string;
    };
    requiredFields: string[];
}

export interface LetterSubmission {
    id: string;
    templateId: string;
    data: Record<string, string>;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    processedAt?: string;
}

export interface Transaction {
    id: string;
    tanggal: string;
    keterangan: string;
    kategori: 'Iuran' | 'Donasi' | 'Kebersihan' | 'Operasional' | 'Fasilitas' | 'Keamanan' | 'Event';
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

export interface FinancialSummary {
    currentBalance: number;
    recentReports: MonthlyReport[];
    expenseSummary: ExpenseSummary;
}

export interface SecurityReport {
    id: string;
    kronologi: string;
    tanggal_kejadian: string;
    waktu_kejadian: string;
    lokasi: string;
    nama_pelapor: string;
    telepon_pelapor_hash: string; // bcrypt hashed
    telepon_last4: string;
    jenis_kejadian: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
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
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityStats {
    total: number;
    pending: number;
    resolved: number;
    byPriority: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
}

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}

export interface SecurityApiResponse<T> extends ApiResponse<T> {
    security?: {
        xss_protected: boolean;
        osint_protected: boolean;
        bcrypt_enabled: boolean;
    };
}

// Security configuration
export interface SecurityConfig {
    bcryptSaltRounds: number;
    maxReportLength: number;
    allowedFileTypes: string[];
    rateLimitPerMinute: number;
}
