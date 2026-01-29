"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function LayananError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("Layanan Error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full shadow-2xl bg-white/5 backdrop-blur-sm border-white/20">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 p-4 bg-red-500/20 rounded-full w-fit">
                        <AlertTriangle className="h-12 w-12 text-red-400" />
                    </div>
                    <CardTitle className="text-2xl text-white">
                        Error Halaman Layanan
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Terjadi kesalahan saat memuat layanan digital.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {process.env.NODE_ENV === 'development' && (
                        <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                            <p className="text-xs font-mono text-red-300 break-all">
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
                        <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                            <Link href="/">
                                <Home className="h-4 w-4 mr-2" />
                                Beranda
                            </Link>
                        </Button>
                    </div>

                    {/* Quick Links */}
                    <div className="pt-4 border-t border-white/10 space-y-2">
                        <p className="text-sm text-gray-400">Layanan Tersedia:</p>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10" asChild>
                                <Link href="/layanan/administrasi">
                                    <Folder className="h-3 w-3 mr-1" />
                                    Administrasi
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10" asChild>
                                <Link href="/surat">
                                    Surat
                                </Link>
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10" asChild>
                                <Link href="/keuangan/laporan">
                                    Keuangan
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
