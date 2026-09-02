import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_NEXT_ENV_CONTENTS = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";
import "./.next/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`;

export function restoreDefaultNextEnv(cwd = process.cwd()) {
  const nextEnvPath = resolve(cwd, "next-env.d.ts");
  let contents;

  try {
    contents = readFileSync(nextEnvPath, "utf8");
  } catch {
    writeFileSync(nextEnvPath, DEFAULT_NEXT_ENV_CONTENTS);
    return;
  }

  const restored = contents.replaceAll(".next-e2e", ".next");
  if (restored !== contents) {
    writeFileSync(nextEnvPath, restored);
  }
}

export function cleanE2eBuild({ nextEnvOnly = false, cwd = process.cwd() } = {}) {
  // Next records custom distDir type paths in next-env.d.ts and tsconfig.
  // Removing only the disposable E2E output prevents stale generated types
  // from affecting a later production build while preserving the normal
  // .next cache. Rewrite any .next-e2e type imports back to .next so an E2E
  // run cannot leave a git-dirty path, without clobbering Next-generated
  // imports such as root-params.
  if (!nextEnvOnly) {
    rmSync(resolve(cwd, ".next-e2e"), { force: true, recursive: true });
  }

  restoreDefaultNextEnv(cwd);
}

function isDirectRun() {
  const invoked = process.argv[1];
  return Boolean(invoked) && fileURLToPath(import.meta.url) === resolve(invoked);
}

if (isDirectRun()) {
  cleanE2eBuild({ nextEnvOnly: process.argv.includes("--next-env-only") });
}
