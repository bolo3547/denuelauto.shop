/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow switching to `export` output when `STATIC_EXPORT=true` is set.
  // For local development and `next start` we avoid forcing `export` so
  // `next start` can run. To produce a static deliverable set
  // `STATIC_EXPORT=true` in the environment when running `next build`.
  output: process.env.STATIC_EXPORT === 'true' ? 'export' : undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
