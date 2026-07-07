import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "lightningcss";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libraryRoot = path.resolve(packageDir, "../..");
const distDir = path.join(packageDir, "dist");
const jsBundles = ["index.js", "index.cjs"];
const cssBundle = path.join(distDir, "index.css");

// Matches an esbuild module boundary comment followed by the (empty) CSS module
// default object, e.g.:
//   // ../../components/fields/Button/Button.module.css
//   var Button_default = {};
const moduleBlockPattern =
  /(\/\/ (?<path>[^\n]+\.module\.css)\nvar (?<varName>\w+) = )\{[^\n]*\};/g;

// A short, deterministic prefix per source file so class names are unique
// across components (avoids global collisions) while staying stable between
// the CSS output and the JS class map.
function scopePrefix(relPath) {
  const digest = crypto.createHash("sha1").update(relPath).digest("base64url").slice(0, 6);
  return `opus_${digest}`;
}

function toRelPath(commentPath) {
  const normalized = commentPath.replace(/^(\.\.\/)+/, "");
  return path.relative(libraryRoot, path.join(libraryRoot, normalized));
}

function transformCss(cssPath, relPath) {
  const result = bundle({
    filename: cssPath,
    code: fs.readFileSync(cssPath),
    projectRoot: libraryRoot,
    cssModules: { pattern: `${scopePrefix(relPath)}_[local]` },
  });

  const map = {};
  for (const [name, value] of Object.entries(result.exports ?? {})) {
    const composed = value.composes?.map((item) => item.name).filter(Boolean).join(" ") ?? "";
    map[name] = composed ? `${composed} ${value.name}` : value.name;
  }

  return { css: result.code.toString("utf8"), map };
}

// Collect the ordered, de-duplicated list of CSS module files from the JS
// bundle and compute their scoped output once.
const orderedRelPaths = [];
const cssResultByRel = new Map();

function ensureTransformed(commentPath) {
  const relPath = toRelPath(commentPath);
  if (cssResultByRel.has(relPath)) {
    return cssResultByRel.get(relPath);
  }

  const cssPath = path.join(libraryRoot, relPath);
  if (!fs.existsSync(cssPath)) {
    throw new Error(`CSS module not found: ${cssPath}`);
  }

  const result = transformCss(cssPath, relPath);
  cssResultByRel.set(relPath, result);
  orderedRelPaths.push(relPath);
  return result;
}

function patchJsBundle(fileName) {
  const filePath = path.join(distDir, fileName);
  if (!fs.existsSync(filePath)) {
    return 0;
  }

  let patched = 0;
  const source = fs.readFileSync(filePath, "utf8").replace(
    moduleBlockPattern,
    (_match, prefix, commentPath) => {
      const { map } = ensureTransformed(commentPath);
      patched += 1;
      return `${prefix}${JSON.stringify(map)};`;
    },
  );

  fs.writeFileSync(filePath, source);
  return patched;
}

let totalPatched = 0;
for (const bundleFile of jsBundles) {
  totalPatched += patchJsBundle(bundleFile);
}

// Rebuild dist/index.css from the scoped per-file output so that every class
// name in the stylesheet matches the JS class map and is unique per component.
if (orderedRelPaths.length > 0) {
  const sections = orderedRelPaths.map((relPath) => {
    const { css } = cssResultByRel.get(relPath);
    return `/* ${relPath} */\n${css.trim()}\n`;
  });
  fs.writeFileSync(cssBundle, sections.join("\n"));
}

console.log(
  `Patched ${totalPatched} CSS module export(s) and regenerated ${orderedRelPaths.length} CSS section(s).`,
);
