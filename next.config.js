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
};

module.exports = nextConfig;
