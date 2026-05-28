"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { X, Smartphone, Download, Share2, PlusSquare, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Cek jika sudah dalam mode standalone (sudah diinstall)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as unknown as { standalone: boolean }).standalone === true
        if (isStandalone) {
            // Use a microtask to avoid synchronous setState in effect body
            queueMicrotask(() => setIsInstalled(true))
            return
        }

        // Handler untuk event beforeinstallprompt (Android/Desktop)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            // Tampilkan prompt setelah delay kecil agar tidak mengganggu load awal
            setTimeout(() => setShowPrompt(true), 3000)
        }

        // Deteksi iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
        setTimeout(() => {
            setIsIOS(isIosDevice)
        }, 0)

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Tampilkan instruksi manual untuk iOS jika belum diinstall
        if (isIosDevice && !isStandalone) {
            const hasSeenIOSPrompt = localStorage.getItem('prisma_ios_prompt_seen')
            if (!hasSeenIOSPrompt) {
                setTimeout(() => setShowPrompt(true), 3000)
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const choiceResult = await deferredPrompt.userChoice

        if (choiceResult.outcome === 'accepted') {
            setShowPrompt(false)
            setIsInstalled(true)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        if (isIOS) {
            localStorage.setItem('prisma_ios_prompt_seen', 'true')
        }
    }

    if (isInstalled) return null

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-[420px] z-50"
                >
                    <div className="bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-5 flex flex-col gap-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex gap-3.5">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg ring-1 ring-border shrink-0">
                                    <Image
                                        src="/images/icons/icon-512x512.png"
                                        alt="PRISMA RT 04"
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            target.style.display = 'none'
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                                        <Smartphone className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground text-base">Install PRISMA</h3>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        Akses cepat tanpa browser, bisa offline
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                                            <Monitor className="w-2.5 h-2.5" /> Desktop
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                                            <Smartphone className="w-2.5 h-2.5" /> Mobile
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                                aria-label="Tutup prompt install"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Platform-specific instructions */}
                        {isIOS ? (
                            <div className="text-sm text-muted-foreground bg-muted/70 p-4 rounded-xl space-y-2.5">
                                <p className="font-semibold text-foreground">Install di iPhone/iPad:</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                                            <Share2 className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        <span>Ketuk tombol <strong>Share</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-lg bg-blue-500/10">
                                            <PlusSquare className="w-3.5 h-3.5 text-blue-500" />
                                        </div>
                                        <span>Pilih <strong>Add to Home Screen</strong></span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={handleInstall} className="w-full gap-2 h-11 text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all">
                                <Download className="h-4 w-4" />
                                Install Sekarang — Gratis
                            </Button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
