// Security Report API Route
// Handles security incident reports with bcrypt encryption and OWASP compliance
// Implements protection against OSINT and XSS attacks

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Security configuration
const SALT_ROUNDS = 12; // bcrypt cost factor
const MAX_REPORT_LENGTH = 5000; // Maximum characters for kronologi

// Security report interface
interface SecurityReport {
    id: string;
    kronologi: string;
    tanggal_kejadian: string;
    waktu_kejadian: string;
    lokasi: string;
    nama_pelapor: string;
    telepon_pelapor_hash: string; // Hashed for privacy
    telepon_last4: string; // Only last 4 digits visible
    jenis_kejadian: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

// Mock security reports - in production, this would be in encrypted database
const securityReports: SecurityReport[] = [];

// Jenis kejadian keamanan
const incidentTypes = [
    { id: 'pencurian', label: 'Pencurian', priority: 'high' },
    { id: 'vandalisme', label: 'Vandalisme', priority: 'medium' },
    { id: 'gangguan_ketertiban', label: 'Gangguan Ketertiban', priority: 'medium' },
    { id: 'orang_mencurigakan', label: 'Orang Mencurigakan', priority: 'low' },
    { id: 'kebakaran', label: 'Kebakaran', priority: 'critical' },
    { id: 'banjir', label: 'Banjir', priority: 'high' },
    { id: 'kecelakaan', label: 'Kecelakaan', priority: 'high' },
    { id: 'lainnya', label: 'Lainnya', priority: 'low' },
];

// OWASP Security Headers
const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
};

// XSS Sanitization with advanced patterns
function sanitizeForXSS(input: string): string {
    if (typeof input !== 'string') return '';

    return input
        // Remove script tags
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Remove event handlers
        .replace(/\s*on\w+\s*=\s*(['"])[^'"]*\1/gi, '')
        .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
        // Remove javascript: URLs
        .replace(/javascript\s*:/gi, '')
        // Remove data: URLs (potential XSS vector)
        .replace(/data\s*:\s*text\/html/gi, '')
        // Remove vbscript: URLs
        .replace(/vbscript\s*:/gi, '')
        // Encode special characters
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        // Remove null bytes
        .replace(/\x00/g, '')
        // Remove SQL injection patterns
        .replace(/(['"])\s*;\s*--/g, '')
        .replace(/\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|EXEC)\b/gi, '')
        // Limit length
        .substring(0, MAX_REPORT_LENGTH);
}

// OSINT Protection - mask sensitive data
function maskPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return '****';
    const last4 = cleaned.slice(-4);
    return '*'.repeat(cleaned.length - 4) + last4;
}

function maskName(name: string): string {
    if (name.length <= 2) return '**';
    const firstChar = name.charAt(0);
    const lastChar = name.charAt(name.length - 1);
    return firstChar + '*'.repeat(name.length - 2) + lastChar;
}

// Phone number validation (Indonesian format)
function validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Indonesian phone number: 08xxx (10-13 digits) or +628xxx
    const indonesianPhoneRegex = /^(08|\+?628)\d{8,11}$/;
    return indonesianPhoneRegex.test(cleaned) || indonesianPhoneRegex.test('+62' + cleaned.slice(1));
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'types';

        let responseData;

        switch (type) {
            case 'types':
                responseData = incidentTypes;
                break;
            case 'stats':
                responseData = {
                    total: securityReports.length,
                    pending: securityReports.filter(r => r.status === 'pending').length,
                    resolved: securityReports.filter(r => r.status === 'resolved').length,
                    byPriority: {
                        critical: securityReports.filter(r => r.priority === 'critical').length,
                        high: securityReports.filter(r => r.priority === 'high').length,
                        medium: securityReports.filter(r => r.priority === 'medium').length,
                        low: securityReports.filter(r => r.priority === 'low').length,
                    },
                };
                break;
            case 'recent':
                // Return recent reports with OSINT protection (masked data)
                responseData = securityReports.slice(0, 5).map(report => ({
                    id: report.id,
                    jenis_kejadian: report.jenis_kejadian,
                    lokasi: report.lokasi,
                    tanggal_kejadian: report.tanggal_kejadian,
                    status: report.status,
                    priority: report.priority,
                    nama_pelapor: maskName(sanitizeForXSS(report.nama_pelapor)),
                    telepon_display: report.telepon_last4,
                }));
                break;
            default:
                responseData = incidentTypes;
        }

        const response = NextResponse.json({
            success: true,
            data: responseData,
            security: {
                xss_protected: true,
                osint_protected: true,
                bcrypt_enabled: true,
            },
            timestamp: new Date().toISOString(),
        });

        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch security data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const requiredFields = ['kronologi', 'tanggal_kejadian', 'nama_pelapor', 'telepon_pelapor', 'jenis_kejadian'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { success: false, error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        // Validate phone number
        if (!validatePhoneNumber(body.telepon_pelapor)) {
            return NextResponse.json(
                { success: false, error: 'Invalid phone number format' },
                { status: 400 }
            );
        }

        // Validate kronologi length
        if (body.kronologi.length > MAX_REPORT_LENGTH) {
            return NextResponse.json(
                { success: false, error: `Kronologi exceeds maximum length of ${MAX_REPORT_LENGTH} characters` },
                { status: 400 }
            );
        }

        // Sanitize all string inputs for XSS
        const sanitizedKronologi = sanitizeForXSS(body.kronologi);
        const sanitizedNama = sanitizeForXSS(body.nama_pelapor);
        const sanitizedLokasi = sanitizeForXSS(body.lokasi || 'Tidak disebutkan');

        // Hash phone number with bcrypt for security
        const phoneHash = await bcrypt.hash(body.telepon_pelapor, SALT_ROUNDS);
        const last4Digits = body.telepon_pelapor.slice(-4);

        // Get priority from incident type
        const incidentType = incidentTypes.find(t => t.id === body.jenis_kejadian);
        const priority = (incidentType?.priority || 'low') as SecurityReport['priority'];

        // Create new security report
        const newReport: SecurityReport = {
            id: uuidv4(),
            kronologi: sanitizedKronologi,
            tanggal_kejadian: body.tanggal_kejadian,
            waktu_kejadian: body.waktu_kejadian || 'Tidak disebutkan',
            lokasi: sanitizedLokasi,
            nama_pelapor: sanitizedNama,
            telepon_pelapor_hash: phoneHash,
            telepon_last4: last4Digits,
            jenis_kejadian: body.jenis_kejadian,
            status: 'pending',
            created_at: new Date().toISOString(),
            priority,
        };

        // Add to reports (in production, this would be saved to encrypted database)
        securityReports.unshift(newReport);

        const response = NextResponse.json({
            success: true,
            reportId: newReport.id,
            message: 'Laporan keamanan berhasil diterima',
            status: 'pending',
            priority,
            security: {
                phone_encrypted: true,
                data_sanitized: true,
            },
            timestamp: new Date().toISOString(),
        });

        Object.entries(securityHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    } catch (error) {
        console.error('Security report error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit security report' },
            { status: 500 }
        );
    }
}
