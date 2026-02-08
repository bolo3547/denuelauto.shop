/** @type {import('next').NextConfig} */

const isVercel = process.env.VERCEL === '1';
const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  reactStrictMode: true,
  // For static export (Imbra/cPanel) set STATIC_EXPORT=true.
  // On Vercel, output is managed automatically (do not set 'export').
  output: isStaticExport ? 'export' : undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // On Vercel, use the built-in image optimization service.
    // For static export or other hosts, images must be unoptimized.
    unoptimized: isStaticExport || !isVercel,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.denuelauto.shop',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

module.exports = nextConfig;
