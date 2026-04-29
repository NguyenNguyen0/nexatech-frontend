import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  assetPrefix: "/payment-static",
  turbopack: {
    root: appRoot,
  },
  async rewrites() {
    const paymentUrl = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8086';
    const orderUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:8084';
    const authUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:8080';
    return [
      {
        source: '/api/v1/admin/payments/:path*',
        destination: `${paymentUrl}/api/v1/admin/payments/:path*`,
      },
      {
        source: '/api/v1/payments/:path*',
        destination: `${paymentUrl}/api/v1/payments/:path*`,
      },
      {
        source: '/api/v1/orders/:path*',
        destination: `${orderUrl}/api/v1/orders/:path*`,
      },
      {
        source: '/api/v1/auth/:path*',
        destination: `${authUrl}/api/v1/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
