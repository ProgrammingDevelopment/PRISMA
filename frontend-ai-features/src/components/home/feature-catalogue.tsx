"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, BarChart3, Megaphone, Users, ChevronRight } from "lucide-react"

const features = [
    {
        icon: FileText,
        title: "Persuratan Digital",
        description: "Urus KTP, KK, dan surat pengantar lainnya secara online.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        href: "/surat",
    },
    {
        icon: BarChart3,
        title: "Keuangan Transparan",
        description: "Akses laporan Iuran dan penggunaan dana RT secara real-time.",
        color: "text-green-500",
        bg: "bg-green-500/10",
        href: "/keuangan/laporan",
    },
    {
        icon: Megaphone,
        title: "Pengaduan & Keamanan",
        description: "Lapor masalah keamanan lingkungan dengan proteksi data terenkripsi.",
        color: "text-red-500",
        bg: "bg-red-500/10",
        href: "/surat/keamanan",
    },
    {
        icon: Users,
        title: "Database & Administrasi",
        description: "Data kependudukan terpadu dan layanan administrasi warga.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        href: "/layanan/administrasi",
    },
]

export function FeatureCatalogue() {
    return (
        <section className="py-12 bg-background">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-4">Katalog Fitur Utama PRISMA</h2>
                <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Klik pada fitur untuk mengakses layanan digital RT 04
                </p>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <Link key={index} href={feature.href}>
                            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group h-full hover:scale-[1.02]">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                        <ChevronRight className={`h-5 w-5 ${feature.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base text-muted-foreground">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
