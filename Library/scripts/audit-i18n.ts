#!/usr/bin/env tsx
/**
 * Translation audit for Opus.
 *
 *   npm run audit:i18n          # print the summary
 *   npm run audit:i18n -- --write-report   # also write scripts/TRANSLATION_AUDIT.md
 *   npm run audit:i18n -- --strict         # exit 1 when gaps exist (CI)
 *
 * Reports four things:
 *   A. Keys components resolve through `t()` that no locale translates.
 *   B. Dictionaries that have drifted from the English key set.
 *   C. User-visible English literals in library components that never reach `t()`.
 *   D. Dates/times formatted with a hardcoded English locale.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { locales, type Locale } from "../lib/i18n/config";
import { componentMessages } from "../lib/i18n/componentMessages";
import { componentUiMessagesEn } from "../lib/i18n/componentUiMessages.en";
import {
  opusTranslationManifest,
  opusTranslationKeys,
} from "../packages/opus-react/src/i18nManifest";

const root = process.cwd();
const args = process.argv.slice(2);
const writeReport = args.includes("--write-report");
const strict = args.includes("--strict");

/** Surfaces that belong to the documentation app rather than the npm package. */
const DOCS_SURFACES = [
  join("components", "documentation"),
  join("components", "development"),
  join("components", "control-detail"),
];

/** Literals that are names, units or technical tokens rather than prose. */
const ALLOWED_LITERALS = new Set([
  "Opus", "Opus UI", "API", "JSON", "CSV", "URL", "SVG", "PNG", "JPG", "PDF", "HTML", "CSS",
  "ID", "OK", "KB", "MB", "GB", "ms", "px", "em", "%", "AM", "PM", "UTC", "GMT",
  "Enter", "Escape", "Tab", "Shift", "Ctrl", "Cmd", "Alt", "Backspace", "Delete",
]);

/** TypeScript type names the JSX-text regex mistakes for prose (`Promise<T>`). */
const TYPE_NAMES = new Set([
  "Promise", "Array", "Partial", "Number", "String", "Boolean", "Record", "Map", "Set",
  "Date", "ReactNode", "Element", "Node", "Function", "Object", "Readonly", "Pick", "Omit",
]);

/** True when the `>` before a JSX-text match closes an element rather than a type. */
function closesElement(source: string, index: number) {
  const before = source[index - 1];
  return before === ">" || before === '"' || before === "'";
}

type FileInfo = {
  path: string;
  relative: string;
  source: string;
  docs: boolean;
  /** Resolves `t` from the site's English-only provider rather than OpusI18n. */
  englishOnly: boolean;
};

function walk(dir: string, files: FileInfo[] = []): FileInfo[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, files);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name)) continue;
    if (/\.(test|stories)\.tsx?$/.test(entry.name) || entry.name.endsWith(".d.ts")) continue;
    const relativePath = relative(root, full);
    const source = readFileSync(full, "utf8");
    files.push({
      path: full,
      relative: relativePath,
      source,
      docs: DOCS_SURFACES.some((surface) => relativePath.startsWith(surface)),
      englishOnly: /\buseLocale\s*\(/.test(source) && !/useOpus(?:I18n|Translation)/.test(source),
    });
  }
  return files;
}

const CALL_SITE = /\bt\(\s*(["'])([A-Za-z][\w-]*(?:\.[\w-]+)+)\1/g;
const ATTRIBUTE = /\b(aria-label|placeholder|title|alt|tooltip|emptyMessage|loadingMessage)\s*=\s*"([^"]{2,})"/g;
const JSX_TEXT = />\s*([A-Z][A-Za-z][^<>{}]{1,60}?)\s*</g;
const EN_FORMAT = /toLocale(?:Date|Time)?String\(\s*"(en[^"]*)"/g;

const packageFiles = walk(join(root, "components"));
const englishOnlyFiles = new Set(
  packageFiles.filter((file) => file.englishOnly).map((file) => file.relative),
);

const callSites = new Map<string, Set<string>>();
for (const file of packageFiles) {
  for (const match of file.source.matchAll(CALL_SITE)) {
    if (!callSites.has(match[2])) callSites.set(match[2], new Set());
    callSites.get(match[2])!.add(file.relative);
  }
}

