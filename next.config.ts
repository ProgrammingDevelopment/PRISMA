import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Trailing slash untuk kompatibilitas static hosting
  trailingSlash: true,
};

export default nextConfig;
