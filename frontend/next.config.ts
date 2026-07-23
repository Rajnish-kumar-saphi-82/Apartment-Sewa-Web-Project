import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8090",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8090/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "http://localhost:8090/uploads/:path*",
      },
    ];
  },
  // Suppress ECONNRESET noise when backend is not yet running
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
