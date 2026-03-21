import { NextRequest } from 'next/server';
import {
    apiSuccess, apiError, apiRateLimited,
    checkServerRateLimit, getClientIP, sanitizeServerInput,
} from '../middleware';

interface SecurityReport {
    id: string;
    jenis_kejadian: string;
    lokasi: string;
    tanggal_kejadian: string;
    status: 'Pending' | 'In Progress' | 'Resolved';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    nama_pelapor: string;
    telepon_display: string;
    kronologi: string;
    createdAt: string;
}

const securityReports: SecurityReport[] = [
    {
        id: 'SEC-001',
        jenis_kejadian: 'Pencurian',
        lokasi: 'Jl. Merdeka No. 2',
        tanggal_kejadian: '2024-02-01',
        status: 'Resolved',
        priority: 'High',
        nama_pelapor: 'Siti Aminah',
        telepon_display: '0812***7891',
        kronologi: 'Kehilangan sepeda motor di halaman rumah.',
        createdAt: '2024-02-01T10:00:00Z',
    },
];

const VALID_INCIDENT_TYPES = ['Pencurian', 'Keributan', 'Darurat Medis', 'Vandalisme', 'Kebakaran', 'Lainnya'];
const PRIORITY_MAP: Record<string, SecurityReport['priority']> = {
    'Pencurian': 'High',
    'Darurat Medis': 'Critical',
    'Kebakaran': 'Critical',
    'Keributan': 'Medium',
    'Vandalisme': 'Medium',
    'Lainnya': 'Low',
};

export async function GET(req: NextRequest) {
    const ip = getClientIP(req);
    const rateCheck = checkServerRateLimit(ip, 60, 60000);
    if (!rateCheck.allowed) return apiRateLimited(rateCheck.resetAt);

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

        let reports = [...securityReports];
        if (status) reports = reports.filter(r => r.status === status);
        if (priority) reports = reports.filter(r => r.priority === priority);
        reports = reports.slice(0, limit);

        const stats = {
            total: securityReports.length,
            pending: securityReports.filter(r => r.status === 'Pending').length,
            inProgress: securityReports.filter(r => r.status === 'In Progress').length,
            resolved: securityReports.filter(r => r.status === 'Resolved').length,
        };

        return apiSuccess({ reports, stats });
    } catch (error) {
        console.error('[Security API] GET error:', error);
        return apiError('Failed to fetch security reports', 500);
    }
}

export async function POST(req: NextRequest) {
    const ip = getClientIP(req);
    const rateCheck = checkServerRateLimit(ip, 5, 60000);
    if (!rateCheck.allowed) return apiRateLimited(rateCheck.resetAt);

    try {
        const body = await req.json();
        const { jenis_kejadian, lokasi, tanggal_kejadian, nama_pelapor, telepon_pelapor, kronologi } = body;

        if (!jenis_kejadian || !VALID_INCIDENT_TYPES.includes(jenis_kejadian)) {
            return apiError(`Jenis kejadian tidak valid. Gunakan: ${VALID_INCIDENT_TYPES.join(', ')}`, 422);
        }
        if (!nama_pelapor || typeof nama_pelapor !== 'string' || nama_pelapor.trim().length < 2) {
            return apiError('Nama pelapor minimal 2 karakter', 422);
        }
        if (!kronologi || typeof kronologi !== 'string' || kronologi.trim().length < 10) {
            return apiError('Kronologi kejadian minimal 10 karakter', 422);
        }
        if (!tanggal_kejadian) {
            return apiError('Tanggal kejadian wajib diisi', 422);
        }

        const sanitizedLokasi = sanitizeServerInput(lokasi || 'Tidak disebutkan', 200);
        const sanitizedNama = sanitizeServerInput(nama_pelapor, 100);
        const sanitizedKronologi = sanitizeServerInput(kronologi, 2000);
        const sanitizedTelepon = sanitizeServerInput(telepon_pelapor || '', 20).replace(/[^0-9+\-\s]/g, '');

        const maskedTelepon = sanitizedTelepon.length >= 8
            ? sanitizedTelepon.slice(0, 4) + '***' + sanitizedTelepon.slice(-4)
            : '***';

        const newReport: SecurityReport = {
            id: `SEC-${Date.now().toString().slice(-6)}`,
            jenis_kejadian,
            lokasi: sanitizedLokasi,
            tanggal_kejadian,
            status: 'Pending',
            priority: PRIORITY_MAP[jenis_kejadian] || 'Medium',
            nama_pelapor: sanitizedNama,
            telepon_display: maskedTelepon,
            kronologi: sanitizedKronologi,
            createdAt: new Date().toISOString(),
        };

        securityReports.unshift(newReport);

        return apiSuccess({
            report: newReport,
            message: 'Laporan keamanan berhasil dikirim',
        }, 201);
    } catch (error) {
        console.error('[Security API] POST error:', error);
        return apiError('Failed to submit security report', 500);
    }
}
