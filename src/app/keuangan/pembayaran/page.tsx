"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    QrCode,
    CreditCard,
    Smartphone,
    Building2,
    Copy,
    Check,
    Upload,
    Send,
    CheckCircle,
    Info
} from "lucide-react"
import { DEFAULT_IURAN_CONFIG, formatRupiah, generateQRPaymentData, validatePaymentProof, PaymentMethod } from "@/lib/strategic-recommendations"

export default function PembayaranPage() {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [payerName, setPayerName] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [copied, setCopied] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const paymentMethods = DEFAULT_IURAN_CONFIG.paymentMethods.filter(m => m.isActive);

    const handleCopyAccount = (accountNumber: string) => {
        navigator.clipboard.writeText(accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validation = validatePaymentProof(file);
            if (validation.valid) {
                setUploadedFile(file);
            } else {
                alert(validation.message);
            }
        }
    };

    const handleSubmitPayment = async () => {
        if (!payerName || !selectedMethod) {
            alert('Harap isi nama dan pilih metode pembayaran');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSubmitting(false);
        setSubmitSuccess(true);
    };

    const getMethodIcon = (type: PaymentMethod['type']) => {
        switch (type) {
            case 'qris': return QrCode;
            case 'bank_transfer': return Building2;
            case 'ewallet': return Smartphone;
            default: return CreditCard;
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-8 pb-6">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Pembayaran Terkirim!</h2>
                        <p className="text-muted-foreground mb-6">
                            Bukti pembayaran Anda akan diverifikasi oleh pengurus RT dalam 1x24 jam.
                        </p>
                        <div className="space-y-3">
                            <Button asChild className="w-full">
                                <Link href="/keuangan/iuran">
                                    Kembali ke Daftar Iuran
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/">
                                    Ke Beranda
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                    <Button variant="outline" asChild>
                        <Link href="/keuangan/iuran">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                <QrCode className="h-3 w-3" /> Rekomendasi #2
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">Digitalisasi Pembayaran</h1>
                        <p className="text-muted-foreground">Bayar iuran dengan mudah via QRIS atau transfer bank</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Payment Form */}
                    <div className="space-y-6">
                        {/* Payer Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informasi Pembayar</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={payerName}
                                        onChange={(e) => setPayerName(e.target.value)}
                                        placeholder="Masukkan nama sesuai KTP"
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Bulan Iuran</label>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Nominal Iuran</span>
                                        <span className="text-xl font-bold text-blue-600">{formatRupiah(DEFAULT_IURAN_CONFIG.nominal)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Pilih Metode Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {paymentMethods.map((method) => {
                                    const Icon = getMethodIcon(method.type);
                                    const isSelected = selectedMethod?.id === method.id;

                                    return (
                                        <div
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method)}
                                            className={`
                                                p-4 border rounded-lg cursor-pointer transition-all
                                                ${isSelected
                                                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                                                    : 'hover:border-primary/50 hover:bg-muted/50'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    p-2 rounded-lg
                                                    ${isSelected ? 'bg-primary text-white' : 'bg-muted'}
                                                `}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{method.name}</h4>
                                                    {method.accountNumber && (
                                                        <p className="text-sm text-muted-foreground">{method.accountNumber}</p>
                                                    )}
                                                </div>
                                                {isSelected && <Check className="h-5 w-5 text-primary" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Payment Details */}
                    <div className="space-y-6">
                        {selectedMethod ? (
                            <>
                                <Card className="border-primary">
                                    <CardHeader className="bg-primary/5">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {selectedMethod.type === 'qris' ? <QrCode className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                            {selectedMethod.name}
                                        </CardTitle>
                                        <CardDescription>
                                            {selectedMethod.type === 'qris'
                                                ? 'Scan QR Code di bawah untuk membayar'
                                                : 'Transfer ke rekening di bawah ini'
                                            }
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {selectedMethod.type === 'qris' ? (
                                            <div className="text-center">
                                                <div className="w-48 h-48 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                                                    <QrCode className="h-24 w-24 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    QRIS RT 04 RW 09 Kemayoran
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <p className="text-sm text-muted-foreground mb-1">Nomor Rekening</p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-2xl font-mono font-bold">{selectedMethod.accountNumber}</span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCopyAccount(selectedMethod.accountNumber || '')}
                                                        >
                                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <p className="text-sm text-muted-foreground mb-1">Nama Pemilik Rekening</p>
                                                    <p className="font-semibold">{selectedMethod.accountName}</p>
                                                </div>
                                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                                    <p className="text-sm text-muted-foreground mb-1">Nominal Transfer</p>
                                                    <p className="text-2xl font-bold text-amber-600">{formatRupiah(DEFAULT_IURAN_CONFIG.nominal)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Upload Proof */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Upload Bukti Pembayaran</CardTitle>
                                        <CardDescription>Upload screenshot atau foto bukti transfer</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                            {uploadedFile ? (
                                                <div className="space-y-2">
                                                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                                                    <p className="font-medium">{uploadedFile.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(uploadedFile.size / 1024).toFixed(1)} KB
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setUploadedFile(null)}
                                                    >
                                                        Ganti File
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <label className="cursor-pointer">
                                                        <span className="text-primary font-medium">Klik untuk upload</span>
                                                        <span className="text-muted-foreground"> atau drag and drop</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileUpload}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG, WebP (max 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Submit Button */}
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleSubmitPayment}
                                    disabled={isSubmitting || !payerName}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Kirim Konfirmasi Pembayaran
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <Card className="border-dashed border-2">
                                <CardContent className="py-12 text-center">
                                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="font-semibold text-lg mb-2">Pilih Metode Pembayaran</h3>
                                    <p className="text-muted-foreground">
                                        Pilih salah satu metode pembayaran di sebelah kiri untuk melihat detail
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Info */}
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-700 dark:text-blue-300">
                                Pembayaran akan diverifikasi oleh pengurus RT dalam 1x24 jam kerja. Status pembayaran dapat dilihat di halaman Daftar Iuran.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
