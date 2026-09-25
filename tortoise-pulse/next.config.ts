import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow bcryptjs in server components
  serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;
