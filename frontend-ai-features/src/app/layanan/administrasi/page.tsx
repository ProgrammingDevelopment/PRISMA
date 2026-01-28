"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Users,
    UserCheck,
    BarChart3,
    Search,
    Phone,
    MapPin,
    Calendar,
    ChevronRight
} from "lucide-react"

interface WargaData {
    id: number;
    nama: string;
    alamat: string;
    status: string;
    telepon: string;
}

interface PengurusData {
    id: number;
    nama: string;
    jabatan: string;
    periode: string;
}

interface StatistikData {
    totalWarga: number;
    totalKK: number;
    wargaAktif: number;
    pendatangBaru: number;
}

export default function AdministrasiPage() {
    const [activeTab, setActiveTab] = useState<'warga' | 'pengurus' | 'statistik'>('warga');
    const [wargaData, setWargaData] = useState<WargaData[]>([]);
    const [pengurusData, setPengurusData] = useState<PengurusData[]>([]);
    const [statistikData, setStatistikData] = useState<StatistikData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/database/administrasi');
                const data = await response.json();
                if (data.success) {
                    setWargaData(data.data.warga);
                    setPengurusData(data.data.pengurus);
                    setStatistikData(data.data.statistik);
                }
            } catch (error) {
                console.error('Failed to fetch administration data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredWarga = wargaData.filter(w =>
        w.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.alamat.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: 'warga', label: 'Data Warga', icon: Users },
        { id: 'pengurus', label: 'Pengurus RT', icon: UserCheck },
        { id: 'statistik', label: 'Statistik', icon: BarChart3 },
    ];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                        <Link href="/layanan">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Subfolder Administrasi</h1>
                        <p className="text-purple-200">Data warga dan pengurus RT 04</p>
                    </div>
                </div>

                {/* Stats Summary */}
                {statistikData && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-0 text-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold">{statistikData.totalWarga}</div>
                                <div className="text-sm text-purple-200">Total Warga</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-0 text-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold">{statistikData.totalKK}</div>
                                <div className="text-sm text-blue-200">Kepala Keluarga</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-600 to-green-800 border-0 text-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold">{statistikData.wargaAktif}</div>
                                <div className="text-sm text-green-200">Warga Aktif</div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-600 to-orange-700 border-0 text-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-3xl font-bold">{statistikData.pendatangBaru}</div>
                                <div className="text-sm text-amber-200">Pendatang Baru</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "default" : "outline"}
                                onClick={() => setActiveTab(tab.id as 'warga' | 'pengurus' | 'statistik')}
                                className={activeTab === tab.id
                                    ? "bg-purple-600 hover:bg-purple-700"
                                    : "border-white/20 text-white hover:bg-white/10"
                                }
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Content */}
                {activeTab === 'warga' && (
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari warga berdasarkan nama atau alamat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Warga List */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {filteredWarga.map((warga) => (
                                <Card key={warga.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                                                <Users className="h-6 w-6 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-white">{warga.nama}</h4>
                                                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{warga.alamat}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{warga.telepon}</span>
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs ${warga.status === 'Aktif' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {warga.status}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredWarga.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400">Tidak ada warga ditemukan</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'pengurus' && (
                    <div className="grid md:grid-cols-2 gap-4">
                        {pengurusData.map((pengurus) => (
                            <Card key={pengurus.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                                            <UserCheck className="h-8 w-8 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white text-lg">{pengurus.nama}</h4>
                                            <div className="text-purple-400 font-medium">{pengurus.jabatan}</div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>Periode {pengurus.periode}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'statistik' && statistikData && (
                    <div className="space-y-6">
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Statistik Kependudukan</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Data terkini warga RT 04
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                                <Users className="h-5 w-5 text-purple-400" />
                                            </div>
                                            <span className="text-white">Total Warga Terdaftar</span>
                                        </div>
                                        <span className="text-2xl font-bold text-purple-400">{statistikData.totalWarga}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <Users className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <span className="text-white">Jumlah Kepala Keluarga</span>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-400">{statistikData.totalKK}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/20 rounded-lg">
                                                <UserCheck className="h-5 w-5 text-green-400" />
                                            </div>
                                            <span className="text-white">Warga Aktif</span>
                                        </div>
                                        <span className="text-2xl font-bold text-green-400">{statistikData.wargaAktif}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                                <Users className="h-5 w-5 text-amber-400" />
                                            </div>
                                            <span className="text-white">Pendatang Baru (Bulan Ini)</span>
                                        </div>
                                        <span className="text-2xl font-bold text-amber-400">{statistikData.pendatangBaru}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Persentase */}
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Tingkat Keaktifan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Warga Aktif</span>
                                        <span className="text-green-400 font-semibold">
                                            {((statistikData.wargaAktif / statistikData.totalWarga) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                            style={{ width: `${(statistikData.wargaAktif / statistikData.totalWarga) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
