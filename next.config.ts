import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack instead of turbopack for production builds (lower memory usage on VPS)
  bundlePagesRouterDependencies: true,
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
