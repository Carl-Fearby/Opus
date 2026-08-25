import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "packages/*/dist/**",
    "next-env.d.ts",
  ]),
  {
    // This library is not compiled with the React Compiler. The compiler-only
    // diagnostics are not reliable as lint failures for its existing hooks.
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
    },
  },
  {
    // These reusable UI components accept arbitrary, including blob and data,
    // image URLs. Next Image cannot safely optimize those sources.
    files: ["components/**/*.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
]);
