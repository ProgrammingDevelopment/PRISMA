// Data Crawler API Route
// Web scraping and data crawling for NLP analysis

import { NextRequest, NextResponse } from 'next/server';

// Security headers
const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
};

// Mock data sources for crawling (in production, these would be real sources)
const DATA_SOURCES = {
    keuangan: {
        name: 'Laporan Keuangan RT',
        description: 'Data transaksi dan laporan keuangan bulanan',
        lastCrawl: new Date().toISOString(),
        documentCount: 12,
        sampleData: [
            'Iuran warga bulan Januari 2026 terkumpul Rp 450.000 dari 45 KK.',
            'Pengeluaran kebersihan bulan ini mencapai Rp 400.000 untuk gaji petugas.',
            'Dana operasional pos digunakan untuk pembelian ATK sebesar Rp 50.000.',
            'Saldo kas RT per 24 Januari 2026 sebesar Rp 2.500.000.',
        ],
    },
    keamanan: {
        name: 'Laporan Keamanan Lingkungan',
        description: 'Data kejadian keamanan dan patrol',
        lastCrawl: new Date().toISOString(),
        documentCount: 8,
        sampleData: [
            'Situasi keamanan lingkungan RT 04 dalam kondisi baik dan aman.',
            'Patrol malam dilaksanakan setiap hari dari pukul 22.00 hingga 05.00.',
            'Tidak ada laporan kejadian kriminal selama bulan Januari 2026.',
            'Warga diminta untuk tetap waspada dan melaporkan aktivitas mencurigakan.',
        ],
    },
    administrasi: {
        name: 'Data Administrasi Warga',
        description: 'Statistik kependudukan dan layanan',
        lastCrawl: new Date().toISOString(),
        documentCount: 5,
        sampleData: [
            'Total warga terdaftar di RT 04 sebanyak 150 jiwa dari 45 KK.',
            'Layanan pembuatan surat pengantar telah melayani 23 permohonan bulan ini.',
            'Tingkat kehadiran rapat warga mencapai 85% dari total undangan.',
            'Program gotong royong dilaksanakan setiap minggu kedua dan keempat.',
        ],
    },
    berita: {
        name: 'Berita dan Pengumuman RT',
        description: 'Informasi terkini seputar RT 04',
        lastCrawl: new Date().toISOString(),
        documentCount: 15,
        sampleData: [
            'Rapat koordinasi bulanan akan dilaksanakan pada Sabtu, 25 Januari 2026.',
            'Pendaftaran vaksinasi booster dibuka untuk warga lansia dan balita.',
            'Peringatan HUT RI ke-81 akan dilaksanakan dengan berbagai lomba.',
            'Kerja bakti pembersihan selokan dijadwalkan Minggu pagi pukul 07.00.',
        ],
    },
};

// Simulated web scraping function
function scrapeData(source: string): { content: string; metadata: object } {
    const sourceData = DATA_SOURCES[source as keyof typeof DATA_SOURCES];

    if (!sourceData) {
        return { content: '', metadata: { error: 'Source not found' } };
    }

    return {
        content: sourceData.sampleData.join('\n'),
        metadata: {
            source: sourceData.name,
            description: sourceData.description,
            documentCount: sourceData.documentCount,
            lastCrawl: sourceData.lastCrawl,
        },
    };
}

// Aggregate data from multiple sources
function aggregateData(sources: string[]): {
    combinedContent: string;
    sourceMetadata: object[];
    totalDocuments: number;
} {
    let combinedContent = '';
    const sourceMetadata: object[] = [];
    let totalDocuments = 0;

    sources.forEach(source => {
        const { content, metadata } = scrapeData(source);
        combinedContent += content + '\n\n';
        sourceMetadata.push(metadata);
        totalDocuments += (metadata as { documentCount?: number }).documentCount || 0;
    });

    return {
        combinedContent: combinedContent.trim(),
        sourceMetadata,
        totalDocuments,
    };
}

// Extract key information from crawled data
function extractKeyInfo(content: string): {
    financialData: string[];
    securityData: string[];
    administrationData: string[];
    newsData: string[];
} {
    const lines = content.split('\n').filter(line => line.trim());

    const financialData: string[] = [];
    const securityData: string[] = [];
    const administrationData: string[] = [];
    const newsData: string[] = [];

    const financialKeywords = ['iuran', 'pengeluaran', 'saldo', 'dana', 'rp', 'rupiah', 'kas'];
    const securityKeywords = ['keamanan', 'patrol', 'kejadian', 'aman', 'waspada', 'kriminal'];
    const adminKeywords = ['warga', 'kk', 'surat', 'layanan', 'administrasi', 'pendaftaran'];

    lines.forEach(line => {
        const lowerLine = line.toLowerCase();

        if (financialKeywords.some(kw => lowerLine.includes(kw))) {
            financialData.push(line);
        } else if (securityKeywords.some(kw => lowerLine.includes(kw))) {
            securityData.push(line);
        } else if (adminKeywords.some(kw => lowerLine.includes(kw))) {
            administrationData.push(line);
        } else {
            newsData.push(line);
        }
    });

    return { financialData, securityData, administrationData, newsData };
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const action = searchParams.get('action') || 'list';

    let responseData;

    switch (action) {
        case 'list':
            responseData = {
                availableSources: Object.keys(DATA_SOURCES).map(key => ({
                    id: key,
                    ...DATA_SOURCES[key as keyof typeof DATA_SOURCES],
                    sampleData: undefined, // Don't expose full data in list
                })),
            };
            break;

        case 'crawl':
            if (source) {
                const { content, metadata } = scrapeData(source);
                responseData = {
                    source,
                    content,
                    metadata,
                    crawledAt: new Date().toISOString(),
                };
            } else {
                // Crawl all sources
                const allSources = Object.keys(DATA_SOURCES);
                const { combinedContent, sourceMetadata, totalDocuments } = aggregateData(allSources);
                responseData = {
                    sources: allSources,
                    combinedContent,
                    sourceMetadata,
                    totalDocuments,
                    crawledAt: new Date().toISOString(),
                };
            }
            break;

        case 'extract':
            const allSources = Object.keys(DATA_SOURCES);
            const { combinedContent } = aggregateData(allSources);
            const keyInfo = extractKeyInfo(combinedContent);
            responseData = {
                extractedData: keyInfo,
                extractedAt: new Date().toISOString(),
            };
            break;

        default:
            responseData = { error: 'Invalid action' };
    }

    const response = NextResponse.json({
        success: true,
        data: responseData,
        methodology: {
            technique: 'Web Scraping & Data Aggregation',
            reference: 'ML Roadmap - Data Collection',
        },
        timestamp: new Date().toISOString(),
    });

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const sources = body.sources || Object.keys(DATA_SOURCES);

        // Aggregate data from specified sources
        const { combinedContent, sourceMetadata, totalDocuments } = aggregateData(sources);

        // Extract key information
        const keyInfo = extractKeyInfo(combinedContent);

        const response = NextResponse.json({
            success: true,
            data: {
                sources,
                totalDocuments,
                combinedContent,
                extractedInfo: keyInfo,
                sourceMetadata,
            },
            crawledAt: new Date().toISOString(),
        });

        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Data crawling failed' },
            { status: 500 }
        );
    }
}
