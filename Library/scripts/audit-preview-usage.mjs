#!/usr/bin/env node
/**
 * Audits catalog preview vs usage-code alignment.
 * Flags preview-only settings, extra preview wrappers, and special demo branches.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

function extractSwitchCases(source, switchName) {
  const cases = new Set();
  const switchPattern = new RegExp(`switch\\s*\\(\\s*${switchName}\\s*\\)\\s*\\{`, "g");
  const match = switchPattern.exec(source);
  if (!match) {
    return cases;
  }

  let depth = 1;
  let index = match.index + match[0].length;
  while (index < source.length && depth > 0) {
    const slice = source.slice(index);
    const caseMatch = slice.match(/^[\s\S]*?case\s+"([^"]+)":/);
    if (!caseMatch) {
      break;
    }
    cases.add(caseMatch[1]);
    index += caseMatch[0].length;
    const next = source.slice(index);
    const close = next.search(/\bcase\s+"|default:/);
    const chunk = close === -1 ? next : next.slice(0, close);
    index += close === -1 ? next.length : close;
    if (chunk.includes("{")) {
      depth += (chunk.match(/\{/g) ?? []).length;
    }
    if (chunk.includes("}")) {
      depth -= (chunk.match(/\}/g) ?? []).length;
    }
  }

  return cases;
}

function extractCaseBlocks(source, switchName) {
  const blocks = new Map();
  const switchRe = new RegExp(`switch\\s*\\(\\s*${switchName}\\s*\\)\\s*\\{([\\s\\S]*?)\\n\\s*default:`);
  const switchBody = source.match(switchRe)?.[1] ?? "";
  const caseRe = /case\s+"([^"]+)":\s*\{([\s\S]*?)(?=\n\s*case\s+"|\n\s*default:)/g;
  let match;
  while ((match = caseRe.exec(switchBody))) {
    blocks.set(match[1], match[2]);
  }
  return blocks;
}

const typesSource = read("lib/controls/types.ts");
const previewSource = read("components/control-detail/ControlDetail/ControlPreview.tsx");
const usageSource = read("lib/controls/generateUsageCode.ts");

const previewCases = extractSwitchCases(previewSource, "slug");
const usageCases = extractSwitchCases(usageSource, "slug");

const missingPreview = [...usageCases].filter((slug) => !previewCases.has(slug)).sort();
const missingUsage = [...previewCases].filter((slug) => !usageCases.has(slug)).sort();

const previewOnlySettings = [...typesSource.matchAll(/(\w+):\s*boolean;/g)]
  .map((match) => match[1])
  .filter((name) => /Demo|Toolbar|PreviewOnly/i.test(name));

const previewBlocks = extractCaseBlocks(previewSource, "slug");

const flagged = [];
for (const [slug, block] of previewBlocks) {
  const issues = [];
  if (/showToolbarDemo|Toolbar demo|iconBadgeToolbar/.test(block)) {
    issues.push("toolbar demo branch");
  }
  if (/case\s+"note-composer"[\s\S]*DashboardContentContainer/.test(block) || (slug === "note-composer" && block.includes("DashboardContentContainer"))) {
    issues.push("note-composer wrapped in DashboardContentContainer (usage is bare NoteComposer)");
  }
  if (/PreviewDemo/.test(block) && !/dialog|drawer|modal|popover|dropdown-menu|context-menu|command-palette|toast|top-navigation/.test(slug)) {
    issues.push("uses PreviewDemo helper outside overlay/nav category");
  }
  if (issues.length) {
    flagged.push({ slug, issues });
  }
}

const previewDemoHelpers = [...previewSource.matchAll(/function\s+(\w+PreviewDemo)/g)].map((m) => m[1]);

console.log("Preview / usage audit\n========================\n");
console.log(`Preview cases: ${previewCases.size}`);
console.log(`Usage cases:   ${usageCases.size}\n`);

if (missingPreview.length) {
  console.log("Missing preview case:");
  for (const slug of missingPreview) console.log(`  - ${slug}`);
  console.log();
}

if (missingUsage.length) {
  console.log("Missing usage case:");
  for (const slug of missingUsage) console.log(`  - ${slug}`);
  console.log();
}

if (previewOnlySettings.length) {
  console.log("Preview-only boolean settings in types.ts:");
  for (const name of previewOnlySettings) console.log(`  - ${name}`);
  console.log();
}

if (flagged.length) {
  console.log("Flagged preview mismatches:");
  for (const entry of flagged) {
    console.log(`  - ${entry.slug}: ${entry.issues.join(", ")}`);
  }
  console.log();
} else {
  console.log("No flagged preview mismatches.\n");
}

console.log("PreviewDemo helpers (overlay/nav — expected):");
for (const name of previewDemoHelpers) console.log(`  - ${name}`);
