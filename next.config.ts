import type { NextConfig } from "next";

/** Where browser calls to /api/* are proxied (no /api prefix on the backend). Use local gateway in dev. */
const backendProxyBase = (process.env.BACKEND_PROXY_URL ?? "http://140.245.196.215").replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    // Keep Turbopack resolution scoped to this app directory.
    root: __dirname,
  },
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
      destination: `${backendProxyBase}/:path*`,
    },
  ],
};

export default nextConfig;
