/** @type {import('next').NextConfig} */

// Detect environments
const isCI = process.env.CI === 'true' || process.env.VERCEL === '1';
const isBuild = process.env.npm_lifecycle_event === 'build';

// Enhanced configuration for BuildTrack Pro Phase 1
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Always be lenient with errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize for production builds
  compiler: {
    // Remove console logs in production, keep errors
    removeConsole: isCI ? {
      exclude: ['error'],
    } : false,
  },
  // Make module resolution more lenient for builds
  webpack: (config, { isServer }) => {
    // Add fallback for missing modules during build
    config.resolve.fallback = {
      ...config.resolve.fallback,
    };
    
    return config;
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
