import fs from "node:fs";
import path from "node:path";

const appRoot = path.resolve(process.cwd());
const targetDirs = ["app", "components", "lib"];

// Local (docs-infra) module roots that must NOT be rewired to opus-react.
const localRoots = new Set(["development", "documentation", "control-detail"]);

const exts = new Set([".ts", ".tsx"]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (exts.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

// Rewrites any `@/components/<X>...` specifier to `opus-react` unless <X> is a
// local docs-infra root. Handles static imports, type imports, and dynamic imports.
const specifierPattern = /(["'])@\/components\/([A-Za-z0-9_-]+)(\/[^"']*)?\1/g;

let changedFiles = 0;
let changedSpecifiers = 0;

for (const dir of targetDirs) {
  const abs = path.join(appRoot, dir);
  if (!fs.existsSync(abs)) continue;

  for (const file of walk(abs)) {
    const source = fs.readFileSync(file, "utf8");
    let fileChanged = false;

    const next = source.replace(specifierPattern, (match, quote, root) => {
      if (localRoots.has(root)) {
        return match;
      }
      fileChanged = true;
      changedSpecifiers += 1;
      return `${quote}opus-react${quote}`;
    });

    if (fileChanged) {
      fs.writeFileSync(file, next);
      changedFiles += 1;
    }
  }
}

console.log(`Rewired ${changedSpecifiers} import(s) across ${changedFiles} file(s).`);
