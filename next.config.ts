import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: "http://140.245.196.215/:path*",
    },
  ],
};

export default nextConfig;
