import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: "/auth-static",
  transpilePackages: ["host-app"],
  // devIndicators: false, // Next.js Dev Indicator
};

export default nextConfig;
