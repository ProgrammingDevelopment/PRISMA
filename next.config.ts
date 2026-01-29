export default {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.unsplash.com https://www.google.com https://maps.googleapis.com https://maps.gstatic.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://www.google.com; object-src 'none';",
          },
        ],
      },
    ];
  },
  /* Rewrites
  rewrites: async () => {
    return [
      {
        source: '/api/chat',
        destination: process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000/chat' : '/api/chat',
      },
    ];
  },
  */
};
