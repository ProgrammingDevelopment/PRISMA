"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Wallet,
    QrCode,
    CalendarCheck,
    ClipboardCheck,
    Lightbulb,
    MessageCircle,
    ChevronRight,
    CheckCircle,
    Clock,
    Sparkles,
    ArrowRight,
    BarChart3
} from "lucide-react"

// --- Data Types & Static Data ---

interface StrategicFeature {
    id: string
    number: number
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    href: string
    status: 'active' | 'coming_soon' | 'beta'
}

const strategicFeatures: StrategicFeature[] = [
    {
        id: 'iuran',
        number: 1,
        title: 'Pertahankan Tingkat Iuran',
        description: 'Nominal Rp 25.000/bulan masih wajar. Fokus tingkatkan kepatuhan pembayaran tepat waktu hingga 95%.',
        icon: Wallet,
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/30',
        href: '/keuangan/iuran',
        status: 'active'
    },
    {
        id: 'digitalisasi',
        number: 2,
        title: 'Digitalisasi Pembayaran',
        description: 'Aktivasi QRIS & Virtual Account untuk transparansi pencatatan real-time dan kemudahan warga.',
        icon: QrCode,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        href: '/keuangan/pembayaran',
        status: 'active'
    },
    {
        id: 'event',
        number: 3,
        title: 'Optimasi Dana Event',
        description: 'Alokasikan budget tahunan khusus. Gunakan data historis untuk prediksi biaya kegiatan HUT RI.',
        icon: CalendarCheck,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        href: '/keuangan/event-budget',
        status: 'active'
    },
    {
        id: 'audit',
        number: 4,
        title: 'Smart Audit System',
        description: 'Audit otomatis berbasis AI setiap kuartal dengan pengawas independen dari warga terpilih.',
        icon: ClipboardCheck,
        color: 'text-amber-500',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        href: '/admin/audit',
        status: 'beta'
    },
    {
        id: 'infrastruktur',
        number: 5,
        title: 'Infrastruktur Cerdas',
        description: 'Investasi surplus dana ke CCTV pintar dan penerangan jalan otomatis (IoT).',
        icon: Lightbulb,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
        href: '/admin/infrastruktur',
        status: 'coming_soon'
    },
    {
        id: 'publikasi',
        number: 6,
        title: 'Transparansi Publik',
        description: 'Auto-generate laporan visual bulanan ke WhatsApp Group untuk menjaga kepercayaan tinggi.',
        icon: MessageCircle,
        color: 'text-rose-500',
        bgColor: 'bg-rose-100 dark:bg-rose-900/30',
        href: '/keuangan/share',
        status: 'active'
    }
]

const statusBadge = {
    active: {
        label: 'Aktif',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    beta: {
        label: 'Beta AI',
        icon: Sparkles,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    },
    coming_soon: {
        label: 'Segera',
        icon: Clock,
        className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
    }
}

// --- Animation Variants (with proper types) ---

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
} as const

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15
        }
    }
} as const

// --- Component ---

export function StrategicFeatures() {
    const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

    return (
        <section className="py-16 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5 -z-10" />
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 ring-1 ring-primary/20">
                            <Sparkles className="w-4 h-4" />
                            AI-Powered Insights
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                            Rekomendasi Strategis Cerdas
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                            Analisis mendalam dari data RT 04 menghasilkan 6 langkah strategis untuk efisiensi dan transparansi maksimal.
                        </p>
                    </motion.div>
                </div>

                {/* Features Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {strategicFeatures.map((feature) => {
                        const Icon = feature.icon
                        const Status = statusBadge[feature.status]
                        const StatusIcon = Status.icon
                        const isHovered = hoveredFeature === feature.id
                        const isClickable = feature.status !== 'coming_soon'

                        return (
                            <motion.div key={feature.id} variants={itemVariants}>
                                <Card
                                    className={`
                    h-full relative overflow-hidden transition-all duration-300 border bg-background/50 backdrop-blur-sm
                    ${isHovered ? 'shadow-lg border-primary/50 translate-y-[-4px]' : 'border-border/50 hover:border-border'}
                    ${!isClickable && 'opacity-70'}
                  `}
                                    onMouseEnter={() => setHoveredFeature(feature.id)}
                                    onMouseLeave={() => setHoveredFeature(null)}
                                >
                                    {/* Decorative Number Background */}
                                    <div className="absolute -top-6 -right-6 text-9xl font-bold opacity-[0.03] select-none pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.06]">
                                        {feature.number}
                                    </div>

                                    <CardContent className="p-6 flex flex-col h-full z-10 relative">
                                        {/* Header Row */}
                                        <div className="flex items-start justify-between mb-5">
                                            <div className={`p-3 rounded-xl ${feature.bgColor} transition-colors duration-300`}>
                                                <Icon className={`h-6 w-6 ${feature.color}`} />
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${Status.className.replace('bg-', 'ring-').replace('text-', 'bg-transparent text-')} bg-opacity-10`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {Status.label}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>

                                        {/* Footer / Action */}
                                        <div className="mt-6 pt-4 border-t border-dashed border-border/50 flex items-center justify-between">
                                            <span className="text-xs font-mono text-muted-foreground opacity-60">
                                                #{feature.id.toUpperCase()}
                                            </span>

                                            {isClickable ? (
                                                <Link href={feature.href} className="outline-none">
                                                    <span className={`flex items-center text-sm font-semibold transition-all group ${feature.color} hover:underline decoration-2 underline-offset-4`}>
                                                        Akses Fitur
                                                        <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    Segera Hadir
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-16"
                >
                    <div className="inline-block p-1 rounded-full bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 backdrop-blur-sm">
                        <Button asChild size="lg" className="rounded-full px-8 h-12 shadow-lg hover:shadow-primary/25 transition-all w-full md:w-auto">
                            <Link href="/keuangan/laporan" className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Lihat Laporan & Analisis Lengkap
                                <ChevronRight className="h-4 w-4 ml-1 opacity-70" />
                            </Link>
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 max-w-md mx-auto">
                        *Rekomendasi diperbarui secara real-time berdasarkan input data terbaru dari pengurus RT.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}

export default StrategicFeatures
