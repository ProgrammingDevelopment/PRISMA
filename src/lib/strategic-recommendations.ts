// Strategic Recommendations Implementation Utilities
// Implements all 6 strategic recommendations from AI analysis

export interface IuranConfig {
    nominal: number;
    dueDate: number; // Day of month
    gracePeriodDays: number;
    paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
    id: string;
    name: string;
    type: 'qris' | 'bank_transfer' | 'ewallet' | 'cash';
    accountNumber?: string;
    accountName?: string;
    qrCodeUrl?: string;
    isActive: boolean;
}

export interface EventBudget {
    id: string;
    eventName: string;
    eventDate: string;
    allocatedBudget: number;
    actualExpense: number;
    status: 'planned' | 'ongoing' | 'completed';
    notes?: string;
}

export interface AuditRecord {
    id: string;
    quarter: string; // e.g., "Q1-2026"
    year: number;
    auditDate: string;
    auditors: string[];
    findings: AuditFinding[];
    status: 'scheduled' | 'in_progress' | 'completed';
    signedBy?: string;
}

export interface AuditFinding {
    category: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
    resolved: boolean;
}

export interface InfrastructureProposal {
    id: string;
    title: string;
    description: string;
    category: 'security' | 'lighting' | 'sanitation' | 'other';
    estimatedCost: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    proposedBy: string;
    proposedDate: string;
    votesFor: number;
    votesAgainst: number;
    status: 'proposed' | 'voting' | 'approved' | 'rejected' | 'implemented';
}

export interface PublicReport {
    id: string;
    month: string;
    year: number;
    summary: string;
    totalIncome: number;
    totalExpense: number;
    balance: number;
    publishedAt: string;
    whatsappSent: boolean;
    views: number;
}

// =============================
// RECOMMENDATION 1: Manage Iuran Levels
// =============================
export const DEFAULT_IURAN_CONFIG: IuranConfig = {
    nominal: 10000, // Rp 10.000
    dueDate: 10, // Tanggal 10 setiap bulan
    gracePeriodDays: 5,
    paymentMethods: [
        {
            id: 'cash',
            name: 'Tunai ke RT',
            type: 'cash',
            isActive: true
        },
        {
            id: 'bca_transfer',
            name: 'Transfer BCA',
            type: 'bank_transfer',
            accountNumber: '1234567890',
            accountName: 'RT 04 RW 09 KEMAYORAN',
            isActive: true
        },
        {
            id: 'qris',
            name: 'QRIS',
            type: 'qris',
            qrCodeUrl: '/images/qris-rt04.png',
            isActive: true
        }
    ]
};

export function calculatePaymentStatus(
    dueDate: number,
    currentDate: Date,
    gracePeriodDays: number
): 'on_time' | 'grace_period' | 'overdue' {
    const day = currentDate.getDate();
    const deadlineWithGrace = dueDate + gracePeriodDays;

    if (day <= dueDate) return 'on_time';
    if (day <= deadlineWithGrace) return 'grace_period';
    return 'overdue';
}

export function getIuranComplianceRate(
    paidCount: number,
    totalHouseholds: number
): number {
    return totalHouseholds > 0 ? (paidCount / totalHouseholds) * 100 : 0;
}

// =============================
// RECOMMENDATION 2: Digital Payment Methods
// =============================
export function generateQRPaymentData(
    method: PaymentMethod,
    amount: number,
    payerName: string,
    month: string
): string {
    const transactionId = `TRX-${Date.now()}`;

    if (method.type === 'bank_transfer') {
        return JSON.stringify({
            bank: method.name,
            account: method.accountNumber,
            accountName: method.accountName,
            amount,
            reference: `IURAN-${month}-${payerName}`,
            transactionId
        });
    }

    if (method.type === 'qris') {
        return `${method.qrCodeUrl}?amount=${amount}&ref=IURAN-${month}&txid=${transactionId}`;
    }

    return transactionId;
}

export function validatePaymentProof(
    imageFile: File
): { valid: boolean; message: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(imageFile.type)) {
        return { valid: false, message: 'Format file harus JPG, PNG, atau WebP' };
    }

    if (imageFile.size > maxSize) {
        return { valid: false, message: 'Ukuran file maksimal 5MB' };
    }

    return { valid: true, message: 'File valid' };
}

// =============================
// RECOMMENDATION 3: Event Budget Allocation
// =============================
export const ANNUAL_EVENTS: Omit<EventBudget, 'id' | 'actualExpense' | 'status'>[] = [
    {
        eventName: 'HUT RI (17 Agustus)',
        eventDate: '2026-08-17',
        allocatedBudget: 3000000,
        notes: 'Event terbesar, alokasi 64% pengeluaran bulan Agustus'
    },
    {
        eventName: 'Idul Fitri',
        eventDate: '2026-03-30',
        allocatedBudget: 1500000,
        notes: 'Halal bihalal dan takjil'
    },
    {
        eventName: 'Tahun Baru',
        eventDate: '2027-01-01',
        allocatedBudget: 500000,
        notes: 'Malam tahun baru dan do\'a bersama'
    },
    {
        eventName: 'Gotong Royong Rutin',
        eventDate: 'Monthly',
        allocatedBudget: 200000,
        notes: 'Logistik kebersihan bulanan'
    }
];

