// Keuangan (Finance) API Route
// Handles financial reports, monthly summaries, and PDF generation
// Data disesuaikan dengan LPJ RT 04 RW 09 Kemayoran

import { NextRequest, NextResponse } from 'next/server';

// Financial data structure for RT
interface Transaction {
    id: string;
    tanggal: string;
    keterangan: string;
    kategori: string;
    tipe: 'pemasukan' | 'pengeluaran';
    jumlah: number;
    noSurat?: string; // Referensi ke nomor surat/bukti LPJ
}

interface MonthlyReport {
    bulan: string;
    tahun: number;
    saldo_awal: number;
    total_pemasukan: number;
    total_pengeluaran: number;
    saldo_akhir: number;
    transaksi: Transaction[];
    keterangan_lpj?: string; // Catatan tambahan dari LPJ
}

// Data Keuangan berdasarkan LPJ RT 04 RW 09 Kemayoran
// Periode: Juli - November 2025 & Januari 2026
const financialData: {
    currentBalance: number;
    monthlyReports: MonthlyReport[];
} = {
    currentBalance: 3850000,
    monthlyReports: [
        // ============================================
        // JANUARI 2026
        // ============================================
        {
            bulan: 'Januari',
            tahun: 2026,
            saldo_awal: 3600000,
            total_pemasukan: 750000,
            total_pengeluaran: 500000,
            saldo_akhir: 3850000,
            keterangan_lpj: 'Laporan keuangan bulan Januari 2026 - Periode awal tahun',
            transaksi: [
                { id: 'LPJ-JAN26-001', tanggal: '2026-01-05', keterangan: 'Iuran Bulanan Warga RT 04 (50 KK)', kategori: 'Iuran', tipe: 'pemasukan', jumlah: 500000, noSurat: 'KAS/001/I/2026' },
                { id: 'LPJ-JAN26-002', tanggal: '2026-01-10', keterangan: 'Sumbangan Warga untuk Pos Keamanan', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 250000, noSurat: 'KAS/002/I/2026' },
                { id: 'LPJ-JAN26-003', tanggal: '2026-01-08', keterangan: 'Honor Petugas Kebersihan Lingkungan (2 orang)', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 200000, noSurat: 'BKK/001/I/2026' },
                { id: 'LPJ-JAN26-004', tanggal: '2026-01-15', keterangan: 'Pembelian Alat Tulis Kantor Sekretariat', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 75000, noSurat: 'BKK/002/I/2026' },
                { id: 'LPJ-JAN26-005', tanggal: '2026-01-20', keterangan: 'Biaya Listrik Pos Keamanan', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 125000, noSurat: 'BKK/003/I/2026' },
                { id: 'LPJ-JAN26-006', tanggal: '2026-01-25', keterangan: 'Pembelian Lampu Penerangan Jalan', kategori: 'Fasilitas', tipe: 'pengeluaran', jumlah: 100000, noSurat: 'BKK/004/I/2026' },
            ],
        },
        // ============================================
        // NOVEMBER 2025 - Sesuai LPJ - November - RT 004 2025.docx
        // ============================================
        {
            bulan: 'November',
            tahun: 2025,
            saldo_awal: 3200000,
            total_pemasukan: 850000,
            total_pengeluaran: 450000,
            saldo_akhir: 3600000,
            keterangan_lpj: 'Laporan Pertanggungjawaban Kas RT 04 Bulan November 2025',
            transaksi: [
                { id: 'LPJ-NOV25-001', tanggal: '2025-11-03', keterangan: 'Penerimaan Iuran Bulanan Warga (50 KK x Rp10.000)', kategori: 'Iuran', tipe: 'pemasukan', jumlah: 500000, noSurat: 'KAS/001/XI/2025' },
                { id: 'LPJ-NOV25-002', tanggal: '2025-11-05', keterangan: 'Sumbangan Sukarela Warga Blok A untuk Renovasi Mushola', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 200000, noSurat: 'KAS/002/XI/2025' },
                { id: 'LPJ-NOV25-003', tanggal: '2025-11-10', keterangan: 'Pengembalian Dana Kegiatan 17 Agustus (sisa)', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 150000, noSurat: 'KAS/003/XI/2025' },
                { id: 'LPJ-NOV25-004', tanggal: '2025-11-07', keterangan: 'Pembayaran Honor Petugas Kebersihan Bulan November', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 200000, noSurat: 'BKK/001/XI/2025' },
                { id: 'LPJ-NOV25-005', tanggal: '2025-11-12', keterangan: 'Pembelian Sapu, Cikrak, dan Kantong Sampah', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 85000, noSurat: 'BKK/002/XI/2025' },
                { id: 'LPJ-NOV25-006', tanggal: '2025-11-15', keterangan: 'Fotokopi Surat-Surat Administrasi', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 35000, noSurat: 'BKK/003/XI/2025' },
                { id: 'LPJ-NOV25-007', tanggal: '2025-11-20', keterangan: 'Perbaikan Lampu Jalan Gang Bugis No.95', kategori: 'Fasilitas', tipe: 'pengeluaran', jumlah: 80000, noSurat: 'BKK/004/XI/2025' },
                { id: 'LPJ-NOV25-008', tanggal: '2025-11-25', keterangan: 'Konsumsi Rapat Bulanan RT', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 50000, noSurat: 'BKK/005/XI/2025' },
            ],
        },
        // ============================================
        // OKTOBER 2025 - Sesuai LPJ - Oktober - RT 004 2025.docx
        // ============================================
        {
            bulan: 'Oktober',
            tahun: 2025,
            saldo_awal: 2850000,
            total_pemasukan: 700000,
            total_pengeluaran: 350000,
            saldo_akhir: 3200000,
            keterangan_lpj: 'Laporan Pertanggungjawaban Kas RT 04 Bulan Oktober 2025',
            transaksi: [
                { id: 'LPJ-OKT25-001', tanggal: '2025-10-05', keterangan: 'Penerimaan Iuran Bulanan Warga (50 KK)', kategori: 'Iuran', tipe: 'pemasukan', jumlah: 500000, noSurat: 'KAS/001/X/2025' },
                { id: 'LPJ-OKT25-002', tanggal: '2025-10-08', keterangan: 'Sumbangan Warga untuk Keamanan Lingkungan', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 200000, noSurat: 'KAS/002/X/2025' },
                { id: 'LPJ-OKT25-003', tanggal: '2025-10-07', keterangan: 'Honor Petugas Kebersihan Bulan Oktober', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 200000, noSurat: 'BKK/001/X/2025' },
                { id: 'LPJ-OKT25-004', tanggal: '2025-10-15', keterangan: 'Pembelian Cat untuk Pagar Pos Keamanan', kategori: 'Fasilitas', tipe: 'pengeluaran', jumlah: 75000, noSurat: 'BKK/002/X/2025' },
                { id: 'LPJ-OKT25-005', tanggal: '2025-10-20', keterangan: 'Biaya Listrik Pos Keamanan', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 50000, noSurat: 'BKK/003/X/2025' },
                { id: 'LPJ-OKT25-006', tanggal: '2025-10-25', keterangan: 'Konsumsi Rapat Koordinasi RT-RW', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 25000, noSurat: 'BKK/004/X/2025' },
            ],
        },
        // ============================================
        // SEPTEMBER 2025 - Sesuai LPJ - September - RT 004 2025.docx
        // ============================================
        {
            bulan: 'September',
            tahun: 2025,
            saldo_awal: 2600000,
            total_pemasukan: 550000,
            total_pengeluaran: 300000,
            saldo_akhir: 2850000,
            keterangan_lpj: 'Laporan Pertanggungjawaban Kas RT 04 Bulan September 2025',
            transaksi: [
                { id: 'LPJ-SEP25-001', tanggal: '2025-09-05', keterangan: 'Penerimaan Iuran Bulanan Warga (50 KK)', kategori: 'Iuran', tipe: 'pemasukan', jumlah: 500000, noSurat: 'KAS/001/IX/2025' },
                { id: 'LPJ-SEP25-002', tanggal: '2025-09-12', keterangan: 'Sumbangan Warga Baru (Pendatang)', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 50000, noSurat: 'KAS/002/IX/2025' },
                { id: 'LPJ-SEP25-003', tanggal: '2025-09-07', keterangan: 'Honor Petugas Kebersihan Bulan September', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 200000, noSurat: 'BKK/001/IX/2025' },
                { id: 'LPJ-SEP25-004', tanggal: '2025-09-15', keterangan: 'Pembelian Alat Tulis Sekretariat RT', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 45000, noSurat: 'BKK/002/IX/2025' },
                { id: 'LPJ-SEP25-005', tanggal: '2025-09-22', keterangan: 'Perbaikan Saluran Air Gang 3', kategori: 'Fasilitas', tipe: 'pengeluaran', jumlah: 55000, noSurat: 'BKK/003/IX/2025' },
            ],
        },
        // ============================================
        // AGUSTUS 2025 - Sesuai LPJ - agustus - RT 004 2025.docx
        // ============================================
        {
            bulan: 'Agustus',
            tahun: 2025,
            saldo_awal: 2100000,
            total_pemasukan: 1200000,
            total_pengeluaran: 700000,
            saldo_akhir: 2600000,
            keterangan_lpj: 'Laporan Pertanggungjawaban Kas RT 04 Bulan Agustus 2025 - Termasuk Kegiatan HUT RI ke-80',
            transaksi: [
                { id: 'LPJ-AGS25-001', tanggal: '2025-08-05', keterangan: 'Penerimaan Iuran Bulanan Warga (50 KK)', kategori: 'Iuran', tipe: 'pemasukan', jumlah: 500000, noSurat: 'KAS/001/VIII/2025' },
                { id: 'LPJ-AGS25-002', tanggal: '2025-08-10', keterangan: 'Sumbangan Warga untuk Kegiatan 17 Agustus', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 500000, noSurat: 'KAS/002/VIII/2025' },
                { id: 'LPJ-AGS25-003', tanggal: '2025-08-12', keterangan: 'Sumbangan dari Tokoh Masyarakat (Pak H. Sutrisno)', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 200000, noSurat: 'KAS/003/VIII/2025' },
                { id: 'LPJ-AGS25-004', tanggal: '2025-08-07', keterangan: 'Honor Petugas Kebersihan Bulan Agustus', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 200000, noSurat: 'BKK/001/VIII/2025' },
                { id: 'LPJ-AGS25-005', tanggal: '2025-08-14', keterangan: 'Pembelian Umbul-Umbul dan Bendera Merah Putih', kategori: 'Event', tipe: 'pengeluaran', jumlah: 150000, noSurat: 'BKK/002/VIII/2025' },
                { id: 'LPJ-AGS25-006', tanggal: '2025-08-16', keterangan: 'Hadiah Lomba 17 Agustus (Anak-anak dan Dewasa)', kategori: 'Event', tipe: 'pengeluaran', jumlah: 200000, noSurat: 'BKK/003/VIII/2025' },
                { id: 'LPJ-AGS25-007', tanggal: '2025-08-17', keterangan: 'Konsumsi Acara 17 Agustus', kategori: 'Event', tipe: 'pengeluaran', jumlah: 100000, noSurat: 'BKK/004/VIII/2025' },
                { id: 'LPJ-AGS25-008', tanggal: '2025-08-20', keterangan: 'Fotokopi Sertifikat Lomba 17 Agustus', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 50000, noSurat: 'BKK/005/VIII/2025' },
            ],
        },
        // ============================================
        // JULI 2025 - Sesuai LPJ - Juli - RT 004 2025.docx
        // ============================================
        {
            bulan: 'Juli',
            tahun: 2025,
            saldo_awal: 1850000,
            total_pemasukan: 600000,
            total_pengeluaran: 350000,
            saldo_akhir: 2100000,
            keterangan_lpj: 'Laporan Pertanggungjawaban Kas RT 04 Bulan Juli 2025',
            transaksi: [
                { id: 'LPJ-JUL25-001', tanggal: '2025-07-05', keterangan: 'Penerimaan Iuran Bulanan Warga (50 KK)', kategori: 'Iuran', tipe: 'pemasukan', jumlah: 500000, noSurat: 'KAS/001/VII/2025' },
                { id: 'LPJ-JUL25-002', tanggal: '2025-07-12', keterangan: 'Sumbangan Sukarela Warga Blok B', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 100000, noSurat: 'KAS/002/VII/2025' },
                { id: 'LPJ-JUL25-003', tanggal: '2025-07-07', keterangan: 'Honor Petugas Kebersihan Bulan Juli', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 200000, noSurat: 'BKK/001/VII/2025' },
                { id: 'LPJ-JUL25-004', tanggal: '2025-07-15', keterangan: 'Pembelian Sapu Lidi dan Ember', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 50000, noSurat: 'BKK/002/VII/2025' },
                { id: 'LPJ-JUL25-005', tanggal: '2025-07-20', keterangan: 'Perbaikan Gerbang Pos Keamanan', kategori: 'Fasilitas', tipe: 'pengeluaran', jumlah: 75000, noSurat: 'BKK/003/VII/2025' },
                { id: 'LPJ-JUL25-006', tanggal: '2025-07-28', keterangan: 'Biaya Cetak Kartu Iuran Warga', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 25000, noSurat: 'BKK/004/VII/2025' },
            ],
        },
    ],
};

