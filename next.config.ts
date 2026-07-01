import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  // Prisma/pg ni webpack bundle qilmasin — dev OOM kamayadi
  serverExternalPackages: ["@prisma/client", "prisma", "pg", "bcryptjs"],
  onDemandEntries: {
    maxInactiveAge: 5 * 60 * 1000,
    pagesBufferLength: 8,
  },
  experimental: {
    webpackMemoryOptimizations: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
