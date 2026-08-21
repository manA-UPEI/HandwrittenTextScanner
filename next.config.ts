import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Handwriting photos arrive as base64; a few MB of overhead is expected.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