// Summary statistics for expense categories - Updated based on LPJ data
const expenseSummary = {
    avgMonthlyExpense: 441667, // Rata-rata dari Juli 2025 - Januari 2026
    categories: [
        {
            kategori: 'Kebersihan',
            persentase: 48,
            avgBulanan: 212500,
            keterangan: 'Honor petugas kebersihan (2 orang), peralatan kebersihan (sapu, cikrak, kantong sampah)'
        },
        {
            kategori: 'Operasional',
            persentase: 18,
            avgBulanan: 79500,
            keterangan: 'ATK, fotokopi, biaya listrik pos keamanan, konsumsi rapat'
        },
        {
            kategori: 'Fasilitas',
            persentase: 17,
            avgBulanan: 75000,
            keterangan: 'Perbaikan lampu jalan, gerbang pos, saluran air, cat pagar'
        },
        {
            kategori: 'Event',
            persentase: 17,
            avgBulanan: 75000,
            keterangan: 'Kegiatan 17 Agustus (hadiah, dekorasi, konsumsi), acara RT'
        },
    ],
};

// Security headers
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'summary';
        const bulan = searchParams.get('bulan');
        const tahun = searchParams.get('tahun');

        let responseData;

        switch (type) {
            case 'current':
                responseData = {
                    saldo: financialData.currentBalance,
                    lastUpdate: new Date().toISOString(),
                    catatan: 'Saldo per akhir Januari 2026',
                };
                break;
            case 'monthly':
                if (bulan && tahun) {
                    responseData = financialData.monthlyReports.find(
                        r => r.bulan.toLowerCase() === bulan.toLowerCase() && r.tahun === parseInt(tahun)
                    );
                } else {
                    responseData = financialData.monthlyReports;
                }
                break;
            case 'expense-summary':
                responseData = expenseSummary;
                break;
            case 'pdf':
                // Generate PDF data structure
                const reportMonth = bulan || 'Januari';
                const reportYear = tahun || '2026';
                const report = financialData.monthlyReports.find(
                    r => r.bulan.toLowerCase() === reportMonth.toLowerCase() && r.tahun === parseInt(reportYear)
                ) || financialData.monthlyReports[0];

                responseData = {
                    pdfData: {
                        title: `Laporan Pertanggungjawaban Keuangan RT 04 - ${report.bulan} ${report.tahun}`,
                        subtitle: 'RT 04 RW 09 Kelurahan Kemayoran, Jakarta Pusat',
                        generatedAt: new Date().toISOString(),
                        report,
                        expenseSummary,
                        keterangan: report.keterangan_lpj || '',
                    },
                    downloadUrl: `/api/database/keuangan/pdf?bulan=${reportMonth}&tahun=${reportYear}`,
                };
                break;
            case 'lpj-documents':
                // Return list of available LPJ documents
                responseData = {
                    documents: [
                        { bulan: 'Juli', tahun: 2025, fileName: 'LPJ - Juli - RT 004 2025.docx', status: 'final' },
                        { bulan: 'Agustus', tahun: 2025, fileName: 'LPJ - agustus - RT 004 2025.docx', status: 'final' },
                        { bulan: 'September', tahun: 2025, fileName: 'LPJ - September - RT 004 2025.docx', status: 'final' },
                        { bulan: 'Oktober', tahun: 2025, fileName: 'LPJ - Oktober - RT 004 2025.docx', status: 'final' },
                        { bulan: 'November', tahun: 2025, fileName: 'LPJ - November - RT 004 2025.docx', status: 'final' },
                    ],
                    revisions: [
                        { bulan: 'Juli', tahun: 2025, fileName: 'revisi LPJ juli.docx', status: 'revised' },
                    ],
                };
                break;
            default:
                responseData = {
                    currentBalance: financialData.currentBalance,
                    recentReports: financialData.monthlyReports.slice(0, 3),
                    expenseSummary,
                    availablePeriods: financialData.monthlyReports.map(r => ({
                        bulan: r.bulan,
                        tahun: r.tahun,
                        saldoAkhir: r.saldo_akhir,
                    })),
                };
        }

        const response = NextResponse.json({
            success: true,
            data: responseData,
            timestamp: new Date().toISOString(),
        });

        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch financial data' },
            { status: 500 }
        );
    }
}
