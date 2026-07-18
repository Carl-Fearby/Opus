#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { rewireSource } from "./rewire-source.mjs";

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

const textExts = new Set([".ts", ".tsx", ".css"]);

function walkFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, files);
    } else if (textExts.has(full.slice(full.lastIndexOf(".")))) {
      files.push(full);
    }
  }
  return files;
}

function syncTextFile(source, target, { rewire = false } = {}) {
  mkdirSync(dirname(target), { recursive: true });

  if (!rewire || !/\.tsx?$/.test(source)) {
    cpSync(source, target, { force: true });
    return;
  }

  const original = readFileSync(source, "utf8");
  const { source: next } = rewireSource(original);
  writeFileSync(target, next);
}

function syncDirectory(source, target, { rewire = false } = {}) {
  mkdirSync(target, { recursive: true });

  for (const file of walkFiles(source)) {
    const relativePath = relative(source, file);
    syncTextFile(file, join(target, relativePath), { rewire });
  }
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

syncDirectory(join(libraryDir, "lib", "controls"), join(appDir, "lib", "controls"), { rewire: true });

for (const file of [
  "emojiCatalog.generated.ts",
  "emojiCatalog.ts",
  "emojiCatalog.types.ts",
  "emojiRecentStorage.ts",
]) {
  cpSync(join(libraryDir, "lib", file), join(appDir, "lib", file), { force: true });
}

syncDirectory(join(libraryDir, "lib", "ui"), join(appDir, "lib", "ui"), { rewire: true });
syncTextFile(
  join(libraryDir, "lib", "playground", "externalPreviewStorage.ts"),
  join(appDir, "lib", "playground", "externalPreviewStorage.ts"),
  { rewire: true },
);
syncTextFile(
  join(libraryDir, "lib", "theme", "opusThemeTokens.ts"),
  join(appDir, "lib", "theme", "opusThemeTokens.ts"),
  { rewire: true },
);
syncTextFile(
  join(libraryDir, "lib", "theme", "useStoredTheme.ts"),
  join(appDir, "lib", "theme", "useStoredTheme.ts"),
  { rewire: true },
);
syncTextFile(
  join(libraryDir, "lib", "documentation", "breadcrumbs.ts"),
  join(appDir, "lib", "documentation", "breadcrumbs.ts"),
  { rewire: true },
);
cpSync(join(libraryDir, "app", "preview-theme.css"), join(appDir, "app", "preview-theme.css"), {
  force: true,
});
syncTextFile(
  join(libraryDir, "app", "documentation", "components", "raw", "[slug]", "page.tsx"),
  join(appDir, "app", "documentation", "components", "raw", "[slug]", "page.tsx"),
  { rewire: true },
);
syncTextFile(
  join(libraryDir, "app", "api", "playground-preview", "route.ts"),
  join(appDir, "app", "api", "playground-preview", "route.ts"),
  { rewire: true },
);
syncTextFile(
  join(libraryDir, "app", "documentation", "playground", "external", "page.tsx"),
  join(appDir, "app", "documentation", "playground", "external", "page.tsx"),
  { rewire: true },
);
syncTextFile(
  join(libraryDir, "components", "documentation", "CodePlayground", "ExternalPlaygroundPreview.tsx"),
  join(appDir, "components", "documentation", "CodePlayground", "ExternalPlaygroundPreview.tsx"),
  { rewire: true },
);

syncDirectory(join(libraryDir, "components", "control-detail"), join(appDir, "components", "control-detail"), {
  rewire: true,
});
syncDirectory(join(libraryDir, "components", "development"), join(appDir, "components", "development"), {
  rewire: true,
});

linkMissingComponents();

const rewire = spawnSync("node", ["scripts/rewire-imports.mjs"], {
  cwd: appDir,
  stdio: "inherit",
});

if (rewire.status !== 0) {
  process.exit(rewire.status ?? 1);
}

console.log("Done. Restart the Application dev server if it is running.");
