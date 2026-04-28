import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: "/order-static",
  // devIndicators: false, // Next.js Dev Indicator
  async rewrites() {
    const orderUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:8084';
    const paymentUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8086';
    const authUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/v1/orders/:path*',
        destination: `${orderUrl}/api/v1/orders/:path*`,
      },
      {
        source: '/api/v1/checkout',
        destination: `${orderUrl}/api/v1/checkout`,
      },
      {
        source: '/api/v1/cart/:path*',
        destination: `${orderUrl}/api/v1/cart/:path*`,
      },
      {
        source: '/api/v1/returns/:path*',
        destination: `${orderUrl}/api/v1/returns/:path*`,
      },
      {
        source: '/api/v1/payments/:path*',
        destination: `${paymentUrl}/api/v1/payments/:path*`,
      },
      {
        source: '/api/v1/auth/:path*',
        destination: `${authUrl}/api/v1/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
