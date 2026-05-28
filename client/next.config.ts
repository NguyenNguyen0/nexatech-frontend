import type { NextConfig } from 'next';

const API_GATEWAY_URL = (
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
  'http://localhost:8080'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  /* Proxy API calls to backend gateway */
  async rewrites() {
    return {
      beforeFiles: [
        // All backend routes go through Spring Cloud Gateway.
        {
          source: '/api/v1/:path*',
          destination: `${API_GATEWAY_URL}/api/v1/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
