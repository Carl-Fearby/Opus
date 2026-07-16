import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const liveOpusReactSource = "./packages/opus-react/src/index.ts";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: appDir,
    resolveAlias: {
      "opus-react": liveOpusReactSource,
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "opus-react": path.join(appDir, "packages/opus-react/src/index.ts"),
    };

    return config;
  },
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