/** True when every call site renders through the documentation's English-only provider. */
const isEnglishOnlyKey = (key: string) => {
  const files = [...(callSites.get(key) ?? [])];
  return files.length > 0 && files.every((file) => englishOnlyFiles.has(file));
};

const isDocsKey = (key: string) =>
  [...(callSites.get(key) ?? [])].every((file) =>
    DOCS_SURFACES.some((surface) => file.startsWith(surface)),
  );

// A. Keys the components resolve but no dictionary translates.
const untranslated = opusTranslationKeys
  .filter((key) => !opusTranslationManifest[key]?.shipped)
  .map((key) => ({
    key,
    fallback: opusTranslationManifest[key]?.fallback ?? "",
    files: [...(callSites.get(key) ?? [])],
    docs: isDocsKey(key),
    englishOnly: isEnglishOnlyKey(key),
  }))
  .sort((left, right) => left.key.localeCompare(right.key));

// B. Dictionaries missing keys that English defines.
const drifted = locales
  .map(({ id }) => {
    const dictionary = componentMessages[id as Locale] ?? {};
    return {
      locale: id,
      missing: Object.keys(componentUiMessagesEn).filter((key) => !dictionary[key]),
    };
  })
  .filter((entry) => entry.missing.length > 0);

// C. English literals never passing through t().
const literals: { file: string; kind: string; text: string }[] = [];
for (const file of packageFiles) {
  if (file.docs) continue;
  for (const match of file.source.matchAll(ATTRIBUTE)) {
    const text = match[2].trim();
    if (ALLOWED_LITERALS.has(text)) continue;
    if (!/[A-Za-z]{2}/.test(text) || !/^[A-Z]/.test(text)) continue;
    literals.push({ file: file.relative, kind: match[1], text });
  }
  for (const match of file.source.matchAll(JSX_TEXT)) {
    if (!closesElement(file.source, match.index)) continue;
    const text = match[1].replace(/\s+/g, " ").trim();
    if (ALLOWED_LITERALS.has(text) || TYPE_NAMES.has(text)) continue;
    if (/[();=]|\.\w+\(|Math\.|Boolean\(/.test(text)) continue;
    if (!/\s/.test(text) && text.length < 4) continue;
    if (/^[a-z]/.test(text)) continue;
    literals.push({ file: file.relative, kind: "jsx", text });
  }
}

// D. Hardcoded English date formatting.
const formatting: { file: string; locale: string }[] = [];
for (const file of packageFiles) {
  for (const match of file.source.matchAll(EN_FORMAT)) {
    formatting.push({ file: file.relative, locale: match[1] });
  }
}

const literalFiles = new Map<string, string[]>();
for (const item of literals) {
  if (!literalFiles.has(item.file)) literalFiles.set(item.file, []);
  literalFiles.get(item.file)!.push(`${item.kind}: “${item.text}”`);
}

const docsUntranslated = untranslated.filter((entry) => entry.docs && !entry.englishOnly);
const intentionalUntranslated = untranslated.filter((entry) => entry.englishOnly);
const packageUntranslated = untranslated.filter((entry) => !entry.docs);
const summary = {
  locales: locales.length,
  translatedKeys: opusTranslationKeys.length - untranslated.length,
  totalKeys: opusTranslationKeys.length,
  untranslated: untranslated.length,
  docsUntranslated: docsUntranslated.length,
  intentionalUntranslated: intentionalUntranslated.length,
  packageUntranslated: packageUntranslated.length,
  driftedLocales: drifted.length,
  literals: literals.length,
  literalFiles: literalFiles.size,
  formatting: formatting.length,
};

console.log("Translation audit");
console.log("=================");
console.log(`Locales: ${summary.locales}`);  console.log(
    `Keys: ${summary.translatedKeys}/${summary.totalKeys} translated, ${summary.untranslated} untranslated (${summary.packageUntranslated} package, ${summary.docsUntranslated} docs via OpusI18n, ${intentionalUntranslated.length} docs English-only by design)`,
  );
console.log(`Dictionaries missing English keys: ${summary.driftedLocales} locale(s)`);
console.log(`Hardcoded English literals: ${summary.literals} in ${summary.literalFiles} file(s)`);
console.log(`Hardcoded English date/time formatting: ${summary.formatting} call site(s)`);

if (untranslated.length > 0) {
  console.log("\nA. Keys with no translation (English fallback everywhere)");
  for (const entry of untranslated) {
    const surface = entry.englishOnly ? "[docs/en-only]" : entry.docs ? "[docs]" : "[pkg]";
    console.log(`  ${surface.padEnd(15)} ${entry.key} — “${entry.fallback}”`);
  }
}

if (drifted.length > 0) {
  console.log("\nB. Dictionaries missing English keys");
  for (const entry of drifted) {
    console.log(`  ${entry.locale}: ${entry.missing.length} missing (${entry.missing.slice(0, 4).join(", ")}${entry.missing.length > 4 ? "…" : ""})`);
  }
}

if (literalFiles.size > 0) {
  console.log("\nC. Hardcoded English literals (needs review, not all are prose)");
  for (const [file, items] of [...literalFiles].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${file} (${items.length})`);
    for (const item of items.slice(0, 5)) console.log(`      ${item}`);
  }
}

if (formatting.length > 0) {
  console.log("\nD. Hardcoded English date/time formatting");
  for (const item of formatting) console.log(`  ${item.file} → ${item.locale}`);
}

if (writeReport) {
  const lines = [
    "# Translation audit",
    "",
    `Generated by \`npm run audit:i18n\` on ${new Date().toISOString().slice(0, 10)}.`,
    "",
    "## Summary",
    "",
    `- **${summary.locales} locales** ship dictionaries.`,
    `- **${summary.translatedKeys}/${summary.totalKeys} keys translated.** ${summary.packageUntranslated} untranslated in the published package, ${summary.docsUntranslated} in the documentation app that render through OpusI18n.`,
    `- **${summary.driftedLocales} locale(s)** are missing keys English defines.`,
    `- **${summary.literals} English literals** in ${summary.literalFiles} library component file(s) never pass through \`t()\`.`,
    `- **${summary.formatting} hardcoded English date/time format(s).**`,
    "",
    "## A. Keys with no translation",
    "",
    "These resolve to their English fallback in every language.",
    "",
    "| Surface | Key | English fallback |",
    "| --- | --- | --- |",
    ...untranslated.map(
      (entry) =>
        `| ${entry.englishOnly ? "docs (English-only)" : entry.docs ? "docs" : "package"} | \`${entry.key}\` | ${entry.fallback.replace(/\|/g, "\\|")} |`,
    ),
    "",
    `${summary.intentionalUntranslated} of those belong to the documentation shell, which the site intentionally keeps in English (\`lib/i18n/index.ts\`).`,
    "",
    "## B. Dictionaries missing English keys",
    "",
    drifted.length === 0
      ? "None — every locale defines every key the English dictionary does."
      : drifted.map((entry) => `- **${entry.locale}**: ${entry.missing.join(", ")}`).join("\n"),
    "",
    "## C. Hardcoded English literals in library components",
    "",
    "Heuristic scan of JSX text and `aria-label`/`placeholder`/`title`/`alt` props. Review each: names, units and keyboard keys are expected to stay.",
    "",
    ...[...literalFiles]
      .sort((a, b) => b[1].length - a[1].length)
      .map(([file, items]) => `- \`${file}\` (${items.length})\n${items.map((item) => `  - ${item}`).join("\n")}`),
    "",
    "## D. Hardcoded English date/time formatting",
    "",
    formatting.length === 0
      ? "None."
      : formatting.map((item) => `- \`${item.file}\` formats with \`${item.locale}\`.`).join("\n"),
    "",
  ];
  const reportPath = join(root, "scripts", "TRANSLATION_AUDIT.md");
  writeFileSync(reportPath, `${lines.join("\n")}\n`);
  console.log(`\nReport written to ${relative(root, reportPath)}`);
}

if (
  strict &&
  (summary.packageUntranslated > 0 || summary.docsUntranslated > 0 || drifted.length > 0 || formatting.length > 0)
) {
  process.exitCode = 1;
}
