import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api-content/:path*",
        destination: "http://localhost:8000/api-content/:path*",
      },
    ];
  },
};

export default nextConfig;
