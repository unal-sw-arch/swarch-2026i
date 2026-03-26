import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.akamai.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.epicgames.com',
      },
      {
        protocol: 'https',
        hostname: 'images.gog-statics.com',
      },
      {
        protocol: 'https',
        hostname: 'store-images.s-microsoft.com',
      },
    ],
  },
  experimental: {
    // Enables React 19 server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:8080'],
    },
  },
};

export default nextConfig;
