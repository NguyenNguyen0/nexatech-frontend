import type { NextConfig } from "next";
const { BLOG_URL } = process.env;
const { AUTH_URL } = process.env;

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  async rewrites() {
    return [
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
      // ========================================
      // PRODUCT MODULE
      // ========================================
      {
        source: "/blog",
        destination: `${BLOG_URL}/blog`,
      },
      {
        source: "/blog/:path+",
        destination: `${BLOG_URL}/blog/:path+`,
      },
      {
        source: "/blog-static/_next/:path+",
        destination: `${BLOG_URL}/blog-static/_next/:path+`,
      },
    ];
  },
};

export default nextConfig;
