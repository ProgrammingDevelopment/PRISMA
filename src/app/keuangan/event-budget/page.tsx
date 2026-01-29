"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    CalendarCheck,
    Plus,
    Edit,
    Trash2,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    TrendingUp,
    TrendingDown,
    Calculator
} from "lucide-react"
import { ANNUAL_EVENTS, formatRupiah, calculateEventBudgetVariance, EventBudget } from "@/lib/strategic-recommendations"

// Mock data for existing event budgets
const mockEventBudgets: EventBudget[] = [
    {
        id: '1',
        eventName: 'HUT RI ke-81 (17 Agustus 2026)',
        eventDate: '2026-08-17',
        allocatedBudget: 3000000,
        actualExpense: 0,
        status: 'planned',
        notes: 'Lomba 17an, dekorasi, dan hadiah'
    },
    {
        id: '2',
        eventName: 'Halal Bihalal 2026',
        eventDate: '2026-04-15',
        allocatedBudget: 1500000,
        actualExpense: 0,
        status: 'planned',
        notes: 'Konsumsi dan sewa tenda'
    },
    {
        id: '3',
        eventName: 'HUT RI ke-80 (17 Agustus 2025)',
        eventDate: '2025-08-17',
        allocatedBudget: 2500000,
        actualExpense: 2650000,
        status: 'completed',
        notes: 'Lomba 17an, dekorasi, dan hadiah - OVER BUDGET 6%'
    },
    {
        id: '4',
        eventName: 'Tahun Baru 2026',
        eventDate: '2026-01-01',
        allocatedBudget: 500000,
        actualExpense: 450000,
        status: 'completed',
        notes: 'Malam tahun baru dan doa bersama'
    }
];

