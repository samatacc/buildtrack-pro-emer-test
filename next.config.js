/** @type {import('next').NextConfig} */

// Detect if we're in a CI environment
const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Set production build to be more lenient for CI environments
  typescript: {
    // Don't fail the build on type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't fail the build on lint errors
    ignoreDuringBuilds: true,
  },
  // Add more compiler options for CI builds
  compiler: {
    // Eliminate React server components errors during build
    removeConsole: isCI ? {
      exclude: ['error'],
    } : false,
  },
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
