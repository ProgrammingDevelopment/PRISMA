// File Upload API Route
// Handles file uploads for admin with subfolder management

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Security headers
const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
};

// Allowed file types
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Mock file database (in production, use MySQL)
let mockFileDb: {
    id: number;
    nama_file: string;
    nama_asli: string;
    kategori: string;
    subfolder: string;
    file_path: string;
    file_type: string;
    file_size: number;
    is_public: boolean;
    is_template: boolean;
    download_count: number;
    uploaded_by: number;
    created_at: string;
}[] = [];

let fileIdCounter = 1;

// GET - List files
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    const subfolder = searchParams.get('subfolder');
    const isPublic = searchParams.get('public');

    let files = [...mockFileDb];

    if (kategori) {
        files = files.filter(f => f.kategori === kategori);
    }
    if (subfolder) {
        files = files.filter(f => f.subfolder === subfolder);
    }
    if (isPublic === 'true') {
        files = files.filter(f => f.is_public);
    }

    const response = NextResponse.json({
        success: true,
        data: files,
        total: files.length,
        timestamp: new Date().toISOString(),
    });

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

// POST - Upload file
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const kategori = formData.get('kategori') as string || 'lainnya';
        const subfolder = formData.get('subfolder') as string || 'general';
        const deskripsi = formData.get('deskripsi') as string || '';
        const isPublic = formData.get('isPublic') === 'true';
        const isTemplate = formData.get('isTemplate') === 'true';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Tipe file tidak diizinkan' },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: 'Ukuran file melebihi 10MB' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.name);
        const sanitizedName = file.name
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .toLowerCase();
        const uniqueName = `${timestamp}_${sanitizedName}`;

        // In production: Save file to disk
        // const uploadDir = path.join(process.cwd(), 'public', 'uploads', kategori, subfolder);
        // await mkdir(uploadDir, { recursive: true });
        // const filePath = path.join(uploadDir, uniqueName);
        // const bytes = await file.arrayBuffer();
        // await writeFile(filePath, Buffer.from(bytes));

        // Mock save to database
        const fileRecord = {
            id: fileIdCounter++,
            nama_file: uniqueName,
            nama_asli: file.name,
            kategori,
            subfolder,
            file_path: `/uploads/${kategori}/${subfolder}/${uniqueName}`,
            file_type: file.type,
            file_size: file.size,
            is_public: isPublic,
            is_template: isTemplate,
            download_count: 0,
            uploaded_by: 1, // Default admin user
            created_at: new Date().toISOString(),
        };

        mockFileDb.push(fileRecord);

        const response = NextResponse.json({
            success: true,
            data: fileRecord,
            message: 'File berhasil diupload',
        });

        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Upload gagal' },
            { status: 500 }
        );
    }
}

// DELETE - Remove file
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fileId = searchParams.get('id');

        if (!fileId) {
            return NextResponse.json(
                { success: false, error: 'File ID required' },
                { status: 400 }
            );
        }

        const fileIndex = mockFileDb.findIndex(f => f.id === parseInt(fileId));

        if (fileIndex === -1) {
            return NextResponse.json(
                { success: false, error: 'File tidak ditemukan' },
                { status: 404 }
            );
        }

        // In production: Delete file from disk
        // await unlink(mockFileDb[fileIndex].file_path);

        mockFileDb.splice(fileIndex, 1);

        return NextResponse.json({
            success: true,
            message: 'File berhasil dihapus',
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Gagal menghapus file' },
            { status: 500 }
        );
    }
}
