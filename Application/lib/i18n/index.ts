import { en } from "./englishSiteMessages";
import type { Locale, MessageKey } from "./config";

export * from "./config";
export { en as englishSiteMessages } from "./englishSiteMessages";

/**
 * Site chrome, documentation and application surfaces are intentionally
 * English-only. Only component messages are localised.
 */
export function translate(
  _locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
) {
  const template = en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}
