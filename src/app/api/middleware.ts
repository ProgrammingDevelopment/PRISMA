import { NextResponse, NextRequest } from 'next/server';

// Rate Limiting

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetAt) rateLimitStore.delete(key);
    }
}, 5 * 60 * 1000);

export function checkServerRateLimit(
    ip: string,
    maxRequests: number = 60,
    windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: Date } {
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(now + windowMs) };
    }

    if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: new Date(entry.resetAt) };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: new Date(entry.resetAt) };
}

// Security Headers

export function addSecurityHeaders(response: NextResponse): NextResponse {
    response.headers.set('Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self' https://api.telegram.org http://localhost:11434 https://*.supabase.co; " +
        "frame-ancestors 'none';"
    );
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    response.headers.delete('X-Powered-By');

    return response;
}

// Request Helpers

export function getClientIP(req: NextRequest | Request): string {
    if (req instanceof NextRequest) {
        return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            '127.0.0.1';
    }
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
}

export function sanitizeServerInput(input: string, maxLength: number = 1000): string {
    if (!input || typeof input !== 'string') return '';

    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript\s*:/gi, '')
        .replace(/\0/g, '')
        .slice(0, maxLength)
        .trim();
}

// SSRF Protection

const BLOCKED_IP_RANGES = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^0\./,
    /^169\.254\./,
    /^fc00:/i,
    /^fe80:/i,
    /^::1$/,
];

export function isSSRFSafe(url: string): boolean {
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) return false;

        const hostname = parsed.hostname;
        for (const range of BLOCKED_IP_RANGES) {
            if (range.test(hostname)) return false;
        }

        if (['localhost', '0.0.0.0', '[::]', '[::1]'].includes(hostname.toLowerCase())) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

// API Response Helpers

export function apiSuccess<T>(data: T, status: number = 200) {
    return addSecurityHeaders(NextResponse.json({ success: true, data }, { status }));
}

export function apiError(message: string, status: number = 400) {
    return addSecurityHeaders(NextResponse.json({ success: false, error: message }, { status }));
}

export function apiRateLimited(resetAt: Date) {
    const response = NextResponse.json(
        { success: false, error: 'Rate limit exceeded', retryAfter: resetAt.toISOString() },
        { status: 429 }
    );
    response.headers.set('Retry-After', Math.ceil((resetAt.getTime() - Date.now()) / 1000).toString());
    return addSecurityHeaders(response);
}

// CORS

const ALLOWED_ORIGINS = [
    'https://prisma-rt04.pages.dev',
    'https://prisma-rt04.vercel.app',
    'http://localhost:3000',
];

export function handleCORS(req: Request, response: NextResponse): NextResponse {
    const origin = req.headers.get('origin');
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
        response.headers.set('Access-Control-Max-Age', '86400');
    }
    return response;
}
