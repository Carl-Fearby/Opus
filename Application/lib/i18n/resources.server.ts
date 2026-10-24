import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_LOCALE, type Locale } from "./config";
import type { LocaleResources } from "./resources";

const cache = new Map<Locale, LocaleResources>();

export function readLocaleResources(locale: Locale): LocaleResources {
  const cached = cache.get(locale);
  if (cached) return cached;

  try {
    const file = join(process.cwd(), "public", "i18n", `${locale}.json`);
    const resources = JSON.parse(readFileSync(file, "utf8")) as LocaleResources;
    const normalized: LocaleResources = { component: resources.component ?? {} };
    cache.set(locale, normalized);
    return normalized;
  } catch {
    if (locale !== DEFAULT_LOCALE) {
      return readLocaleResources(DEFAULT_LOCALE);
    }

    return { component: {} };
  }
}
