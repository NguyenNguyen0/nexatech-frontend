import type { NextConfig } from 'next';

const API_GATEWAY_URL = (
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
  'http://localhost:8080'
).replace(/\/$/, '');
const PROMOTION_SERVICE_URL = (
  process.env.PROMOTION_SERVICE_URL ||
  'http://localhost:8093'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  /* Proxy API calls to backend gateway */
  async rewrites() {
    return {
      beforeFiles: [
        // Promotion service routes trực tiếp (không qua Spring Gateway vì Node.js không dùng Eureka)
        {
          source: '/api/v1/promotions/:path*',
          destination: `${PROMOTION_SERVICE_URL}/api/v1/promotions/:path*`,
        },
        {
          source: '/api/v1/flash-sales/:path*',
          destination: `${PROMOTION_SERVICE_URL}/api/v1/flash-sales/:path*`,
        },
        {
          source: '/api/v1/internal/promotions/:path*',
          destination: `${PROMOTION_SERVICE_URL}/api/v1/internal/promotions/:path*`,
        },
        // Catch-all: tất cả /api/v1/* còn lại → Spring Cloud Gateway → Eureka
        {
          source: '/api/v1/:path*',
          destination: `${API_GATEWAY_URL}/api/v1/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
