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
  // The CSS-module mapper runs after tsup and reads esbuild's module boundary
  // comments from the JS output. Do not minify this entry before that mapper:
  // minification removes the boundaries and leaves consumers with empty class
  // maps even though index.css is present.
  splitting: false,
  treeshake: true,
  minify: false,
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
