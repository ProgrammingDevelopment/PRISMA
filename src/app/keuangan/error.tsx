"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw, ArrowLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function KeuanganError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("Keuangan Error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/20 dark:via-background dark:to-orange-950/20 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-2xl border-red-200 dark:border-red-800">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-fit">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl text-red-700 dark:text-red-300">
                        Error Halaman Keuangan
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Terjadi kesalahan saat memuat data keuangan. Data Anda tetap aman.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
                                {error.message}
                            </p>
                        </div>
                    )}

                    {/* Possible Solutions */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                            Kemungkinan Penyebab:
                        </h4>
                        <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                            <li>Koneksi internet terputus</li>
                            <li>Server sedang dalam maintenance</li>
                            <li>Data tidak tersedia untuk periode ini</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={() => reset()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Coba Lagi
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Beranda
                            </Link>
                        </Button>
                    </div>

                    {/* Quick Links */}
                    <div className="pt-4 border-t space-y-2">
                        <p className="text-sm text-muted-foreground">Navigasi cepat:</p>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/keuangan/laporan">
                                    <BarChart3 className="h-3 w-3 mr-1" />
                                    Laporan
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/keuangan/iuran">
                                    Iuran
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/layanan">
                                    Layanan
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
