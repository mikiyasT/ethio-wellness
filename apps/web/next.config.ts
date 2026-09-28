import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ethio-wellness/shared"],
  allowedDevOrigins: ["192.168.1.174"],
};

export default nextConfig;
