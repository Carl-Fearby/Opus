import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/development/components",
        destination: "/documentation/components",
        permanent: true,
      },
      {
        source: "/development/components/:path*",
        destination: "/documentation/components/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
