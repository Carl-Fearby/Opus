import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(packageDir, "dist");
const flagsDistDir = path.join(distDir, "flags");
const brandAssetsDir = path.join(distDir, "assets");
const indexCssPath = path.join(distDir, "index.css");
const flagsCssPath = path.join(distDir, "flags.css");

function resolveFlagIconsDir() {
  const candidates = [
    path.join(packageDir, "node_modules/flag-icons"),
    path.join(packageDir, "..", "..", "node_modules/flag-icons"),
    path.join(packageDir, "..", "node_modules/flag-icons"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "flags", "4x3", "gb.svg"))) {
      return candidate;
    }
  }

  throw new Error("flag-icons package not found. Run npm install in the Library workspace.");
}

function copyDirectory(source, destination) {
  fs.cpSync(source, destination, { recursive: true });
}

function buildFlagCss(flagIconsDir) {
  const sourceCssPath = path.join(flagIconsDir, "css", "flag-icons.min.css");
  const sourceCss = fs.readFileSync(sourceCssPath, "utf8");

  return sourceCss.replaceAll("../flags/", "./flags/");
}

const flagIconsDir = resolveFlagIconsDir();
const flagCss = buildFlagCss(flagIconsDir);

fs.mkdirSync(distDir, { recursive: true });
copyDirectory(path.join(flagIconsDir, "flags"), flagsDistDir);
fs.mkdirSync(brandAssetsDir, { recursive: true });
fs.copyFileSync(path.join(packageDir, "..", "..", "public", "opus-logo.png"), path.join(brandAssetsDir, "opus-logo.png"));
fs.copyFileSync(path.join(packageDir, "..", "..", "public", "logo-small.png"), path.join(brandAssetsDir, "logo-small.png"));
fs.writeFileSync(flagsCssPath, flagCss);

const indexCss = fs.existsSync(indexCssPath) ? fs.readFileSync(indexCssPath, "utf8") : "";
const flagSection = `\n/* flag-icons (bundled for PhoneNumberField) */\n${flagCss.trim()}\n`;
const withoutExistingFlags = indexCss.replace(
  /\n\/\* flag-icons \(bundled for PhoneNumberField\) \*\/[\s\S]*$/,
  "",
);
const packagedCss = `${withoutExistingFlags.trimEnd()}${flagSection}`
  .replaceAll("../../public/opus-logo.png", "./assets/opus-logo.png")
  .replaceAll("../../public/logo-small.png", "./assets/logo-small.png");
fs.writeFileSync(indexCssPath, packagedCss);

console.log("Bundled flag-icons CSS and copied SVG assets into dist/flags.");
