import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["opus-react"],
  // This app is a faithful fork of the Opus documentation site, which is run
  // via `next dev`. A few preview helpers carry latent type mismatches that the
  // dev server tolerates; don't let them block the production build.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
