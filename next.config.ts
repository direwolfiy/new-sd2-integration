import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-content/:path*",
        destination: "https://precontent.lingify.cn/api-content/:path*",
      },
    ];
  },
};

export default nextConfig;
