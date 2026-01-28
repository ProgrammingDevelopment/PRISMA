"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Folder,
    FileText,
    Shield,
    DollarSign,
    Users,
    ChevronRight,
    Lock,
    BarChart3,
    Search,
    Clock,
    CheckCircle,
    AlertTriangle
} from "lucide-react"

interface ServiceCard {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    color: string;
    gradient: string;
    badge?: string;
    badgeColor?: string;
}

const digitalServices: ServiceCard[] = [
    {
        id: 'administrasi',
        title: 'Subfolder Administrasi',
        description: 'Akses data warga, pengurus RT, dan statistik kependudukan',
        icon: Users,
        href: '/layanan/administrasi',
        color: 'text-purple-400',
        gradient: 'from-purple-600 to-purple-800',
    },
    {
        id: 'surat',
        title: 'Subfolder Surat Menyurat',
        description: 'Download template surat dan ajukan permohonan online',
        icon: FileText,
        href: '/surat',
        color: 'text-blue-400',
        gradient: 'from-blue-600 to-blue-800',
        badge: '6 Template',
        badgeColor: 'bg-blue-500',
    },
    {
        id: 'keuangan',
        title: 'Laporan Keuangan',
        description: 'Lihat laporan keuangan bulanan dan download PDF',
        icon: BarChart3,
        href: '/keuangan/laporan',
        color: 'text-green-400',
        gradient: 'from-green-600 to-green-800',
        badge: 'Download PDF',
        badgeColor: 'bg-green-500',
    },
    {
        id: 'keamanan',
        title: 'Laporan Keamanan',
        description: 'Laporkan kejadian keamanan dengan proteksi data',
        icon: Shield,
        href: '/surat/keamanan',
        color: 'text-red-400',
        gradient: 'from-red-600 to-red-800',
        badge: 'Encrypted',
        badgeColor: 'bg-red-500',
    },
];

export default function LayananPage() {
    const [stats, setStats] = useState({
        totalTemplates: 0,
        reportsProcessed: 0,
        securityReports: 0,
    });

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch letter templates count
                const suratRes = await fetch('/api/database/surat');
                const suratData = await suratRes.json();
                if (suratData.success) {
                    setStats(prev => ({ ...prev, totalTemplates: suratData.data.length }));
                }

                // Fetch security stats
                const securityRes = await fetch('/api/database/keamanan?type=stats');
                const securityData = await securityRes.json();
                if (securityData.success) {
                    setStats(prev => ({
                        ...prev,
                        securityReports: securityData.data.total,
                        reportsProcessed: securityData.data.resolved
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                        <Link href="/">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Layanan Digital</h1>
                        <p className="text-gray-400">Pilih layanan yang Anda butuhkan</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-purple-400">{stats.totalTemplates}</div>
                            <div className="text-sm text-gray-400">Template Surat</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-green-400">3</div>
                            <div className="text-sm text-gray-400">Laporan Bulan</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{stats.securityReports}</div>
                            <div className="text-sm text-gray-400">Laporan Keamanan</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-4 text-center">
                            <div className="text-3xl font-bold text-amber-400">{stats.reportsProcessed}</div>
                            <div className="text-sm text-gray-400">Selesai Diproses</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {digitalServices.map((service) => {
                        const Icon = service.icon;
                        return (
                            <Link key={service.id} href={service.href} className="group">
                                <Card className={`h-full bg-gradient-to-br ${service.gradient} border-0 text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-4 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                                                <Icon className="h-8 w-8" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-xl">{service.title}</h3>
                                                    {service.badge && (
                                                        <span className={`px-2 py-0.5 ${service.badgeColor} rounded-full text-xs`}>
                                                            {service.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-white/80">{service.description}</p>
                                            </div>
                                            <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Feature Highlights */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-400" />
                                </div>
                                <h4 className="font-semibold text-white">Transparan</h4>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Semua laporan keuangan dapat diunduh dan diverifikasi oleh warga
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Lock className="h-5 w-5 text-blue-400" />
                                </div>
                                <h4 className="font-semibold text-white">Aman</h4>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Data dilindungi dengan bcrypt, OWASP security, dan proteksi XSS
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Clock className="h-5 w-5 text-purple-400" />
                                </div>
                                <h4 className="font-semibold text-white">Cepat</h4>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Proses pengajuan surat dan laporan secara online 24/7
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Security Info */}
                <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-cyan-500/20 rounded-xl">
                                <Shield className="h-8 w-8 text-cyan-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-lg mb-2">Keamanan Data</h4>
                                <p className="text-gray-400 mb-4">
                                    Sistem PRISMA RT 04 mengimplementasikan standar keamanan tingkat tinggi untuk melindungi data warga:
                                </p>
                                <div className="grid md:grid-cols-4 gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-300">bcrypt</span>
                                        <span className="text-gray-400">Enkripsi password</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 bg-green-500/20 rounded text-green-300">OWASP</span>
                                        <span className="text-gray-400">Security headers</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">Anti-XSS</span>
                                        <span className="text-gray-400">Input sanitization</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="px-2 py-1 bg-amber-500/20 rounded text-amber-300">OSINT</span>
                                        <span className="text-gray-400">Data masking</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
