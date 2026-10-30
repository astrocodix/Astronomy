import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
if (basePath && (!basePath.startsWith('/') || basePath.endsWith('/'))) {
  throw new Error(
    'NEXT_PUBLIC_BASE_PATH must be empty or start with / and have no trailing slash.',
  );
}

const config: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai', 'localhost', '127.0.0.1'],
  poweredByHeader: false,
  devIndicators: false,
  reactStrictMode: true,
  experimental: { cpus: 1, webpackMemoryOptimizations: true },
};

export default config;
