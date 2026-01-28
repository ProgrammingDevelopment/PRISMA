"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw, FileText, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function SuratError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("Surat Error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/20 dark:via-background dark:to-orange-950/20 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-2xl border-red-200 dark:border-red-800">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-fit">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl text-red-700 dark:text-red-300">
                        Error Halaman Surat
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Terjadi kesalahan saat memuat layanan surat menyurat.
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
                        <p className="text-sm text-muted-foreground">Layanan Surat:</p>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/surat">
                                    <FileText className="h-3 w-3 mr-1" />
                                    Template Surat
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/surat/keamanan">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Laporan Keamanan
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/layanan">
                                    Semua Layanan
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
