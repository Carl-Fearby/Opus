import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/documentation/components/lab",
        destination: "/documentation/components/labs",
        permanent: true,
      },
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
