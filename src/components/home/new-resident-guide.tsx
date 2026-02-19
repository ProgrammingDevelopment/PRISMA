"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    BookOpen,
    MapPin,
    Phone,
    Users,
    CalendarDays,
    FileText,
    Trash2,
    ShieldCheck,
    Clock,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Home,
    Heart
} from "lucide-react"

interface GuideSection {
    id: string
    title: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    items: string[]
}

const guideSections: GuideSection[] = [
    {
        id: "alamat",
        title: "Lokasi & Alamat Sekretariat",
        icon: MapPin,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        items: [
            "Sekretariat RT 04 RW 09 berada di Gg. Bugis No.95, Kemayoran, Jakarta Pusat 10620.",
            "Jam pelayanan: Senin–Minggu, 08.00–20.00 WIB.",
            "Koordinat GPS tersedia di halaman Kontak untuk navigasi langsung."
        ]
    },
    {
        id: "pengurus",
        title: "Mengenal Pengurus RT",
        icon: Users,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        items: [
            "Ketua RT bertanggung jawab atas koordinasi seluruh kegiatan dan kebijakan.",
            "Sekretaris menangani surat-menyurat dan data administrasi warga.",
            "Bendahara mengelola iuran, pemasukan, dan pelaporan keuangan.",
            "Hubungi pengurus melalui WhatsApp yang tersedia di halaman Kontak."
        ]
    },
    {
        id: "iuran",
        title: "Iuran & Kewajiban Warga",
        icon: Heart,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        items: [
            "Iuran bulanan warga sebesar Rp 25.000/bulan untuk kebersihan, keamanan, dan operasional.",
            "Pembayaran dapat dilakukan tunai ke Bendahara atau melalui QRIS/transfer digital.",
            "Laporan penggunaan dana iuran bisa dilihat di halaman Laporan Keuangan setiap bulan."
        ]
    },
    {
        id: "kegiatan",
        title: "Kegiatan Rutin RT",
        icon: CalendarDays,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        items: [
            "Kerja Bakti: Dilaksanakan setiap hari Minggu ke-3 setiap bulan (pagi jam 07.00).",
            "Ronda Malam: Jadwal giliran per blok, dikoordinasi oleh Koordinator Keamanan.",
            "Rapat Warga: Diadakan sesuai kebutuhan, biasanya di Poskamling atau rumah Ketua RT.",
            "HUT RI & Acara Tahunan: Persiapan dimulai 2 bulan sebelumnya, partisipasi sukarela."
        ]
    },
    {
        id: "kebersihan",
        title: "Aturan Kebersihan Lingkungan",
        icon: Trash2,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        items: [
            "Sampah organik dan non-organik dipisahkan ke tempat yang telah disediakan.",
            "Pengumpulan sampah oleh petugas dilakukan setiap hari Senin, Rabu, dan Jumat.",
            "Dilarang membuang sampah di saluran air atau di luar tempat yang telah ditentukan.",
            "Warga bertanggung jawab menjaga kebersihan area depan rumah masing-masing."
        ]
    },
    {
        id: "keamanan",
        title: "Keamanan & Ketertiban",
        icon: ShieldCheck,
        color: "text-cyan-500",
        bgColor: "bg-cyan-500/10",
        items: [
            "Warga wajib melapor jika melihat kegiatan mencurigakan melalui fitur Laporan Keamanan.",
            "Tamu yang menginap lebih dari 1x24 jam wajib dilaporkan ke RT.",
            "Kendaraan asing yang parkir lama di lingkungan RT agar dilaporkan.",
            "Untuk darurat keamanan, hubungi Koordinator Keamanan RT via WhatsApp 24 jam."
        ]
    },
]

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

export function NewResidentGuide() {
    const [expandedSection, setExpandedSection] = useState<string | null>("alamat")

    const toggleSection = (id: string) => {
        setExpandedSection(prev => prev === id ? null : id)
    }

    return (
        <section id="panduan-warga" className="py-16 bg-muted/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent -z-10" />

            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-10"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4 ring-1 ring-emerald-500/20">
                        <BookOpen className="w-4 h-4" />
                        Panduan Warga Baru
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Selamat Datang di RT 04!
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                        Informasi penting untuk warga baru tentang aturan, kegiatan, dan cara berpartisipasi di lingkungan RT 04 Kemayoran.
                    </p>
                </motion.div>

                {/* Guide Sections - Accordion Style */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="space-y-3"
                >
                    {guideSections.map((section) => {
                        const Icon = section.icon
                        const isExpanded = expandedSection === section.id
                        return (
                            <motion.div key={section.id} variants={itemVariants}>
                                <Card className={`overflow-hidden transition-all duration-300 border ${isExpanded ? 'shadow-md border-primary/30' : 'border-border/50 hover:border-border'}`}>
                                    {/* Header - Clickable */}
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        aria-expanded={isExpanded}
                                        aria-controls={`guide-content-${section.id}`}
                                    >
                                        <div className={`p-2.5 rounded-xl ${section.bgColor} shrink-0`}>
                                            <Icon className={`h-5 w-5 ${section.color}`} />
                                        </div>
                                        <span className="font-semibold text-base flex-1">{section.title}</span>
                                        {isExpanded ? (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                                        )}
                                    </button>

                                    {/* Content */}
                                    {isExpanded && (
                                        <div
                                            id={`guide-content-${section.id}`}
                                            className="px-5 pb-5 pt-0"
                                        >
                                            <div className="pl-[52px] space-y-2.5">
                                                {section.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-2.5">
                                                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${section.bgColor} shrink-0`} />
                                                        <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 text-center"
                >
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button asChild size="lg" className="rounded-full px-6 gap-2">
                            <a href="https://wa.me/6287872004448?text=Halo%20Pak%20RT%2C%20saya%20warga%20baru%20di%20RT%2004." target="_blank" rel="noopener noreferrer">
                                <Phone className="h-4 w-4" />
                                Hubungi Pengurus RT
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full px-6 gap-2">
                            <Link href="#contact">
                                <Home className="h-4 w-4" />
                                Lokasi Sekretariat
                            </Link>
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                        Ada pertanyaan? Jangan ragu untuk menghubungi pengurus RT kapan saja.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
