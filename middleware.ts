import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter (Works for single-instance dev server/warm lambda)
const rateLimit = new Map();

const RATE_LIMIT_WINDOW = 10 * 1000; // 10 seconds
const MAX_REQUESTS = 10; // Max 10 requests per window

export function middleware(request: NextRequest) {
    // Only limit API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
        const now = Date.now();

        const record = rateLimit.get(ip);

        if (record) {
            // Check if window has passed
            if (now - record.startTime > RATE_LIMIT_WINDOW) {
                // Reset
                rateLimit.set(ip, { startTime: now, count: 1 });
            } else {
                // Increment
                record.count++;
                if (record.count > MAX_REQUESTS) {
                    return new NextResponse(
                        JSON.stringify({ error: 'Too Many Requests', message: 'Please slow down.' }),
                        { status: 429, headers: { 'Content-Type': 'application/json' } }
                    );
                }
            }
        } else {
            // New record
            rateLimit.set(ip, { startTime: now, count: 1 });
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/api/:path*',
}
