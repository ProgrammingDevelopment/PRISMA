"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Megaphone,
    Calendar,
    Clock,
    ChevronRight,
    Bell,
    Pin,
    Users,
    Wrench,
    Shield,
    PartyPopper,
    AlertCircle
} from "lucide-react"

interface Announcement {
    id: string
    title: string
    description: string
    date: string
    type: "urgent" | "info" | "event" | "maintenance"
    pinned?: boolean
}

const announcements: Announcement[] = [
    {
        id: "1",
        title: "Kerja Bakti Bulanan - Februari 2026",
        description: "Kerja bakti rutin pembersihan lingkungan RT 04. Seluruh warga diharapkan berpartisipasi. Peralatan disediakan oleh pengurus RT.",
        date: "2026-02-16",
        type: "event",
        pinned: true,
    },
    {
        id: "2",
        title: "Jadwal Ronda Malam Minggu III",
        description: "Jadwal ronda malam untuk minggu ketiga Februari telah diperbarui. Silakan cek di papan pengumuman atau hubungi Ketua Keamanan.",
        date: "2026-02-15",
        type: "info",
    },
    {
        id: "3",
        title: "Laporan Keuangan Januari 2026 Tersedia",
        description: "Laporan keuangan bulan Januari sudah tersedia untuk diunduh. Transparansi penuh untuk warga RT 04.",
        date: "2026-02-05",
        type: "info",
    },
    {
        id: "4",
        title: "Perbaikan Penerangan Jalan Gang Bugis",
        description: "Tim infrastruktur akan melakukan perbaikan lampu jalan di area Gang Bugis pada hari Sabtu. Mohon waspada saat melintas.",
        date: "2026-02-14",
        type: "maintenance",
    },
    {
        id: "5",
        title: "Persiapan HUT RI ke-81",
        description: "Rapat koordinasi persiapan HUT RI akan diadakan di Poskamling. Diperlukan partisipasi warga untuk kepanitiaan.",
        date: "2026-02-20",
        type: "event",
    },
]

const typeConfig = {
    urgent: {
        icon: AlertCircle,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        badge: "bg-red-500 text-white",
        label: "Penting"
    },
    info: {
        icon: Bell,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        badge: "bg-blue-500 text-white",
        label: "Info"
    },
    event: {
        icon: PartyPopper,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        badge: "bg-emerald-500 text-white",
        label: "Kegiatan"
    },
    maintenance: {
        icon: Wrench,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        badge: "bg-amber-500 text-white",
        label: "Perawatan"
    },
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date)
}

function daysFromNow(dateStr: string): string {
    const now = new Date()
    const target = new Date(dateStr)
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return "Hari ini"
    if (diff === 1) return "Besok"
    if (diff > 0 && diff <= 7) return `${diff} hari lagi`
    if (diff < 0) return `${Math.abs(diff)} hari lalu`
    return formatDate(dateStr)
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 120, damping: 14 }
    }
}

export function AnnouncementsFeed() {
    const [showAll, setShowAll] = useState(false)
    const visibleAnnouncements = showAll ? announcements : announcements.slice(0, 3)

    return (
        <section id="pengumuman" className="py-16 bg-muted/20">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-10"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4 ring-1 ring-amber-500/20">
                        <Megaphone className="w-4 h-4" />
                        Pengumuman & Agenda
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Kabar Terbaru RT 04
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Informasi terkini, jadwal kegiatan, dan pengumuman penting untuk warga RT 04 Kemayoran.
                    </p>
                </motion.div>

                {/* Announcements List */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="space-y-4"
                >
                    {visibleAnnouncements.map((item) => {
                        const config = typeConfig[item.type]
                        const Icon = config.icon
                        return (
                            <motion.div key={item.id} variants={itemVariants}>
                                <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] border ${item.pinned ? config.border + ' shadow-md' : 'border-border/50'}`}>
                                    <CardContent className="p-5">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`p-3 rounded-xl ${config.bg} shrink-0 transition-transform duration-200 group-hover:scale-110`}>
                                                <Icon className={`h-5 w-5 ${config.color}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                    {item.pinned && (
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                            <Pin className="h-3 w-3" />
                                                            Dipin
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.badge}`}>
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-base sm:text-lg leading-tight mb-1.5 group-hover:text-primary transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>

                                            {/* Date */}
                                            <div className="hidden sm:flex flex-col items-end shrink-0 text-right">
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(item.date)}
                                                </div>
                                                <span className={`text-xs font-medium ${config.color}`}>
                                                    {daysFromNow(item.date)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Mobile date */}
                                        <div className="flex sm:hidden items-center gap-2 mt-3 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(item.date)} — <span className={`font-medium ${config.color}`}>{daysFromNow(item.date)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* Show More / Less */}
                {announcements.length > 3 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mt-6"
                    >
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setShowAll(!showAll)}
                            className="rounded-full px-6 group"
                        >
                            {showAll ? "Tampilkan Sedikit" : `Lihat Semua (${announcements.length})`}
                            <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showAll ? "rotate-90" : "group-hover:translate-x-1"}`} />
                        </Button>
                    </motion.div>
                )}
            </div>
        </section>
    )
}
