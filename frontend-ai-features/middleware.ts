import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip public files and API routes
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.includes('/api/') ||
        PUBLIC_FILE.test(request.nextUrl.pathname)
    ) {
        return;
    }

    // Check language preference (simplified)
    // In a real app, use next-intl middleware

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};
