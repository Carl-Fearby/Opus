import type { Locale } from "./index";

/**
 * Long-form component documentation is maintained in English only.
 * Keep the helper so callers do not need to branch on locale.
 */
export function localizeComponentDocumentation(
  _locale: Locale,
  _slug: string,
  fallback: string,
) {
  return fallback;
}
