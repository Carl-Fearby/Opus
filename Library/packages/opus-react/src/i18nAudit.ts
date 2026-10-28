import {
  opusDynamicTranslationPrefixes,
  opusTranslationManifest,
  opusTranslatedKeys,
} from "./i18nManifest";

export type OpusTranslationAudit = {
  /** Keys with built-in translations that this dictionary leaves untranslated. */
  missing: string[];
  /** Keys the library resolves that ship no built-in translation (optional to translate). */
  optional: string[];
  /** Keys the library no longer resolves, usually left behind by an upgrade. */
  unknown: string[];
  /** English copy that no longer matches the shipped fallback. */
  drifted: string[];
};

/** True for keys under a namespace the library assembles at runtime. */
function isRuntimeKey(key: string) {
  return opusDynamicTranslationPrefixes.some((prefix) => key.startsWith(prefix));
}

/**
 * Compares a host dictionary against the keys this version of the library
 * resolves, so an application can spot translations that an upgrade added,
 * removed or changed.
 */
export function auditOpusTranslations(
  messages: Readonly<Record<string, string | null | undefined>>,
  { english = false }: { english?: boolean } = {},
): OpusTranslationAudit {
  const translated: string[] = [];

  for (const [key, value] of Object.entries(messages)) {
    if (typeof value === "string" && value.trim() !== "") {
      translated.push(key);
    }
  }

  const present = new Set(translated);

  return {
    missing: opusTranslatedKeys.filter((key) => !present.has(key)),
    optional: Object.keys(opusTranslationManifest)
      .filter(
        (key) => !opusTranslationManifest[key]?.shipped && !present.has(key) && !isRuntimeKey(key),
      )
      .sort(),
    unknown: translated
      .filter((key) => !(key in opusTranslationManifest) && !isRuntimeKey(key))
      .sort(),
    drifted: english
      ? translated
          .filter((key) => {
            const fallback = opusTranslationManifest[key]?.fallback;
            const value = messages[key];
            return (
              typeof fallback === "string" &&
              typeof value === "string" &&
              value.trim() !== fallback.trim()
            );
          })
          .sort()
      : [],
  };
}

/** A short, printable summary of an audit. */
export function formatOpusTranslationAudit(report: OpusTranslationAudit, label = "dictionary") {
  const lines = [
    `${label}: ${report.missing.length} missing, ${report.unknown.length} unknown, ${report.drifted.length} drifted, ${report.optional.length} optional`,
  ];

  const section = (title: string, keys: readonly string[], hint: string) => {
    if (keys.length === 0) return;
    lines.push(`  ${title} (${keys.length}) — ${hint}`);
    for (const key of keys.slice(0, 12)) {
      lines.push(`    ${key}`);
    }
    if (keys.length > 12) {
      lines.push(`    … ${keys.length - 12} more`);
    }
  };

  section("missing", report.missing, "add these to cover the built-in surface");
  section("unknown", report.unknown, "no longer resolved by this version of the library");
  section("drifted", report.drifted, "English copy changed; review the translation");
  section("optional", report.optional, "resolved keys with no built-in translation");

  return lines.join("\n");
}
