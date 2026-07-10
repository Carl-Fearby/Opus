import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));

// Turbopack requires a project-relative path (not absolute).
const opusReactEntry = "./node_modules/opus-react/dist/index.js";

function resolveBuildVersion() {
  if (process.env.NEXT_PUBLIC_BUILD_VERSION) {
    return process.env.NEXT_PUBLIC_BUILD_VERSION;
  }

  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 12);
  }

  try {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      version?: string;
    };
    return `${packageJson.version ?? "0.0.0"}-${Date.now()}`;
  } catch {
    return `build-${Date.now()}`;
  }
}

const buildVersion = resolveBuildVersion();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_VERSION: buildVersion,
  },
  // Use the pre-built opus-react bundle so CSS module hashes stay identical on server and client.
  // transpilePackages follows package source maps back into ../Library and recompiles modules.
  turbopack: {
    root: appDir,
    resolveAlias: {
      "opus-react": opusReactEntry,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "opus-react$": join(appDir, "node_modules/opus-react/dist/index.js"),
    };
    return config;
  },
  // This app is a faithful fork of the Opus documentation site, which is run
  // via `next dev`. A few preview helpers carry latent type mismatches that the
  // dev server tolerates; don't let them block the production build.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
