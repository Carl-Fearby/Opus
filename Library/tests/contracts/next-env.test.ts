import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_NEXT_ENV_CONTENTS,
  restoreDefaultNextEnv,
} from "../../scripts/clean-e2e-build.mjs";

describe("next-env.d.ts", () => {
  it("points typed routes at the default .next output", () => {
    const contents = readFileSync(resolve(import.meta.dirname, "../../next-env.d.ts"), "utf8");
    expect(contents).toContain('import "./.next/types/routes.d.ts"');
    expect(contents).not.toContain(".next-e2e");
  });

  it("rewrites a custom distDir import written by an E2E build", () => {
    const directory = mkdtempSync(join(tmpdir(), "opus-next-env-"));
    writeFileSync(
      join(directory, "next-env.d.ts"),
      DEFAULT_NEXT_ENV_CONTENTS.replaceAll("./.next/", "./.next-e2e/"),
    );

    restoreDefaultNextEnv(directory);

    expect(readFileSync(join(directory, "next-env.d.ts"), "utf8")).toBe(DEFAULT_NEXT_ENV_CONTENTS);
  });
});
