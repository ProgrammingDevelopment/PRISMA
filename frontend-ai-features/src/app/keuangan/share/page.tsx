"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    MessageCircle,
    Share2,
    Copy,
    Check,
    ExternalLink,
    Smartphone,
    Download,
    Eye,
    Send,
    ChevronRight,
    TrendingUp,
    TrendingDown
} from "lucide-react"
import { generateWhatsAppMessage, getWhatsAppShareUrl, formatRupiah, PublicReport } from "@/lib/strategic-recommendations"

// Mock data for reports
const mockReports: PublicReport[] = [
    {
        id: '1',
        month: 'Januari',
        year: 2026,
        summary: 'Kondisi keuangan stabil dengan surplus Rp 171.000. Pengeluaran utama untuk gaji petugas kebersihan dan keamanan.',
        totalIncome: 721000,
        totalExpense: 550000,
        balance: 2561000,
        publishedAt: '2026-01-27T10:00:00Z',
        whatsappSent: true,
        views: 45
    },
    {
        id: '2',
        month: 'Desember',
        year: 2025,
        summary: 'Pemasukan meningkat dari donasi akhir tahun. Dana cadangan untuk event tahun baru berhasil dialokasikan.',
        totalIncome: 850000,
        totalExpense: 600000,
        balance: 2390000,
        publishedAt: '2025-12-28T09:00:00Z',
        whatsappSent: true,
        views: 52
    },
    {
        id: '3',
        month: 'November',
        year: 2025,
        summary: 'Pengeluaran normal untuk operasional bulanan. Semua warga membayar iuran tepat waktu.',
        totalIncome: 700000,
        totalExpense: 480000,
        balance: 2140000,
        publishedAt: '2025-11-29T08:30:00Z',
        whatsappSent: true,
        views: 38
    }
];

export default function SharePage() {
    const [selectedReport, setSelectedReport] = useState<PublicReport | null>(mockReports[0]);
    const [copied, setCopied] = useState(false);
    const [sending, setSending] = useState(false);

    const handleCopyMessage = () => {
        if (!selectedReport) return;
        const message = generateWhatsAppMessage(selectedReport);
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        if (!selectedReport) return;
        const message = generateWhatsAppMessage(selectedReport);
        const url = getWhatsAppShareUrl(message);
        window.open(url, '_blank');
    };

    const handleSendToGroup = async () => {
        if (!selectedReport) return;
        setSending(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSending(false);
        alert('Laporan berhasil dikirim ke grup WhatsApp RT 04!');
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    <Button variant="outline" asChild>
                        <Link href="/keuangan/laporan">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                                <MessageCircle className="h-3 w-3" /> Rekomendasi #6
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Laporan Publik</h1>
                        <p className="text-muted-foreground">Publikasikan laporan keuangan ke grup WhatsApp RT</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left: Report Selection */}
                    <div className="md:col-span-1 space-y-4">
                        <h2 className="font-semibold text-lg mb-4">Pilih Laporan</h2>
                        {mockReports.map((report) => (
                            <Card
                                key={report.id}
                                className={`
                                    cursor-pointer transition-all
                                    ${selectedReport?.id === report.id
                                        ? 'border-primary ring-2 ring-primary'
                                        : 'hover:border-primary/50'
                                    }
                                `}
                                onClick={() => setSelectedReport(report)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-medium">{report.month} {report.year}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(report.publishedAt).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        {report.whatsappSent && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                <Check className="h-3 w-3" /> Terkirim
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                        <span className="text-green-600">+{formatRupiah(report.totalIncome)}</span>
                                        <span className="text-red-600">-{formatRupiah(report.totalExpense)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                        <Eye className="h-3 w-3" />
                                        {report.views} views
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Right: Preview & Actions */}
                    <div className="md:col-span-2 space-y-6">
                        {selectedReport ? (
                            <>
                                {/* Preview Card */}
                                <Card className="border-2">
                                    <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="h-5 w-5" />
                                            <CardTitle className="text-lg">Preview Pesan WhatsApp</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        {/* WhatsApp-like message preview */}
                                        <div className="bg-[#e5ddd5] dark:bg-slate-800 p-4">
                                            <div className="max-w-sm ml-auto bg-[#dcf8c6] dark:bg-green-900/50 rounded-lg p-3 shadow">
                                                <pre className="text-sm whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                                                    {generateWhatsAppMessage(selectedReport)}
                                                </pre>
                                                <div className="text-right mt-1">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                        <CardContent className="p-4 text-center">
                                            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground">Pemasukan</p>
                                            <p className="font-bold text-green-600">{formatRupiah(selectedReport.totalIncome)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                        <CardContent className="p-4 text-center">
                                            <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground">Pengeluaran</p>
                                            <p className="font-bold text-red-600">{formatRupiah(selectedReport.totalExpense)}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                        <CardContent className="p-4 text-center">
                                            <Share2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                            <p className="text-xs text-muted-foreground">Saldo</p>
                                            <p className="font-bold text-blue-600">{formatRupiah(selectedReport.balance)}</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Action Buttons */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Bagikan Laporan</CardTitle>
                                        <CardDescription>Pilih cara untuk membagikan laporan ke warga</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={handleShareWhatsApp}
                                            >
                                                <MessageCircle className="h-4 w-4 mr-2" />
                                                Buka WhatsApp
                                                <ExternalLink className="h-3 w-3 ml-2" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={handleCopyMessage}
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2" />
                                                        Tersalin!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Salin Pesan
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-background px-2 text-muted-foreground">atau</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            variant="default"
                                            onClick={handleSendToGroup}
                                            disabled={sending}
                                        >
                                            {sending ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                    Mengirim...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Kirim ke Grup RT 04 (via Bot)
                                                </>
                                            )}
                                        </Button>

                                        <p className="text-xs text-muted-foreground text-center">
                                            Bot WhatsApp akan mengirim pesan ke grup RT 04 secara otomatis
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Download PDF */}
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/api/database/keuangan/pdf?bulan=${selectedReport.month}&tahun=${selectedReport.year}`}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF Laporan Lengkap
                                    </Link>
                                </Button>
                            </>
                        ) : (
                            <Card className="border-dashed border-2">
                                <CardContent className="py-12 text-center">
                                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold text-lg mb-2">Pilih Laporan</h3>
                                    <p className="text-muted-foreground">
                                        Pilih laporan bulanan di sebelah kiri untuk melihat preview
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Tips */}
                <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                    Tips Publikasi Laporan
                                </h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                                    <li>Kirim laporan setiap akhir bulan untuk menjaga transparansi</li>
                                    <li>Sertakan ringkasan singkat agar mudah dipahami warga</li>
                                    <li>Undang warga untuk bertanya jika ada yang kurang jelas</li>
                                    <li>Link ke website dapat diakses kapan saja untuk detail lengkap</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