export default function EventBudgetPage() {
    const [events, setEvents] = useState<EventBudget[]>(mockEventBudgets);
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        eventName: '',
        eventDate: '',
        allocatedBudget: '',
        notes: ''
    });

    const upcomingEvents = events.filter(e => e.status !== 'completed');
    const completedEvents = events.filter(e => e.status === 'completed');

    const totalAllocated = upcomingEvents.reduce((sum, e) => sum + e.allocatedBudget, 0);
    const totalHistoryExpense = completedEvents.reduce((sum, e) => sum + e.actualExpense, 0);
    const totalHistoryBudget = completedEvents.reduce((sum, e) => sum + e.allocatedBudget, 0);

    const handleAddEvent = () => {
        if (!newEvent.eventName || !newEvent.eventDate || !newEvent.allocatedBudget) {
            alert('Harap isi semua field yang wajib');
            return;
        }

        const event: EventBudget = {
            id: Date.now().toString(),
            eventName: newEvent.eventName,
            eventDate: newEvent.eventDate,
            allocatedBudget: parseInt(newEvent.allocatedBudget),
            actualExpense: 0,
            status: 'planned',
            notes: newEvent.notes
        };

        setEvents([event, ...events]);
        setNewEvent({ eventName: '', eventDate: '', allocatedBudget: '', notes: '' });
        setShowAddForm(false);
    };

    const getStatusBadge = (status: EventBudget['status']) => {
        switch (status) {
            case 'planned':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Clock className="h-3 w-3" /> Direncanakan
                    </span>
                );
            case 'ongoing':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <CalendarCheck className="h-3 w-3" /> Berlangsung
                    </span>
                );
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" /> Selesai
                    </span>
                );
        }
    };

    const getVarianceBadge = (event: EventBudget) => {
        if (event.status !== 'completed') return null;

        const { variance, percentage, status } = calculateEventBudgetVariance(event);

        if (status === 'over') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                    <TrendingUp className="h-3 w-3" /> +{Math.abs(percentage).toFixed(0)}% Over
                </span>
            );
        } else if (status === 'under') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <TrendingDown className="h-3 w-3" /> {Math.abs(percentage).toFixed(0)}% Under
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <CheckCircle className="h-3 w-3" /> On Budget
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    <Button variant="outline" asChild>
                        <Link href="/keuangan/laporan">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                <CalendarCheck className="h-3 w-3" /> Rekomendasi #3
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Alokasi Dana Event</h1>
                        <p className="text-muted-foreground">Rencanakan budget untuk kegiatan tahunan RT</p>
                    </div>
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Event
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white">
                        <CardContent className="p-4">
                            <p className="text-purple-100 text-sm">Event Mendatang</p>
                            <p className="text-3xl font-bold">{upcomingEvents.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
                        <CardContent className="p-4">
                            <p className="text-blue-100 text-sm">Total Alokasi</p>
                            <p className="text-2xl font-bold">{formatRupiah(totalAllocated)}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-white">
                        <CardContent className="p-4">
                            <p className="text-green-100 text-sm">Event Selesai</p>
                            <p className="text-3xl font-bold">{completedEvents.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white">
                        <CardContent className="p-4">
                            <p className="text-amber-100 text-sm">Realisasi Historis</p>
                            <p className="text-2xl font-bold">{formatRupiah(totalHistoryExpense)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Event Form */}
                {showAddForm && (
                    <Card className="mb-8 border-primary">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="text-lg">Tambah Event Baru</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Event *</label>
                                    <input
                                        type="text"
                                        value={newEvent.eventName}
                                        onChange={(e) => setNewEvent({ ...newEvent, eventName: e.target.value })}
                                        placeholder="Contoh: HUT RI ke-81"
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tanggal Event *</label>
                                    <input
                                        type="date"
                                        value={newEvent.eventDate}
                                        onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Alokasi Budget (Rp) *</label>
                                    <input
                                        type="number"
                                        value={newEvent.allocatedBudget}
                                        onChange={(e) => setNewEvent({ ...newEvent, allocatedBudget: e.target.value })}
                                        placeholder="Contoh: 2500000"
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Catatan</label>
                                    <input
                                        type="text"
                                        value={newEvent.notes}
                                        onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                                        placeholder="Catatan tambahan..."
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleAddEvent}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Simpan Event
                                </Button>
                                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                    Batal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Upcoming Events */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Event Mendatang
                    </h2>
                    <div className="space-y-4">
                        {upcomingEvents.map((event) => (
                            <Card key={event.id} className="overflow-hidden">
                                <div
                                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <CalendarCheck className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{event.eventName}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(event.eventDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Budget</p>
                                                <p className="font-bold text-purple-600">{formatRupiah(event.allocatedBudget)}</p>
                                            </div>
                                            {getStatusBadge(event.status)}
                                            {expandedEvent === event.id ? (
                                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {expandedEvent === event.id && (
                                    <div className="border-t p-4 bg-muted/30">
                                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                                            <div className="p-3 bg-background rounded-lg border">
                                                <p className="text-xs text-muted-foreground">Alokasi Budget</p>
                                                <p className="font-bold text-lg">{formatRupiah(event.allocatedBudget)}</p>
                                            </div>
                                            <div className="p-3 bg-background rounded-lg border">
                                                <p className="text-xs text-muted-foreground">Pengeluaran Aktual</p>
                                                <p className="font-bold text-lg">{formatRupiah(event.actualExpense)}</p>
                                            </div>
                                            <div className="p-3 bg-background rounded-lg border">
                                                <p className="text-xs text-muted-foreground">Sisa Budget</p>
                                                <p className="font-bold text-lg text-green-600">
                                                    {formatRupiah(event.allocatedBudget - event.actualExpense)}
                                                </p>
                                            </div>
                                        </div>
                                        {event.notes && (
                                            <p className="text-sm text-muted-foreground">
                                                <strong>Catatan:</strong> {event.notes}
                                            </p>
                                        )}
                                        <div className="flex gap-2 mt-4">
                                            <Button size="sm" variant="outline">
                                                <Edit className="h-3 w-3 mr-1" /> Edit
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-3 w-3 mr-1" /> Hapus
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Completed Events */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Riwayat Event
                    </h2>
                    <div className="space-y-4">
                        {completedEvents.map((event) => (
                            <Card key={event.id} className="overflow-hidden opacity-90">
                                <div className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{event.eventName}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(event.eventDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Realisasi</p>
                                                <p className="font-bold">{formatRupiah(event.actualExpense)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    dari {formatRupiah(event.allocatedBudget)}
                                                </p>
                                            </div>
                                            {getVarianceBadge(event)}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Tips */}
                <Card className="mt-8 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                                    Tips Alokasi Dana Event
                                </h4>
                                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                                    <li>Event 17 Agustus biasanya menyerap budget terbesar (~60% anggaran tahunan)</li>
                                    <li>Siapkan dana cadangan 10-15% untuk pengeluaran tak terduga</li>
                                    <li>Dokumentasikan semua pengeluaran untuk laporan pertanggungjawaban</li>
                                    <li>Libatkan warga dalam perencanaan untuk meningkatkan partisipasi</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
