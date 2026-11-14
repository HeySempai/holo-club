import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/colecciones", destination: "/packs", permanent: true },
      { source: "/colecciones/:id", destination: "/packs/:id", permanent: true },
    ];
  },
};

export default nextConfig;