export function calculateEventBudgetVariance(
    budget: EventBudget
): { variance: number; percentage: number; status: 'under' | 'on_budget' | 'over' } {
    const variance = budget.allocatedBudget - budget.actualExpense;
    const percentage = budget.allocatedBudget > 0
        ? ((budget.actualExpense - budget.allocatedBudget) / budget.allocatedBudget) * 100
        : 0;

    if (percentage > 10) return { variance, percentage, status: 'over' };
    if (percentage < -10) return { variance, percentage, status: 'under' };
    return { variance, percentage, status: 'on_budget' };
}

// =============================
// RECOMMENDATION 4: Periodic Audit
// =============================
export function generateAuditSchedule(year: number): Omit<AuditRecord, 'id'>[] {
    return [
        {
            quarter: `Q1-${year}`,
            year,
            auditDate: `${year}-03-31`,
            auditors: [],
            findings: [],
            status: 'scheduled'
        },
        {
            quarter: `Q2-${year}`,
            year,
            auditDate: `${year}-06-30`,
            auditors: [],
            findings: [],
            status: 'scheduled'
        },
        {
            quarter: `Q3-${year}`,
            year,
            auditDate: `${year}-09-30`,
            auditors: [],
            findings: [],
            status: 'scheduled'
        },
        {
            quarter: `Q4-${year}`,
            year,
            auditDate: `${year}-12-31`,
            auditors: [],
            findings: [],
            status: 'scheduled'
        }
    ];
}

export function calculateAuditScore(record: AuditRecord): number {
    if (record.findings.length === 0) return 100;

    const severityWeights = { low: 5, medium: 15, high: 25 };
    const totalPenalty = record.findings.reduce((sum, f) => {
        return sum + (f.resolved ? 0 : severityWeights[f.severity]);
    }, 0);

    return Math.max(0, 100 - totalPenalty);
}

// =============================
// RECOMMENDATION 5: Infrastructure Priority
// =============================
export const SUGGESTED_INFRASTRUCTURE: Partial<InfrastructureProposal>[] = [
    {
        title: 'CCTV Keamanan',
        description: 'Pemasangan 4 unit CCTV di titik strategis (pintu masuk, pos ronda, taman)',
        category: 'security',
        estimatedCost: 8000000,
        priority: 'high'
    },
    {
        title: 'Penerangan Jalan Tambahan',
        description: 'Pemasangan 6 lampu LED di gang-gang gelap untuk keamanan malam',
        category: 'lighting',
        estimatedCost: 3000000,
        priority: 'medium'
    },
    {
        title: 'Renovasi Pos Ronda',
        description: 'Perbaikan atap dan penambahan fasilitas pos ronda',
        category: 'security',
        estimatedCost: 2000000,
        priority: 'medium'
    },
    {
        title: 'Tempat Sampah Terpilah',
        description: 'Pengadaan 10 set tempat sampah organik-anorganik',
        category: 'sanitation',
        estimatedCost: 1500000,
        priority: 'low'
    }
];

export function calculateVotingResult(proposal: InfrastructureProposal): {
    result: 'approved' | 'rejected' | 'pending';
    approvalPercentage: number;
} {
    const totalVotes = proposal.votesFor + proposal.votesAgainst;
    if (totalVotes === 0) return { result: 'pending', approvalPercentage: 0 };

    const approvalPercentage = (proposal.votesFor / totalVotes) * 100;

    // Approved if >60% votes for
    if (approvalPercentage >= 60) return { result: 'approved', approvalPercentage };
    if (approvalPercentage < 40) return { result: 'rejected', approvalPercentage };
    return { result: 'pending', approvalPercentage };
}

// =============================
// RECOMMENDATION 6: Public Reports
// =============================
export function generateWhatsAppMessage(report: PublicReport): string {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    return `
📊 *LAPORAN KEUANGAN RT 04 RW 09 KEMAYORAN*
📅 Periode: ${report.month} ${report.year}

💰 *Ringkasan Keuangan:*
• Pemasukan: ${formatCurrency(report.totalIncome)}
• Pengeluaran: ${formatCurrency(report.totalExpense)}
• Saldo Akhir: ${formatCurrency(report.balance)}

📝 *Catatan:*
${report.summary}

🌐 Detail lengkap: https://prisma-rt04.vercel.app/keuangan/laporan

_Diterbitkan oleh Sekretariat RT 04_
_${new Date(report.publishedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}_

#TransparansiRT04 #PrismaRT04
`.trim();
}

export function getWhatsAppShareUrl(message: string): string {
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
}

// Helper to format currency consistently
export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}
