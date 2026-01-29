// PDF Generation API Route for Financial Reports
// Generates downloadable PDF reports for monthly financial summaries

import { NextRequest, NextResponse } from 'next/server';

// Financial data (same as main keuangan route)
const financialData = {
    monthlyReports: [
        {
            bulan: 'Januari',
            tahun: 2026,
            saldo_awal: 2600000,
            total_pemasukan: 700000,
            total_pengeluaran: 800000,
            saldo_akhir: 2500000,
            transaksi: [
                { id: 'TRX001', tanggal: '2026-01-05', keterangan: 'Iuran Bulanan Warga', kategori: 'Iuran', tipe: 'pemasukan', jumlah: 450000 },
                { id: 'TRX002', tanggal: '2026-01-10', keterangan: 'Donasi Warga Blok A', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 250000 },
                { id: 'TRX003', tanggal: '2026-01-12', keterangan: 'Pembayaran Petugas Kebersihan', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 400000 },
                { id: 'TRX004', tanggal: '2026-01-15', keterangan: 'Pembelian Lampu Jalan', kategori: 'Fasilitas', tipe: 'pengeluaran', jumlah: 200000 },
                { id: 'TRX005', tanggal: '2026-01-20', keterangan: 'Dana Operasional Pos', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 150000 },
                { id: 'TRX006', tanggal: '2026-01-25', keterangan: 'ATK dan Fotokopi', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 50000 },
            ],
        },
        {
            bulan: 'Desember',
            tahun: 2025,
            saldo_awal: 2400000,
            total_pemasukan: 800000,
            total_pengeluaran: 600000,
            saldo_akhir: 2600000,
            transaksi: [
                { id: 'TRX-D01', tanggal: '2025-12-05', keterangan: 'Iuran Bulanan Warga', kategori: 'Iuran', tipe: 'pemasukan', jumlah: 500000 },
                { id: 'TRX-D02', tanggal: '2025-12-08', keterangan: 'Donasi Natal & Tahun Baru', kategori: 'Donasi', tipe: 'pemasukan', jumlah: 300000 },
                { id: 'TRX-D03', tanggal: '2025-12-10', keterangan: 'Pembayaran Petugas Kebersihan', kategori: 'Kebersihan', tipe: 'pengeluaran', jumlah: 400000 },
                { id: 'TRX-D04', tanggal: '2025-12-20', keterangan: 'Dekorasi Natal & Tahun Baru', kategori: 'Event', tipe: 'pengeluaran', jumlah: 150000 },
                { id: 'TRX-D05', tanggal: '2025-12-28', keterangan: 'Konsumsi Rapat Akhir Tahun', kategori: 'Operasional', tipe: 'pengeluaran', jumlah: 50000 },
            ],
        },
    ],
};

