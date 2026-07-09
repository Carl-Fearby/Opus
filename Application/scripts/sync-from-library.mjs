#!/usr/bin/env node
import { cpSync, existsSync, lstatSync, readdirSync, symlinkSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = join(scriptDir, "..");
const rootDir = join(appDir, "..");
const libraryDir = join(rootDir, "Library");

const applicationOnlyComponents = new Set([
  "DeployUpdateNotifier",
  "control-detail",
  "development",
  "documentation",
  "theme",
]);

function syncDirectory(source, target) {
  cpSync(source, target, { recursive: true, force: true });
}

function linkMissingComponents() {
  const libraryComponentsDir = join(libraryDir, "components");
  const applicationComponentsDir = join(appDir, "components");

  for (const entry of readdirSync(libraryComponentsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (applicationOnlyComponents.has(entry.name)) {
      continue;
    }

    const targetPath = join(applicationComponentsDir, entry.name);
    if (existsSync(targetPath)) {
      continue;
    }

    const relativeSource = relative(applicationComponentsDir, join(libraryComponentsDir, entry.name));
    symlinkSync(relativeSource, targetPath);
    console.log(`linked components/${entry.name}`);
  }
}

console.log("Syncing Application from Library...");

syncDirectory(join(libraryDir, "lib", "controls"), join(appDir, "lib", "controls"));

for (const file of [
  "emojiCatalog.generated.ts",
  "emojiCatalog.ts",
  "emojiCatalog.types.ts",
  "emojiRecentStorage.ts",
]) {
  cpSync(join(libraryDir, "lib", file), join(appDir, "lib", file), { force: true });
}

syncDirectory(join(libraryDir, "lib", "ui"), join(appDir, "lib", "ui"));
cpSync(join(libraryDir, "lib", "theme", "opusThemeTokens.ts"), join(appDir, "lib", "theme", "opusThemeTokens.ts"), {
  force: true,
});
cpSync(join(libraryDir, "lib", "theme", "useStoredTheme.ts"), join(appDir, "lib", "theme", "useStoredTheme.ts"), {
  force: true,
});
cpSync(join(libraryDir, "lib", "documentation", "breadcrumbs.ts"), join(appDir, "lib", "documentation", "breadcrumbs.ts"), {
  force: true,
});

syncDirectory(join(libraryDir, "components", "control-detail"), join(appDir, "components", "control-detail"));
syncDirectory(join(libraryDir, "components", "development"), join(appDir, "components", "development"));

linkMissingComponents();

console.log("Done. Restart the Application dev server if it is running.");
