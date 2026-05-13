import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Allow local IP access for dev server
  allowedDevOrigins: ['10.10.21.216', 'localhost', '127.0.0.1'],
};

export default nextConfig;
