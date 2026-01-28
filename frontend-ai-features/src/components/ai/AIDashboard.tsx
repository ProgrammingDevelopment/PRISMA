"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Brain, MessageSquare, TrendingUp, BarChart3, Users, Image,
    Sparkles, Send, Loader2, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react'
import {
    useSentimentAnalysis,
    usePrismaChat,
    useFinancialPrediction,
    useAIStatus
} from '@/lib/ai-hooks'
import { getSentimentColor, getTrendIcon } from '@/lib/ai-service'

export function AIDashboard() {
    const { checkHealth, isHealthy, modelStatus, loading: healthLoading } = useAIStatus()

    useEffect(() => {
        checkHealth()
    }, [checkHealth])

    const features = [
        {
            icon: Brain,
            title: "Deep Learning",
            description: "CNN, RNN, LSTM untuk analisis kompleks",
            status: "ready",
            color: "from-purple-500 to-indigo-500"
        },
        {
            icon: MessageSquare,
            title: "NLP & Chatbot",
            description: "Analisis sentimen, chatbot virtual",
            status: "ready",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: TrendingUp,
            title: "Prediksi Keuangan",
            description: "Forecast pemasukan & pengeluaran",
            status: "ready",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: Users,
            title: "Segmentasi Warga",
            description: "Clustering & analisis demografis",
            status: "ready",
            color: "from-orange-500 to-amber-500"
        },
        {
            icon: Image,
            title: "Computer Vision",
            description: "Klasifikasi gambar & deteksi objek",
            status: "beta",
            color: "from-pink-500 to-rose-500"
        },
        {
            icon: BarChart3,
            title: "Evaluasi Model",
            description: "Metrik akurasi, presisi, recall",
            status: "ready",
            color: "from-teal-500 to-cyan-500"
        }
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        PRISMA AI Platform
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Kecerdasan Buatan untuk RT 04 Kemayoran
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {healthLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isHealthy ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Backend Online
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-amber-600 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            Backend Offline
                        </span>
                    )}
                </div>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-4">
                {features.map((feature, idx) => (
                    <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <feature.icon className="h-8 w-8 text-primary" />
                                <span className={`text-xs px-2 py-0.5 rounded-full ${feature.status === 'ready'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {feature.status === 'ready' ? 'Siap' : 'Beta'}
                                </span>
                            </div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Interactive Demos */}
            <div className="grid md:grid-cols-2 gap-6">
                <SentimentDemo />
                <ChatDemo />
            </div>

            {/* Financial Prediction */}
            <FinancialPredictionDemo />
        </div>
    )
}

function SentimentDemo() {
    const [text, setText] = useState('')
    const { analyze, result, loading, error } = useSentimentAnalysis()

    const handleAnalyze = async () => {
        if (!text.trim()) return
        await analyze(text)
    }

    const examples = [
        "Pelayanan RT sangat memuaskan!",
        "Saya kecewa dengan lambatnya respon pengaduan",
        "Iuran bulanan sudah dibayar"
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Analisis Sentimen
                </CardTitle>
                <CardDescription>
                    Analisis feedback dan komentar warga
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Masukkan teks untuk dianalisis..."
                    className="w-full p-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-primary"
                />

                <div className="flex flex-wrap gap-2">
                    {examples.map((ex, idx) => (
                        <button
                            key={idx}
                            onClick={() => setText(ex)}
                            className="text-xs px-2 py-1 bg-muted rounded-full hover:bg-muted/80"
                        >
                            {ex.substring(0, 25)}...
                        </button>
                    ))}
                </div>

                <Button onClick={handleAnalyze} disabled={loading || !text.trim()}>
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Menganalisis...
                        </>
                    ) : (
                        'Analisis Sentimen'
                    )}
                </Button>

                {result && (
                    <div className={`p-4 rounded-lg ${getSentimentColor(result.sentiment)}`}>
                        <div className="font-medium capitalize">{result.sentiment}</div>
                        <div className="text-sm">
                            Confidence: {(result.confidence * 100).toFixed(1)}%
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                        Error: {error.message}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function ChatDemo() {
    const [input, setInput] = useState('')
    const { sendMessage, messages, loading, clearHistory } = usePrismaChat()

    const handleSend = async () => {
        if (!input.trim()) return
        await sendMessage(input)
        setInput('')
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Chatbot PRISMA
                        </CardTitle>
                        <CardDescription>Asisten virtual RT 04</CardDescription>
                    </div>
                    {messages.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearHistory}>
                            Clear
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 space-y-3 max-h-64 overflow-y-auto mb-4">
                    {messages.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                            Mulai percakapan dengan mengetik pesan...
                        </p>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-lg ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground ml-8'
                                        : 'bg-muted mr-8'
                                    }`}
                            >
                                <p className="text-sm">{msg.content}</p>
                                {msg.intent && (
                                    <span className="text-xs opacity-70">
                                        Intent: {msg.intent}
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tanya apa saja..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                    <Button onClick={handleSend} disabled={loading || !input.trim()}>
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function FinancialPredictionDemo() {
    const [months, setMonths] = useState(6)
    const { predict, prediction, loading, error } = useFinancialPrediction()

    const handlePredict = async () => {
        await predict(months)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Prediksi Keuangan RT
                </CardTitle>
                <CardDescription>
                    Forecast pemasukan dan pengeluaran untuk perencanaan anggaran
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Periode Prediksi</label>
                        <select
                            value={months}
                            onChange={(e) => setMonths(Number(e.target.value))}
                            className="ml-2 px-3 py-2 border rounded-lg"
                        >
                            <option value={3}>3 Bulan</option>
                            <option value={6}>6 Bulan</option>
                            <option value={12}>12 Bulan</option>
                        </select>
                    </div>

                    <Button onClick={handlePredict} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            'Generate Prediksi'
                        )}
                    </Button>
                </div>

                {prediction && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Tren</p>
                                <p className="text-2xl font-bold">
                                    {getTrendIcon(prediction.trend)} {prediction.trend}
                                </p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Confidence</p>
                                <p className="text-2xl font-bold">
                                    {(prediction.confidence * 100).toFixed(0)}%
                                </p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Periode</p>
                                <p className="text-2xl font-bold">{prediction.months_ahead} bulan</p>
                            </div>
                        </div>

                        {/* Predictions */}
                        <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                            <h4 className="font-medium mb-3">Proyeksi Bulanan</h4>
                            <div className="space-y-2">
                                {prediction.predictions.map((value, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Bulan {idx + 1}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-amber-50 text-amber-700 rounded-lg">
                        <p className="text-sm">Backend AI tidak tersedia. Pastikan server AI berjalan di port 8000.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default AIDashboard
