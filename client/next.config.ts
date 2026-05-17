import type { NextConfig } from 'next';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL?.replace(/\/$/, '') ?? 'http://localhost:8080';

const nextConfig: NextConfig = {
  /* Proxy API calls to backend gateway */
  async rewrites() {
    return [
      // Temporarily disabled to use local mock API routes
      // {
      //   source: '/api/v1/:path*',
      //   destination: `${API_GATEWAY_URL}/api/v1/:path*`,
      // },
    ];
  },
};

export default nextConfig;
