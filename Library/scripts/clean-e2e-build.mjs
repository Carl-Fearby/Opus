import { rmSync } from "node:fs";
import { resolve } from "node:path";

// Next records custom distDir type paths in tsconfig. Removing only the
// disposable E2E output prevents stale generated types from affecting a later
// production build while preserving the normal .next build cache.
rmSync(resolve(process.cwd(), ".next-e2e"), { force: true, recursive: true });
