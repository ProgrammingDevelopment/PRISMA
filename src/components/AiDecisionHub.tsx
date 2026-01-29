"use client";

import React, { useState, useEffect } from 'react';
import {
    Brain,
    FileText,
    BarChart3,
    Shield,
    RefreshCw,
    Download,
    Sparkles,
    Database,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Info,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // Assuming this exists or I'll use div
import { Textarea } from '@/components/ui/textarea'; // Assuming

interface NLPResult {
    summary: string[];
    sentiment: {
        label: string;
        score: number;
        confidence: number;
    };
    entities: {
        type: string;
        value: string;
        position: number;
    }[];
    conclusion: string;
    wordCount: number;
    tokenCount: number;
}

interface CrawlData {
    sources: string[];
    totalDocuments: number;
    combinedContent: string;
    extractedInfo: {
        financialData: string[];
        securityData: string[];
        administrationData: string[];
        newsData: string[];
    };
}

type DataContext = 'keuangan' | 'keamanan' | 'administrasi' | 'general';

export default function AiKesimpulanHub() {
    const [activeContext, setActiveContext] = useState<DataContext>('general');
    const [crawlData, setCrawlData] = useState<CrawlData | null>(null);
    const [nlpResult, setNlpResult] = useState<NLPResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [crawling, setCrawling] = useState(false);
    const [customText, setCustomText] = useState('');
    const [useCustomText, setUseCustomText] = useState(false);

    const contexts: { id: DataContext; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
        { id: 'general', label: 'Semua Data', icon: Database, color: 'text-blue-500' },
        { id: 'keuangan', label: 'Keuangan', icon: BarChart3, color: 'text-green-500' },
        { id: 'keamanan', label: 'Keamanan', icon: Shield, color: 'text-red-500' },
        { id: 'administrasi', label: 'Administrasi', icon: FileText, color: 'text-purple-500' },
    ];

    // Crawl data from sources
    const handleCrawlData = async () => {
        setCrawling(true);
        try {
            const sourcesToCrawl = activeContext === 'general'
                ? ['keuangan', 'keamanan', 'administrasi', 'berita']
                : [activeContext];

            const response = await fetch('/api/crawler', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sources: sourcesToCrawl }),
            });

            const data = await response.json();
            if (data.success) {
                setCrawlData(data.data);
            }
        } catch (error) {
            console.error('Crawling failed:', error);
        } finally {
            setCrawling(false);
        }
    };

    // Generate NLP analysis and conclusion
    const handleGenerateConclusion = async () => {
        if (!crawlData && !customText) {
            await handleCrawlData();
            return;
        }

        setLoading(true);
        try {
            const textToAnalyze = useCustomText
                ? customText
                : crawlData?.combinedContent || '';

            const response = await fetch('/api/nlp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: textToAnalyze,
                    context: activeContext,
                    task: 'full',
                }),
            });

            const data = await response.json();
            if (data.success) {
                setNlpResult(data.data);
            }
        } catch (error) {
            console.error('NLP analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!useCustomText) {
            handleCrawlData();
        }
    }, [activeContext]);

    const getSentimentColor = (label: string) => {
        switch (label) {
            case 'positif': return 'text-green-500 bg-green-500/10 border-green-200 dark:border-green-800';
            case 'negatif': return 'text-red-500 bg-red-500/10 border-red-200 dark:border-red-800';
            default: return 'text-yellow-500 bg-yellow-500/10 border-yellow-200 dark:border-yellow-800';
        }
    };

    const getEntityIcon = (type: string) => {
        switch (type) {
            case 'MONEY': return '💰';
            case 'DATE': return '📅';
            case 'LOCATION': return '📍';
            case 'PHONE': return '📞';
            default: return '🏷️';
        }
    };

    return (
        <section className="py-20 bg-background transition-colors duration-500 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30 dark:opacity-20 max-w-[100vw]">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-purple-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        Artificial Intelligence Core
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
                        AI Kesimpulan & Analisis NLP
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Analisis data otomatis menggunakan IndoBERT & NLP Pipeline untuk transparansi dan pengambilan keputusan yang lebih baik.
                    </p>
                </div>

                {/* Context Selector */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {contexts.map((ctx) => {
                        const Icon = ctx.icon;
                        const isActive = activeContext === ctx.id;
                        return (
                            <Button
                                key={ctx.id}
                                variant={isActive ? "default" : "outline"}
                                onClick={() => setActiveContext(ctx.id)}
                                className={`rounded-full transition-all ${isActive ? 'shadow-lg scale-105' : 'hover:bg-muted'}`}
                            >
                                <Icon className={`h-4 w-4 mr-2 ${!isActive ? ctx.color : ''}`} />
                                {ctx.label}
                            </Button>
                        );
                    })}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Panel - Control & Data */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm shadow-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Database className="h-5 w-5 text-primary" />
                                    Sumber Data
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm font-medium">Mode Custom Text</span>
                                    <div
                                        onClick={() => setUseCustomText(!useCustomText)}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${useCustomText ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${useCustomText ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </div>
                                </div>

                                {useCustomText ? (
                                    <textarea
                                        value={customText}
                                        onChange={(e) => setCustomText(e.target.value)}
                                        placeholder="Masukkan teks laporan atau berita untuk dianalisis..."
                                        className="w-full h-40 bg-background border border-input rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                                    />
                                ) : (
                                    <div className="space-y-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleCrawlData}
                                            disabled={crawling}
                                            className="w-full justify-center"
                                        >
                                            {crawling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                            {crawling ? 'Crawling...' : 'Refresh Data'}
                                        </Button>

                                        {crawlData && (
                                            <div className="p-3 bg-muted/30 rounded-lg space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Dokumen</span>
                                                    <span className="font-semibold">{crawlData.totalDocuments}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Sumber</span>
                                                    <span className="text-xs max-w-[150px] text-right truncate">{crawlData.sources.join(', ')}</span>
                                                </div>
                                                <div className="pt-2 border-t border-border mt-2 grid grid-cols-2 gap-2 text-xs">
                                                    <div className="bg-green-500/10 text-green-600 dark:text-green-400 p-1 rounded text-center">
                                                        💰 {crawlData.extractedInfo.financialData.length} Keuangan
                                                    </div>
                                                    <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-1 rounded text-center">
                                                        🛡️ {crawlData.extractedInfo.securityData.length} Keamanan
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Button
                                    onClick={handleGenerateConclusion}
                                    disabled={loading || (!crawlData && !customText)}
                                    className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-purple-500/20"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                    Generate Analisis AI
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                            <h4 className="font-semibold text-blue-600 dark:text-blue-400 text-sm mb-2 flex items-center gap-2">
                                <Info className="h-4 w-4" /> Metodologi NLP
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                <li>IndoBERT Fine-tuned Model</li>
                                <li>TF-IDF Feature Extraction</li>
                                <li>TextRank Summarization</li>
                                <li>Pattern-based NER</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Panel - Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {nlpResult ? (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                                {/* Conclusion Card */}
                                <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Brain className="w-24 h-24" />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-amber-500" />
                                            Kesimpulan Eksekutif
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-lg leading-relaxed whitespace-pre-wrap">
                                            {nlpResult.conclusion}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Sentiment & Stats Grid */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" /> Sentimen Analisis
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-3 ${getSentimentColor(nlpResult.sentiment.label)}`}>
                                                <span className="capitalize font-semibold">{nlpResult.sentiment.label}</span>
                                                <span className="text-xs opacity-80">{(nlpResult.sentiment.score * 100).toFixed(0)}% Confidence</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${nlpResult.sentiment.label === 'positif' ? 'bg-green-500' :
                                                            nlpResult.sentiment.label === 'negatif' ? 'bg-red-500' : 'bg-yellow-500'
                                                        }`}
                                                    style={{ width: `${nlpResult.sentiment.score * 100}%` }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <BarChart3 className="h-4 w-4" /> Statistik
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <div className="text-xl font-bold text-primary">{nlpResult.wordCount}</div>
                                                    <div className="text-xs text-muted-foreground">Kata</div>
                                                </div>
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <div className="text-xl font-bold text-purple-500">{nlpResult.tokenCount}</div>
                                                    <div className="text-xs text-muted-foreground">Token</div>
                                                </div>
                                                <div className="p-2 bg-muted/50 rounded-lg">
                                                    <div className="text-xl font-bold text-pink-500">{nlpResult.entities.length}</div>
                                                    <div className="text-xs text-muted-foreground">Entitas</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Extractive Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                            Ringkasan Poin Kunci
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {nlpResult.summary.map((sentence, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{sentence}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Entities */}
                                {nlpResult.entities.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {nlpResult.entities.map((entity, idx) => (
                                            <Badge key={idx} variant="secondary" className="px-3 py-1">
                                                <span className="mr-1">{getEntityIcon(entity.type)}</span>
                                                {entity.value}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-muted rounded-2xl bg-muted/10">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 animate-pulse">
                                    <Brain className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Belum Ada Analisis</h3>
                                <p className="text-muted-foreground max-w-md">
                                    Silakan crawl data terbaru atau masukkan teks manual, lalu klik "Generate Analisis AI" untuk melihat insight mendalam.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
