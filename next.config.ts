import type { NextConfig } from 'next';
const config: NextConfig = {
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai', 'localhost', '127.0.0.1'],
  poweredByHeader: false,
  devIndicators: false,
  experimental: { cpus: 1, webpackMemoryOptimizations: true },
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' ${process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-src 'none'`,
          },
        ],
      },
    ];
  },
};
export default config;
