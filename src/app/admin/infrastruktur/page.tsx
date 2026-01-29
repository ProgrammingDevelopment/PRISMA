"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    Lightbulb,
    ThumbsUp,
    ThumbsDown,
    Plus,
    Cctv,
    LampFloor,
    Shield,
    Trash2,
    ChevronUp,
    ChevronDown,
    Clock,
    CheckCircle,
    XCircle,
    Vote,
    Users,
    AlertCircle,
    TrendingUp
} from "lucide-react"
import { formatRupiah, SUGGESTED_INFRASTRUCTURE, InfrastructureProposal, calculateVotingResult } from "@/lib/strategic-recommendations"

// Mock data for infrastructure proposals
const mockProposals: InfrastructureProposal[] = [
    {
        id: '1',
        title: 'CCTV Keamanan',
        description: 'Pemasangan 4 unit CCTV di titik strategis (pintu masuk, pos ronda, taman)',
        category: 'security',
        estimatedCost: 8000000,
        priority: 'high',
        proposedBy: 'Bapak Ahmad Suryanto',
        proposedDate: '2026-01-15',
        votesFor: 18,
        votesAgainst: 3,
        status: 'approved'
    },
    {
        id: '2',
        title: 'Penerangan Jalan Tambahan',
        description: 'Pemasangan 6 lampu LED di gang-gang gelap untuk keamanan malam',
        category: 'lighting',
        estimatedCost: 3000000,
        priority: 'medium',
        proposedBy: 'Ibu Siti Rahayu',
        proposedDate: '2026-01-20',
        votesFor: 12,
        votesAgainst: 5,
        status: 'voting'
    },
    {
        id: '3',
        title: 'Renovasi Pos Ronda',
        description: 'Perbaikan atap dan penambahan fasilitas pos ronda',
        category: 'security',
        estimatedCost: 2000000,
        priority: 'medium',
        proposedBy: 'Bapak Dedy Kurniawan',
        proposedDate: '2026-01-22',
        votesFor: 8,
        votesAgainst: 8,
        status: 'voting'
    },
    {
        id: '4',
        title: 'Tempat Sampah Terpilah',
        description: 'Pengadaan 10 set tempat sampah organik-anorganik',
        category: 'sanitation',
        estimatedCost: 1500000,
        priority: 'low',
        proposedBy: 'Ibu Endang Susanti',
        proposedDate: '2026-01-25',
        votesFor: 0,
        votesAgainst: 0,
        status: 'proposed'
    }
];

