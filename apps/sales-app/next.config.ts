import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/n8n/:path*",
        destination: `${process.env.NEXT_PUBLIC_N8N_URL ?? "http://localhost:5678"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
