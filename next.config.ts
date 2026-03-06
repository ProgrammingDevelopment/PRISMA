import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Fix Turbopack compat error with next-pwa/serwist webpack config
  turbopack: {},
  // Trailing slash untuk kompatibilitas hosting
  trailingSlash: true,
};

export default withSerwist(nextConfig);
