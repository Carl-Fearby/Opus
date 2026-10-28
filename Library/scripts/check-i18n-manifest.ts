import { readFileSync } from "node:fs";
import { basename, isAbsolute, join } from "node:path";
import { locales } from "../lib/i18n/config";
import {
  auditOpusTranslations,
  formatOpusTranslationAudit,
} from "../packages/opus-react/src/i18nAudit";

/**
 * Checks translation dictionaries against the keys this version of the library
 * resolves.
 *
 *   npm run check:i18n-manifest                      # this repo's 48 dictionaries
 *   npm run check:i18n-manifest -- src/locales/fr/opus.json [more files]
 *
 * Flags:
 *   --strict   treat keys the library no longer resolves as failures
 *   --english  check the fallback copy of the supplied files against the manifest
 */
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const english = args.includes("--english");
const paths = args.filter((arg) => !arg.startsWith("--"));
const resourcesDir = join(process.cwd(), "public", "i18n");

function readMessages(file: string): Record<string, string> {
  const parsed = JSON.parse(readFileSync(file, "utf8")) as {
    component?: Record<string, string>;
  };

  if (parsed?.component && typeof parsed.component === "object") {
    return parsed.component;
  }

  return (parsed as unknown as Record<string, string>) ?? {};
}

const targets =
  paths.length > 0
    ? paths.map((path) => ({
        label: basename(path),
        file: isAbsolute(path) ? path : join(process.cwd(), path),
        english,
      }))
    : locales.map(({ id }) => ({
        label: id,
        file: join(resourcesDir, `${id}.json`),
        english: id === "en",
      }));

let failures = 0;

for (const target of targets) {
  let messages: Record<string, string>;

  try {
    messages = readMessages(target.file);
  } catch (error) {
    console.error(
      `${target.label}: could not read ${target.file} — ${error instanceof Error ? error.message : String(error)}`,
    );
    failures += 1;
    continue;
  }

  const report = auditOpusTranslations(messages, { english: target.english });
  const problems =
    report.missing.length + report.drifted.length + (strict ? report.unknown.length : 0);

  if (problems === 0) {
    console.log(
      `${target.label}: ok — ${Object.keys(messages).length} keys${report.unknown.length ? `, ${report.unknown.length} unknown` : ""}`,
    );
    continue;
  }

  failures += 1;
  console.error(formatOpusTranslationAudit(report, target.label));
}

console.log(`\nChecked ${targets.length} dictionary file(s).`);

if (failures > 0) {
  console.error(
    `${failures} file(s) need attention${strict ? "" : " (run with --strict to fail on unknown keys)"}.`,
  );
  process.exit(1);
}

console.log("No missing or drifted keys.");
