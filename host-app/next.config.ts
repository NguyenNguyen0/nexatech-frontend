import type { NextConfig } from "next";
const { AUTH_URL, API_GATEWAY_URL } = process.env;

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    const rules = [
      // ========================================
      // AUTH MODULE
      // ========================================
      {
        source: "/auth",
        destination: `${AUTH_URL}/auth`,
      },
      {
        source: "/auth/:path+",
        destination: `${AUTH_URL}/auth/:path+`,
      },
      {
        source: "/auth-static/_next/:path+",
        destination: `${AUTH_URL}/auth-static/_next/:path+`,
      },
      {
        source: "/brand/:path+",
        destination: `${AUTH_URL}/brand/:path+`,
      },
      {
        source: "/mocks/:path+",
        destination: `${AUTH_URL}/mocks/:path+`,
      },
    ];

    const gw = API_GATEWAY_URL?.replace(/\/$/, "");
    if (gw) {
      rules.push({
        source: "/api/v1/:path*",
        destination: `${gw}/api/v1/:path*`,
      });
    }

    return rules;
  },
};

export default nextConfig;
