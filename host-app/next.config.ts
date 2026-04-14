import type { NextConfig } from "next";
const { AUTH_URL, PRODUCT_URL, CART_URL, ORDER_URL, USER_URL, MARKETING_URL, API_GATEWAY_URL } = process.env;

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
      // ========================================
      // PRODUCT MODULE
      // ========================================
      {
        source: "/product",
        destination: `${PRODUCT_URL}/product`,
      },
      {
        source: "/product/:path+",
        destination: `${PRODUCT_URL}/product/:path+`,
      },
      {
        source: "/product-static/_next/:path+",
        destination: `${PRODUCT_URL}/product-static/_next/:path+`,
      },
      // ========================================
      // CART MODULE
      // ========================================
      {
        source: "/cart",
        destination: `${CART_URL}/cart`,
      },
      {
        source: "/cart/:path+",
        destination: `${CART_URL}/cart/:path+`,
      },
      {
        source: "/cart-static/_next/:path+",
        destination: `${CART_URL}/cart-static/_next/:path+`,
      },
      // ========================================
      // ORDER MODULE
      // ========================================
      {
        source: "/order",
        destination: `${ORDER_URL}/order`,
      },
      {
        source: "/order/:path+",
        destination: `${ORDER_URL}/order/:path+`,
      },
      {
        source: "/order-static/_next/:path+",
        destination: `${ORDER_URL}/order-static/_next/:path+`,
      },
      // ========================================
      // USER MODULE
      // ========================================
      {
        source: "/user",
        destination: `${USER_URL}/user`,
      },
      {
        source: "/user/:path+",
        destination: `${USER_URL}/user/:path+`,
      },
      {
        source: "/user-static/_next/:path+",
        destination: `${USER_URL}/user-static/_next/:path+`,
      },
      // ========================================
      // MARKETING MODULE
      // ========================================
      {
        source: "/marketing",
        destination: `${MARKETING_URL}/marketing`,
      },
      {
        source: "/marketing/:path+",
        destination: `${MARKETING_URL}/marketing/:path+`,
      },
      {
        source: "/marketing-static/_next/:path+",
        destination: `${MARKETING_URL}/marketing-static/_next/:path+`,
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
