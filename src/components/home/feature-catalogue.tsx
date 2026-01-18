"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, BarChart3, Megaphone, Users } from "lucide-react"

const features = [
    {
        icon: FileText,
        title: "Persuratan Digital",
        description: "Urus KTP, KK, dan surat pengantar lainnya secara online.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        icon: BarChart3,
        title: "Keuangan Transparan",
        description: "Akses laporan Iuran dan penggunaan dana RT secara real-time.",
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
    {
        icon: Megaphone,
        title: "Pengaduan & Darurat",
        description: "Lapor masalah lingkungan atau gunakan Tombol Panik saat mendesak.",
        color: "text-red-500",
        bg: "bg-red-500/10",
    },
    {
        icon: Users,
        title: "Database & UMKM Warga",
        description: "Data kependudukan terpadu dan etalase usaha lokal warga.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
]

export function FeatureCatalogue() {
    return (
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">Katalog Fitur Utama PRISMA</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <Card key={index} className="border-none shadow-md hover:shadow-lg transition-all duration-300">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <CardTitle className="text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-muted-foreground">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
