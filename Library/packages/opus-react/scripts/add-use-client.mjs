import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["dist/index.js", "dist/index.cjs"];
const directive = '"use client";';

// Opus components are interactive, so the published bundle is a client
// boundary: consumers can render them from a server component without
// wrapping every page in a pass-through client component of their own.
//
// This runs last because tsup's banner (and any esbuild pass over dist)
// drops module-level directives when it bundles. The directive is prepended
// on the same line as the first statement so the shipped source maps keep
// their original line numbers.
for (const target of targets) {
  const filePath = path.join(packageDir, target);
  const source = fs.readFileSync(filePath, "utf8");

  if (source.startsWith(directive)) {
    continue;
  }

  fs.writeFileSync(filePath, directive + source);
  console.log(`Added "use client" to ${target}`);
}
