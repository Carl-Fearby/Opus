import fs from "node:fs";
import path from "node:path";
import { rewireSource } from "./rewire-source.mjs";

const appRoot = path.resolve(process.cwd());
const targetDirs = ["app", "components", "lib"];

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

let changedFiles = 0;
let changedSpecifiers = 0;

for (const dir of targetDirs) {
  const abs = path.join(appRoot, dir);
  if (!fs.existsSync(abs)) continue;

  for (const file of walk(abs)) {
    if (path.relative(appRoot, file).startsWith(`lib${path.sep}playground${path.sep}`)) {
      continue;
    }

    const source = fs.readFileSync(file, "utf8");
    const { changed, source: next } = rewireSource(source);

    if (changed) {
      fs.writeFileSync(file, next);
      changedFiles += 1;
      changedSpecifiers += 1;
    }
  }
}

console.log(`Rewired ${changedSpecifiers} import(s) across ${changedFiles} file(s).`);