const expenseSummary = {
    avgMonthlyExpense: 2500000,
    categories: [
        { kategori: 'Kebersihan', persentase: 45, avgBulanan: 1125000, keterangan: 'Gaji petugas kebersihan, peralatan kebersihan' },
        { kategori: 'Operasional', persentase: 20, avgBulanan: 500000, keterangan: 'ATK, fotokopi, konsumsi rapat' },
        { kategori: 'Fasilitas', persentase: 15, avgBulanan: 375000, keterangan: 'Perbaikan dan pemeliharaan fasilitas umum' },
        { kategori: 'Keamanan', persentase: 12, avgBulanan: 300000, keterangan: 'Peralatan keamanan, lampu jalan' },
        { kategori: 'Event', persentase: 8, avgBulanan: 200000, keterangan: 'Acara RT, dekorasi, perayaan' },
    ],
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bulan = searchParams.get('bulan') || 'Januari';
        const tahun = searchParams.get('tahun') || '2026';

        // Find the report
        const report = financialData.monthlyReports.find(
            r => r.bulan.toLowerCase() === bulan.toLowerCase() && r.tahun === parseInt(tahun)
        ) || financialData.monthlyReports[0];

        // Generate HTML content for PDF
        const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Keuangan RT 04 - ${report.bulan} ${report.tahun}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .logo { font-size: 32px; font-weight: bold; color: #2563eb; }
        .subtitle { color: #666; margin-top: 8px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: 600; color: #1e40af; margin-bottom: 15px; padding-left: 10px; border-left: 4px solid #2563eb; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
        .summary-card.green { background: #f0fdf4; border-color: #bbf7d0; }
        .summary-card.red { background: #fef2f2; border-color: #fecaca; }
        .summary-card.blue { background: #eff6ff; border-color: #bfdbfe; }
        .summary-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .summary-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
        .summary-value.green { color: #16a34a; }
        .summary-value.red { color: #dc2626; }
        .summary-value.blue { color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; font-weight: 600; color: #475569; }
        tr:hover { background: #f8fafc; }
        .pemasukan { color: #16a34a; }
        .pengeluaran { color: #dc2626; }
        .expense-chart { margin-top: 20px; }
        .expense-bar { display: flex; align-items: center; margin-bottom: 12px; }
        .expense-label { width: 120px; font-weight: 500; }
        .expense-progress { flex: 1; height: 24px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin: 0 15px; }
        .expense-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #1d4ed8); border-radius: 4px; }
        .expense-percent { width: 50px; text-align: right; font-weight: 600; color: #2563eb; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        .avg-info { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin-top: 20px; }
        .avg-info strong { color: #b45309; }
        @media print { body { padding: 20px; } .summary-card { break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">PRISMA RT 04</div>
        <div class="subtitle">Laporan Keuangan Bulanan</div>
        <div class="subtitle" style="font-size: 20px; margin-top: 10px; font-weight: 600;">${report.bulan} ${report.tahun}</div>
    </div>

    <div class="section">
        <div class="section-title">Ringkasan Keuangan</div>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-label">Saldo Awal</div>
                <div class="summary-value">${formatCurrency(report.saldo_awal)}</div>
            </div>
            <div class="summary-card blue">
                <div class="summary-label">Saldo Akhir</div>
                <div class="summary-value blue">${formatCurrency(report.saldo_akhir)}</div>
            </div>
            <div class="summary-card green">
                <div class="summary-label">Total Pemasukan</div>
                <div class="summary-value green">+ ${formatCurrency(report.total_pemasukan)}</div>
            </div>
            <div class="summary-card red">
                <div class="summary-label">Total Pengeluaran</div>
                <div class="summary-value red">- ${formatCurrency(report.total_pengeluaran)}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Detail Transaksi</div>
        <table>
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Keterangan</th>
                    <th>Kategori</th>
                    <th style="text-align: right;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                ${report.transaksi.map(trx => `
                    <tr>
                        <td>${trx.tanggal}</td>
                        <td>${trx.keterangan}</td>
                        <td>${trx.kategori}</td>
                        <td class="${trx.tipe}" style="text-align: right; font-weight: 600;">
                            ${trx.tipe === 'pemasukan' ? '+' : '-'} ${formatCurrency(trx.jumlah)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Distribusi Pengeluaran Rata-rata</div>
        <div class="avg-info">
            <strong>Rata-rata Pengeluaran Bulanan: ${formatCurrency(expenseSummary.avgMonthlyExpense)}</strong>
        </div>
        <div class="expense-chart">
            ${expenseSummary.categories.map(cat => `
                <div class="expense-bar">
                    <span class="expense-label">${cat.kategori}</span>
                    <div class="expense-progress">
                        <div class="expense-fill" style="width: ${cat.persentase}%"></div>
                    </div>
                    <span class="expense-percent">${cat.persentase}%</span>
                </div>
            `).join('')}
        </div>
        <table style="margin-top: 20px;">
            <thead>
                <tr>
                    <th>Kategori</th>
                    <th>Rata-rata Bulanan</th>
                    <th>Keterangan</th>
                </tr>
            </thead>
            <tbody>
                ${expenseSummary.categories.map(cat => `
                    <tr>
                        <td>${cat.kategori}</td>
                        <td>${formatCurrency(cat.avgBulanan)}</td>
                        <td>${cat.keterangan}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>Dokumen ini dibuat secara otomatis oleh sistem PRISMA RT 04</p>
        <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="margin-top: 10px;">© 2026 PRISMA RT 04 Kemayoran - Platform Realisasi Informasi, Sistem Manajemen & Administrasi</p>
    </div>
</body>
</html>
        `;

        // Return HTML content that can be printed/saved as PDF from browser
        return new NextResponse(htmlContent, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="Laporan_Keuangan_RT04_${report.bulan}_${report.tahun}.html"`,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to generate PDF' },
            { status: 500 }
        );
    }
}
