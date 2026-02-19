"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BarChart3, Calendar, Phone } from "lucide-react"

const items = [
    {
        id: 1,
        heading: "Guyub Rukun Warga RT 04 Kemayoran",
        // description: "Membangun sinergi dan kebersamaan melalui gotong royong digital dan fisik.",
        text: "Membangun sinergi dan kebersamaan melalui gotong royong digital dan fisik.",
        bgClass: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600",
    },
    {
        id: 2,
        heading: "Transparansi dalam Genggaman",
        text: "Pantau arus kas dan ajukan surat pengantar kapan saja, di mana saja.",
        bgClass: "bg-gradient-to-r from-teal-500 via-emerald-500 to-green-600",
    },
    {
        id: 3,
        heading: "Lingkungan Aman & Terpantau",
        text: "Integrasi sistem keamanan dan respon darurat 24 jam untuk ketenangan warga.",
        bgClass: "bg-gradient-to-r from-orange-500 via-red-500 to-rose-600",
    },
]

export function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = React.useState(0)

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [])

    const next = () => setCurrentIndex((prev) => (prev + 1) % items.length)
    const prev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)

    return (
        <div className="relative h-[580px] w-full overflow-hidden bg-muted">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`absolute inset-0 flex items-center justify-center ${items[currentIndex].bgClass}`}
                >
                    <div className="absolute inset-0 bg-black/20" /> {/* Overlay for better text readability */}
                    <div className="container relative z-10 px-4 text-center text-white">
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="mb-4 text-4xl font-bold tracking-tight md:text-6xl drop-shadow-md"
                        >
                            {items[currentIndex].heading}
                        </motion.h1>
                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="mb-8 text-xl font-medium md:text-2xl opacity-90 drop-shadow-sm max-w-3xl mx-auto"
                        >
                            {items[currentIndex].text}
                        </motion.p>
                        {/* Quick Action Buttons - PRD Spec */}
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="flex flex-wrap justify-center gap-3"
                        >
                            <Button asChild size="lg" className="bg-white/95 text-slate-900 hover:bg-white font-semibold shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] active:scale-95 rounded-full px-6">
                                <Link href="/keuangan/laporan">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Laporan Keuangan
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-2 border-white/70 text-white hover:bg-white/15 hover:border-white font-semibold rounded-full px-6 transition-all hover:translate-y-[-2px] active:scale-95">
                                <Link href="/#jadwal">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Jadwal Kegiatan
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-2 border-white/70 text-white hover:bg-white/15 hover:border-white font-semibold rounded-full px-6 transition-all hover:translate-y-[-2px] active:scale-95">
                                <Link href="/#contact">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Hubungi RT
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white rounded-full h-12 w-12 z-20"
            >
                <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white rounded-full h-12 w-12 z-20"
            >
                <ChevronRight className="h-8 w-8" />
            </Button>
        </div>
    )
}
