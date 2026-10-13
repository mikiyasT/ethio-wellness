import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ethio-wellness/shared"],
  allowedDevOrigins: ["192.168.1.174", "**.trycloudflare.com"],
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://127.0.0.1:4000/:path*",
      },
    ];
  },
};

export default nextConfig;
