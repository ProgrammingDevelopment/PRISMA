"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown, ArrowRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export function AdministrationHub() {
    const letters = [
        { title: "Surat Keterangan Kematian", id: "kematian" },
        { title: "Surat Keterangan Tidak Mampu (SKTM)", id: "sktm" },
        { title: "Surat Pengantar Pindah Domisili", id: "pindah" },
        { title: "Surat Keterangan RT (Umum/Kelakuan Baik)", id: "umum" },
    ]

    return (
        <section id="admin" className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Pusat Administrasi & Transparansi</h2>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Panel A: Ringkasan Keuangan */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                            Ringkasan Keuangan
                        </h3>
                        <Card className="bg-gradient-to-br from-background/50 to-background/80 backdrop-blur-sm border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <span className="text-9xl font-bold tracking-tighter">Rp</span>
                            </div>
                            <CardHeader>
                                <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Saldo Bulan Ini</CardTitle>
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-2">Rp 12.500.000</div>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-green-500 rounded-full text-white">
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Pemasukan</p>
                                            <p className="text-xs text-muted-foreground">Iuran & Donasi</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-green-600 dark:text-green-400">+ Rp 3.200.000</span>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-red-500 rounded-full text-white">
                                            <TrendingDown className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Pengeluaran</p>
                                            <p className="text-xs text-muted-foreground">Kebersihan & Keamanan</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-red-600 dark:text-red-400">- Rp 1.800.000</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Link href="/keuangan/laporan">
                                        Lihat Laporan Keuangan Detail & Historis
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Panel B: Layanan Surat Menyurat */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                            Layanan Surat Menyurat
                        </h3>
                        <Card className="h-full shadow-lg border-purple-100 dark:border-purple-900">
                            <CardHeader>
                                <CardTitle>Buat atau Unduh Dokumen</CardTitle>
                                <CardDescription>Pilih jenis surat yang Anda butuhkan</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {letters.map((letter) => (
                                        <div key={letter.id} className="p-4 hover:bg-muted/50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="font-medium text-sm sm:text-base">{letter.title}</div>
                                                <div className="flex flex-col sm:flex-end gap-2 text-right">
                                                    <Button size="sm" className="w-full sm:w-auto">
                                                        Ajukan Online
                                                    </Button>
                                                    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                                        <span>Template Kosong:</span>
                                                        <a href="#" className="flex items-center gap-1 hover:text-primary transition-colors">
                                                            <FileDown className="h-3 w-3" /> .docx
                                                        </a>
                                                        <span className="text-muted-foreground/30">|</span>
                                                        <a href="#" className="flex items-center gap-1 hover:text-primary transition-colors">
                                                            <FileDown className="h-3 w-3" /> .pdf
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-4 border-t bg-muted/20">
                                <Button variant="link" asChild className="ml-auto">
                                    <Link href="/surat">
                                        Lihat jenis surat lainnya...
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
