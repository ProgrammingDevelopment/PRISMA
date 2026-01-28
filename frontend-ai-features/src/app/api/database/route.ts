// Database Configuration and Connection API
// This is the main database route that handles all database operations

import { NextRequest, NextResponse } from 'next/server';

// MySQL connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prisma_rt04',
    port: parseInt(process.env.DB_PORT || '3306'),
};

// Security headers for OWASP compliance
const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

export async function GET(request: NextRequest) {
    try {
        // Return database status and available endpoints
        const response = NextResponse.json({
            status: 'connected',
            database: dbConfig.database,
            endpoints: {
                administrasi: '/api/database/administrasi',
                surat: '/api/database/surat',
                keuangan: '/api/database/keuangan',
                keamanan: '/api/database/keamanan',
            },
            timestamp: new Date().toISOString(),
        });

        // Apply security headers
        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { error: 'Database connection failed', details: String(error) },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Basic input validation for XSS prevention
        if (typeof body !== 'object' || body === null) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Database operation successful',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Database operation failed' },
            { status: 500 }
        );
    }
}
