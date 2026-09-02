import { execFileSync } from "node:child_process";

export default function restoreNextEnv() {
  execFileSync(process.execPath, ["scripts/clean-e2e-build.mjs", "--next-env-only"], {
    stdio: "inherit",
  });
}
