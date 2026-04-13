import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

// Suppress harmless Turbopack warning — Serwist is already disabled in non-production via `disable` flag
process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = '1';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Fix Turbopack compat error with next-pwa/serwist webpack config
  turbopack: {},
  // Trailing slash for hosting compatibility
  trailingSlash: true,
  // Performance: compress responses
  compress: true,
  // Security: remove X-Powered-By header
  poweredByHeader: false,
  // Security headers for all routes (now managed by _headers on Cloudflare Pages/Static hosting)
  // Structured logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default withSerwist(nextConfig);
