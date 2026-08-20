import path from "node:path";
import { fileURLToPath } from "node:url";
import cssModulesPlugin from "esbuild-css-modules-plugin";
import { defineConfig } from "tsup";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  entry: {
    index: "src/index.ts",
    styles: "src/styles.css",
  },
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  // Keep the package consumable from both ESM and CommonJS while removing
  // unreachable component code from each published entry point.
  splitting: false,
  treeshake: true,
  minify: true,
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "three",
  ],
  esbuildPlugins: [
    cssModulesPlugin({
      pattern: "[local]",
    }),
  ],
  esbuildOptions(options) {
    options.alias = {
      "@": rootDir,
    };
  },
  outDir: "dist",
});
