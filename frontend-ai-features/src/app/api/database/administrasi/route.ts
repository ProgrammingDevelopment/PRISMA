// Administration Data API Route
// Handles all administration-related database operations

import { NextRequest, NextResponse } from 'next/server';

// Mock data for administration - in production, this would come from MySQL
const administrationData = {
    warga: [
        { id: 1, nama: 'Ahmad Susanto', alamat: 'Blok A No. 1', status: 'Aktif', telepon: '08123456789' },
        { id: 2, nama: 'Budi Hartono', alamat: 'Blok A No. 2', status: 'Aktif', telepon: '08234567890' },
        { id: 3, nama: 'Citra Dewi', alamat: 'Blok B No. 1', status: 'Aktif', telepon: '08345678901' },
        { id: 4, nama: 'Dedi Kurniawan', alamat: 'Blok B No. 2', status: 'Aktif', telepon: '08456789012' },
        { id: 5, nama: 'Eka Pratama', alamat: 'Blok C No. 1', status: 'Aktif', telepon: '08567890123' },
    ],
    pengurus: [
        { id: 1, nama: 'H. Sutrisno', jabatan: 'Ketua RT', periode: '2024-2027' },
        { id: 2, nama: 'Ibu Sari', jabatan: 'Sekretaris', periode: '2024-2027' },
        { id: 3, nama: 'Pak Bambang', jabatan: 'Bendahara', periode: '2024-2027' },
        { id: 4, nama: 'Pak Agus', jabatan: 'Keamanan', periode: '2024-2027' },
    ],
    statistik: {
        totalWarga: 150,
        totalKK: 45,
        wargaAktif: 145,
        pendatangBaru: 3,
    }
};

// Security headers for OWASP compliance
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all';

        let responseData;

        switch (type) {
            case 'warga':
                responseData = administrationData.warga;
                break;
            case 'pengurus':
                responseData = administrationData.pengurus;
                break;
            case 'statistik':
                responseData = administrationData.statistik;
                break;
            default:
                responseData = administrationData;
        }

        const response = NextResponse.json({
            success: true,
            data: responseData,
            timestamp: new Date().toISOString(),
        });

        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch administration data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Input sanitization for XSS prevention
        const sanitizedData = sanitizeInput(body);

        return NextResponse.json({
            success: true,
            message: 'Data administrasi berhasil ditambahkan',
            data: sanitizedData,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to add administration data' },
            { status: 500 }
        );
    }
}

// Simple XSS sanitization function
function sanitizeInput(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            // Remove potential XSS vectors
            sanitized[key] = value
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;');
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeInput(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
