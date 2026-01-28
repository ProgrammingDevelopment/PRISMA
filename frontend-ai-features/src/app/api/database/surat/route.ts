// Surat Menyurat API Route
// Handles letter templates, downloads, and document management

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Letter templates metadata
const letterTemplates = [
    {
        id: 'kematian',
        title: 'Surat Keterangan Kematian',
        description: 'Surat keterangan untuk pelaporan kematian warga',
        category: 'administrasi',
        files: {
            docx: '/templates/surat/kematian.docx',
            pdf: '/templates/surat/kematian.pdf',
        },
        requiredFields: ['nama_almarhum', 'tanggal_meninggal', 'tempat_meninggal', 'penyebab'],
    },
    {
        id: 'sktm',
        title: 'Surat Keterangan Tidak Mampu (SKTM)',
        description: 'Surat keterangan untuk warga yang membutuhkan bantuan ekonomi',
        category: 'administrasi',
        files: {
            docx: '/templates/surat/sktm.docx',
            pdf: '/templates/surat/sktm.pdf',
        },
        requiredFields: ['nama', 'alamat', 'pekerjaan', 'penghasilan'],
    },
    {
        id: 'pindah',
        title: 'Surat Pengantar Pindah Domisili',
        description: 'Surat pengantar untuk warga yang akan pindah domisili',
        category: 'administrasi',
        files: {
            docx: '/templates/surat/pindah.docx',
            pdf: '/templates/surat/pindah.pdf',
        },
        requiredFields: ['nama', 'alamat_asal', 'alamat_tujuan', 'alasan_pindah'],
    },
    {
        id: 'umum',
        title: 'Surat Keterangan RT (Umum/Kelakuan Baik)',
        description: 'Surat keterangan umum dari RT untuk berbagai keperluan',
        category: 'administrasi',
        files: {
            docx: '/templates/surat/umum.docx',
            pdf: '/templates/surat/umum.pdf',
        },
        requiredFields: ['nama', 'alamat', 'keperluan'],
    },
    {
        id: 'domisili',
        title: 'Surat Keterangan Domisili',
        description: 'Surat keterangan tempat tinggal warga',
        category: 'administrasi',
        files: {
            docx: '/templates/surat/domisili.docx',
            pdf: '/templates/surat/domisili.pdf',
        },
        requiredFields: ['nama', 'alamat', 'lama_tinggal'],
    },
    {
        id: 'keamanan',
        title: 'Laporan Keamanan',
        description: 'Form pelaporan kejadian keamanan di lingkungan RT',
        category: 'keamanan',
        files: {
            docx: '/templates/surat/keamanan.docx',
            pdf: '/templates/surat/keamanan.pdf',
        },
        requiredFields: ['kronologi', 'tanggal_kejadian', 'nama_pelapor', 'telepon_pelapor'],
    },
];

// Security headers
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const category = searchParams.get('category');

        let responseData;

        if (id) {
            responseData = letterTemplates.find(t => t.id === id);
            if (!responseData) {
                return NextResponse.json(
                    { success: false, error: 'Template not found' },
                    { status: 404 }
                );
            }
        } else if (category) {
            responseData = letterTemplates.filter(t => t.category === category);
        } else {
            responseData = letterTemplates;
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
            { success: false, error: 'Failed to fetch letter templates' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.templateId || !body.data) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: templateId, data' },
                { status: 400 }
            );
        }

        const template = letterTemplates.find(t => t.id === body.templateId);
        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Template not found' },
                { status: 404 }
            );
        }

        // Generate unique submission ID
        const submissionId = uuidv4();

        // Sanitize input data
        const sanitizedData = sanitizeInput(body.data);

        return NextResponse.json({
            success: true,
            submissionId,
            message: `Pengajuan ${template.title} berhasil diterima`,
            data: sanitizedData,
            status: 'pending',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to submit letter request' },
            { status: 500 }
        );
    }
}

function sanitizeInput(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = value
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;')
                .replace(/\//g, '&#x2F;')
                .replace(/javascript:/gi, '')
                .replace(/on\w+=/gi, '');
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeInput(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}
