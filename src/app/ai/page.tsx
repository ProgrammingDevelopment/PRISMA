"use client"

import AIDashboard from "@/components/ai/AIDashboard"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"

export default function AIPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali ke Beranda
                        </Link>
                    </Button>

                    <Button variant="outline" asChild>
                        <Link href="/ai/education">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Edukasi AI
                        </Link>
                    </Button>
                </div>

                {/* Dashboard */}
                <AIDashboard />

                {/* Additional Info */}
                <div className="mt-12 p-6 bg-muted/50 rounded-xl">
                    <h2 className="text-xl font-bold mb-4">Tentang Platform AI PRISMA</h2>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
                        <div>
                            <h3 className="font-medium text-foreground mb-2">Teknologi</h3>
                            <ul className="space-y-1">
                                <li>• TensorFlow/Keras untuk deep learning</li>
                                <li>• PyTorch untuk computer vision</li>
                                <li>• scikit-learn untuk machine learning klasik</li>
                                <li>• Hugging Face Transformers untuk NLP</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-medium text-foreground mb-2">Kapabilitas</h3>
                            <ul className="space-y-1">
                                <li>• 16 kualifikasi AI/ML terpenuhi</li>
                                <li>• Analisis sentimen bahasa Indonesia</li>
                                <li>• Prediksi keuangan jangka panjang</li>
                                <li>• Segmentasi dan clustering warga</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
