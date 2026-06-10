import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.akamai.steamstatic.com',
        pathname: '/**'
      },
      {
      protocol: "https",
      hostname: "shared.akamai.steamstatic.com",
      pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'cdn.epicgames.com',
      },
      {
        protocol: 'https',
        hostname: 'images.gog-statics.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'store-images.s-microsoft.com',
        pathname: '/**'
      },
      {
      protocol: "https",
      hostname: "cdn.cloudflare.steamstatic.com",
      pathname: '/**'
      },
      {
        protocol: "https",
        hostname: "cdn.akamai.steamstatic.com",
        pathname: '/**'
      },
      {
        protocol: "https",
        hostname: "store.steampowered.com",
        pathname: '/**'
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
