/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'],
  },
  // Vercel specific configuration
  typescript: {
    // During PR preview deployments, don't fail the build on type errors
    ignoreBuildErrors: process.env.VERCEL_ENV !== 'production',
  },
  eslint: {
    // During PR preview deployments, don't fail the build on lint errors
    ignoreDuringBuilds: process.env.VERCEL_ENV !== 'production',
  },
};

module.exports = nextConfig;