export default function InfrastrukturPage() {
    const [proposals, setProposals] = useState<InfrastructureProposal[]>(mockProposals);
    const [showAddForm, setShowAddForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'proposed' | 'voting' | 'approved' | 'rejected'>('all');
    const [newProposal, setNewProposal] = useState({
        title: '',
        description: '',
        category: 'security' as InfrastructureProposal['category'],
        estimatedCost: '',
        priority: 'medium' as InfrastructureProposal['priority']
    });

    const filteredProposals = proposals.filter(p =>
        filterStatus === 'all' || p.status === filterStatus
    );

    const totalBudgetNeeded = proposals
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + p.estimatedCost, 0);

    const handleVote = (proposalId: string, voteType: 'for' | 'against') => {
        setProposals(proposals.map(p => {
            if (p.id === proposalId) {
                return {
                    ...p,
                    votesFor: voteType === 'for' ? p.votesFor + 1 : p.votesFor,
                    votesAgainst: voteType === 'against' ? p.votesAgainst + 1 : p.votesAgainst
                };
            }
            return p;
        }));
    };

    const handleAddProposal = () => {
        if (!newProposal.title || !newProposal.description || !newProposal.estimatedCost) {
            alert('Harap isi semua field yang wajib');
            return;
        }

        const proposal: InfrastructureProposal = {
            id: Date.now().toString(),
            title: newProposal.title,
            description: newProposal.description,
            category: newProposal.category,
            estimatedCost: parseInt(newProposal.estimatedCost),
            priority: newProposal.priority,
            proposedBy: 'Warga RT 04',
            proposedDate: new Date().toISOString().split('T')[0],
            votesFor: 0,
            votesAgainst: 0,
            status: 'proposed'
        };

        setProposals([proposal, ...proposals]);
        setNewProposal({ title: '', description: '', category: 'security', estimatedCost: '', priority: 'medium' });
        setShowAddForm(false);
    };

    const getCategoryIcon = (category: InfrastructureProposal['category']) => {
        switch (category) {
            case 'security': return Shield;
            case 'lighting': return LampFloor;
            case 'sanitation': return Trash2;
            default: return Lightbulb;
        }
    };

    const getCategoryColor = (category: InfrastructureProposal['category']) => {
        switch (category) {
            case 'security': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
            case 'lighting': return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
            case 'sanitation': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
            default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
        }
    };

    const getPriorityBadge = (priority: InfrastructureProposal['priority']) => {
        const colors = {
            critical: 'bg-red-500 text-white',
            high: 'bg-orange-500 text-white',
            medium: 'bg-blue-500 text-white',
            low: 'bg-slate-500 text-white'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[priority]}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        );
    };

    const getStatusBadge = (status: InfrastructureProposal['status']) => {
        switch (status) {
            case 'proposed':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                        <Clock className="h-3 w-3" /> Diusulkan
                    </span>
                );
            case 'voting':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <Vote className="h-3 w-3" /> Voting
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="h-3 w-3" /> Disetujui
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="h-3 w-3" /> Ditolak
                    </span>
                );
            case 'implemented':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <CheckCircle className="h-3 w-3" /> Selesai
                    </span>
                );
        }
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400">
                                <Lightbulb className="h-3 w-3" /> Rekomendasi #5
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                Segera Hadir
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Infrastruktur Prioritas</h1>
                        <p className="text-muted-foreground">Usulan dan voting untuk investasi infrastruktur RT</p>
                    </div>
                    <Button onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Usulkan Proyek
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-cyan-600 to-cyan-700 border-0 text-white">
                        <CardContent className="p-4">
                            <Lightbulb className="h-6 w-6 opacity-50 mb-2" />
                            <p className="text-cyan-100 text-sm">Total Usulan</p>
                            <p className="text-3xl font-bold">{proposals.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
                        <CardContent className="p-4">
                            <Vote className="h-6 w-6 opacity-50 mb-2" />
                            <p className="text-blue-100 text-sm">Sedang Voting</p>
                            <p className="text-3xl font-bold">{proposals.filter(p => p.status === 'voting').length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0 text-white">
                        <CardContent className="p-4">
                            <CheckCircle className="h-6 w-6 opacity-50 mb-2" />
                            <p className="text-green-100 text-sm">Disetujui</p>
                            <p className="text-3xl font-bold">{proposals.filter(p => p.status === 'approved').length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0 text-white">
                        <CardContent className="p-4">
                            <TrendingUp className="h-6 w-6 opacity-50 mb-2" />
                            <p className="text-purple-100 text-sm">Total Budget</p>
                            <p className="text-xl font-bold">{formatRupiah(totalBudgetNeeded)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <Card className="mb-8 border-primary">
                        <CardHeader className="bg-primary/5">
                            <CardTitle className="text-lg">Usulkan Proyek Infrastruktur</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Proyek *</label>
                                    <input
                                        type="text"
                                        value={newProposal.title}
                                        onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                                        placeholder="Contoh: CCTV Keamanan"
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Kategori *</label>
                                    <select
                                        value={newProposal.category}
                                        onChange={(e) => setNewProposal({ ...newProposal, category: e.target.value as InfrastructureProposal['category'] })}
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="security">Keamanan</option>
                                        <option value="lighting">Penerangan</option>
                                        <option value="sanitation">Kebersihan</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Deskripsi *</label>
                                    <textarea
                                        value={newProposal.description}
                                        onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                                        placeholder="Jelaskan detail proyek..."
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Estimasi Biaya (Rp) *</label>
                                    <input
                                        type="number"
                                        value={newProposal.estimatedCost}
                                        onChange={(e) => setNewProposal({ ...newProposal, estimatedCost: e.target.value })}
                                        placeholder="Contoh: 5000000"
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Prioritas</label>
                                    <select
                                        value={newProposal.priority}
                                        onChange={(e) => setNewProposal({ ...newProposal, priority: e.target.value as InfrastructureProposal['priority'] })}
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="low">Rendah</option>
                                        <option value="medium">Sedang</option>
                                        <option value="high">Tinggi</option>
                                        <option value="critical">Kritis</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleAddProposal}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajukan Usulan
                                </Button>
                                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                    Batal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filter */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {(['all', 'proposed', 'voting', 'approved', 'rejected'] as const).map((status) => (
                        <Button
                            key={status}
                            variant={filterStatus === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilterStatus(status)}
                        >
                            {status === 'all' ? 'Semua' :
                                status === 'proposed' ? 'Diusulkan' :
                                    status === 'voting' ? 'Voting' :
                                        status === 'approved' ? 'Disetujui' : 'Ditolak'}
                        </Button>
                    ))}
                </div>

                {/* Proposals List */}
                <div className="space-y-4">
                    {filteredProposals.map((proposal) => {
                        const Icon = getCategoryIcon(proposal.category);
                        const categoryColor = getCategoryColor(proposal.category);
                        const { result, approvalPercentage } = calculateVotingResult(proposal);
                        const totalVotes = proposal.votesFor + proposal.votesAgainst;

                        return (
                            <Card key={proposal.id} className="overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${categoryColor}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-lg">{proposal.title}</h3>
                                                        {getPriorityBadge(proposal.priority)}
                                                    </div>
                                                    <p className="text-muted-foreground text-sm">{proposal.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(proposal.status)}
                                                    <p className="font-bold text-lg mt-2">{formatRupiah(proposal.estimatedCost)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {proposal.proposedBy}
                                                </span>
                                                <span>
                                                    {new Date(proposal.proposedDate).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>

                                            {/* Voting Section */}
                                            {(proposal.status === 'voting' || proposal.status === 'approved') && (
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">Hasil Voting</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {totalVotes} suara
                                                        </span>
                                                    </div>
                                                    <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                                                        <div
                                                            className="bg-green-500 h-full transition-all"
                                                            style={{ width: `${approvalPercentage}%` }}
                                                        />
                                                        <div
                                                            className="bg-red-500 h-full transition-all"
                                                            style={{ width: `${100 - approvalPercentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-2 text-sm">
                                                        <span className="text-green-600 flex items-center gap-1">
                                                            <ThumbsUp className="h-3 w-3" />
                                                            {proposal.votesFor} Setuju ({approvalPercentage.toFixed(0)}%)
                                                        </span>
                                                        <span className="text-red-600 flex items-center gap-1">
                                                            <ThumbsDown className="h-3 w-3" />
                                                            {proposal.votesAgainst} Tolak
                                                        </span>
                                                    </div>

                                                    {proposal.status === 'voting' && (
                                                        <div className="flex gap-2 mt-4">
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => handleVote(proposal.id, 'for')}
                                                            >
                                                                <ThumbsUp className="h-4 w-4 mr-1" />
                                                                Setuju
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 border-red-600 hover:bg-red-50"
                                                                onClick={() => handleVote(proposal.id, 'against')}
                                                            >
                                                                <ThumbsDown className="h-4 w-4 mr-1" />
                                                                Tolak
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {proposal.status === 'proposed' && (
                                                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                                    <span className="text-sm text-amber-700 dark:text-amber-400">
                                                        Menunggu review pengurus RT untuk dibuka voting
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Suggestions */}
                <Card className="mt-8 bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-cyan-800 dark:text-cyan-300">
                            <Lightbulb className="h-5 w-5" />
                            Saran Infrastruktur dari AI
                        </CardTitle>
                        <CardDescription className="text-cyan-700 dark:text-cyan-400">
                            Berdasarkan analisis surplus keuangan RT, berikut rekomendasi investasi:
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-3">
                            {SUGGESTED_INFRASTRUCTURE.map((item, index) => (
                                <div key={index} className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-cyan-600 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                            <p className="text-sm font-semibold text-cyan-600 mt-2">
                                                {formatRupiah(item.estimatedCost || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
