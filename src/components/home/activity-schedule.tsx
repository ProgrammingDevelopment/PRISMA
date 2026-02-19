"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import {
    Calendar,
    Clock,
    MapPin,
    Trash2,
    Shield,
    Wrench,
    Users,
    Repeat
} from "lucide-react"

interface ScheduleItem {
    id: string
    title: string
    schedule: string
    time: string
    location: string
    frequency: string
    icon: React.ComponentType<{ className?: string }>
    color: string
    bgColor: string
    gradient: string
}

const scheduleItems: ScheduleItem[] = [
    {
        id: "kerja-bakti",
        title: "Kerja Bakti",
        schedule: "Minggu ke-3 setiap bulan",
        time: "07.00 - 10.00 WIB",
        location: "Area RT 04",
        frequency: "Bulanan",
        icon: Wrench,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        gradient: "from-emerald-500/20 to-teal-500/10",
    },
    {
        id: "ronda",
        title: "Ronda Malam",
        schedule: "Setiap malam (bergilir per blok)",
        time: "22.00 - 04.00 WIB",
        location: "Poskamling RT 04",
        frequency: "Harian",
        icon: Shield,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        gradient: "from-blue-500/20 to-indigo-500/10",
    },
    {
        id: "sampah",
        title: "Pengumpulan Sampah",
        schedule: "Senin, Rabu, Jumat",
        time: "06.00 - 08.00 WIB",
        location: "Depan rumah masing-masing",
        frequency: "3x/minggu",
        icon: Trash2,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        gradient: "from-amber-500/20 to-orange-500/10",
    },
    {
        id: "rapat",
        title: "Rapat Warga",
        schedule: "Sesuai kebutuhan (minimal 1x/kuartal)",
        time: "19.30 WIB",
        location: "Poskamling / Rumah Ketua RT",
        frequency: "Kuartal",
        icon: Users,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        gradient: "from-purple-500/20 to-violet-500/10",
    },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 100, damping: 14 }
    }
}

export function ActivitySchedule() {
    return (
        <section id="jadwal" className="py-16 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent -z-10" />

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-12"
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4 ring-1 ring-blue-500/20">
                        <Calendar className="w-4 h-4" />
                        Jadwal Kegiatan
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                        Agenda Rutin RT 04
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                        Jadwal kegiatan rutin yang perlu diketahui oleh setiap warga RT 04.
                    </p>
                </motion.div>

                {/* Schedule Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    className="grid sm:grid-cols-2 gap-6"
                >
                    {scheduleItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <motion.div key={item.id} variants={itemVariants}>
                                <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] border border-border/50 hover:border-border">
                                    <CardContent className="p-0">
                                        {/* Top accent bar */}
                                        <div className={`h-1 bg-gradient-to-r ${item.gradient}`} />

                                        <div className="p-6">
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className={`p-3 rounded-xl ${item.bgColor} shrink-0 group-hover:scale-110 transition-transform`}>
                                                    <Icon className={`h-6 w-6 ${item.color}`} />
                                                </div>

                                                {/* Title + Frequency Badge */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg">{item.title}</h3>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.bgColor} ${item.color}`}>
                                                            {item.frequency}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
                                                        <Repeat className="h-3.5 w-3.5" />
                                                        {item.schedule}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                                                    <Clock className={`h-4 w-4 ${item.color} shrink-0`} />
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Waktu</p>
                                                        <p className="text-sm font-medium">{item.time}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                                                    <MapPin className={`h-4 w-4 ${item.color} shrink-0`} />
                                                    <div>
                                                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Lokasi</p>
                                                        <p className="text-sm font-medium">{item.location}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </motion.div>
            </div>
        </section>
    )
}
