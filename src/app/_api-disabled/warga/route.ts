import { NextRequest } from 'next/server';
import {
    apiSuccess, apiError, apiRateLimited,
    checkServerRateLimit, getClientIP, sanitizeServerInput,
} from '../middleware';
import fs from 'fs';
import path from 'path';

interface WargaRecord {
    id: number;
    nama: string;
    alamat: string;
    status: string;
    telepon: string;
    createdAt: string;
}

function loadWarga(): WargaRecord[] {
    try {
        const dataPath = path.resolve(process.cwd(), 'scripts', 'data-store.json');
        const raw = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(raw);
        return data.residents || [];
    } catch {
        return [];
    }
}

function saveWarga(warga: WargaRecord[]): void {
    try {
        const dataPath = path.resolve(process.cwd(), 'scripts', 'data-store.json');
        const raw = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(raw);
        data.residents = warga;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf-8');
    } catch (error) {
        console.error('[Warga API] Failed to save:', error);
    }
}

export async function GET(req: NextRequest) {
    const ip = getClientIP(req);
    const rateCheck = checkServerRateLimit(ip, 120, 60000);
    if (!rateCheck.allowed) return apiRateLimited(rateCheck.resetAt);

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search')?.toLowerCase();
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

        let wargaList = loadWarga();

        if (search) {
            wargaList = wargaList.filter(w =>
                w.nama.toLowerCase().includes(search) ||
                w.alamat.toLowerCase().includes(search)
            );
        }
        if (status) {
            wargaList = wargaList.filter(w => w.status === status);
        }

        const total = wargaList.length;
        const offset = (page - 1) * limit;
        const paginated = wargaList.slice(offset, offset + limit);

        return apiSuccess({
            warga: paginated,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('[Warga API] GET error:', error);
        return apiError('Failed to fetch warga data', 500);
    }
}

export async function POST(req: NextRequest) {
    const ip = getClientIP(req);
    const rateCheck = checkServerRateLimit(ip, 20, 60000);
    if (!rateCheck.allowed) return apiRateLimited(rateCheck.resetAt);

    try {
        const body = await req.json();
        const { nama, alamat, telepon, status: wargaStatus } = body;

        if (!nama || typeof nama !== 'string' || nama.trim().length < 2) {
            return apiError('Nama warga minimal 2 karakter', 422);
        }
        if (!alamat || typeof alamat !== 'string' || alamat.trim().length < 3) {
            return apiError('Alamat warga minimal 3 karakter', 422);
        }

        const sanitizedNama = sanitizeServerInput(nama, 100);
        const sanitizedAlamat = sanitizeServerInput(alamat, 200);
        const sanitizedTelepon = sanitizeServerInput(telepon || '', 20).replace(/[^0-9+\-\s]/g, '');
        const sanitizedStatus = ['Tetap', 'Kontrak', 'Kost', 'Baru'].includes(wargaStatus) ? wargaStatus : 'Baru';

        if (sanitizedTelepon && !/^(\+?62|0)\d{8,13}$/.test(sanitizedTelepon.replace(/[\s-]/g, ''))) {
            return apiError('Format nomor telepon tidak valid', 422);
        }

        const wargaList = loadWarga();
        const newWarga: WargaRecord = {
            id: wargaList.length > 0 ? Math.max(...wargaList.map(w => w.id)) + 1 : 1,
            nama: sanitizedNama,
            alamat: sanitizedAlamat,
            status: sanitizedStatus,
            telepon: sanitizedTelepon,
            createdAt: new Date().toISOString(),
        };

        wargaList.push(newWarga);
        saveWarga(wargaList);

        return apiSuccess({ warga: newWarga, message: 'Warga berhasil ditambahkan' }, 201);
    } catch (error) {
        console.error('[Warga API] POST error:', error);
        return apiError('Failed to add warga', 500);
    }
}
