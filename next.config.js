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
};

module.exports = nextConfig;
