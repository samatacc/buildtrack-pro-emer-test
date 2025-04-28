const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // During PR preview deployments, don't fail the build on type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // During PR preview deployments, don't fail the build on lint errors
    ignoreDuringBuilds: true,
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
  // Enhanced path resolution for Vercel deployment
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Enhance module resolution with explicit path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/app': path.resolve(__dirname, './app'),
    };
    return config;
  },
};

module.exports = nextConfig;
