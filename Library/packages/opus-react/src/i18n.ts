import { componentMessages } from "../../../lib/i18n/componentMessages";
import { locales, type Locale } from "../../../lib/i18n/config";
import type { OpusMessages } from "../../../components/OpusI18n";

export * from "./i18nManifest";
export * from "./i18nAudit";

export type OpusTranslationLocale = Locale;

/** Locale codes with shipped component translations, e.g. "fr", "ja", "ar". */
export const opusTranslationLocales: readonly Locale[] = locales.map((locale) => locale.id);

/** Built-in component translations, keyed by locale. Pass one to `OpusI18nProvider`. */
export const opusTranslations: Record<Locale, OpusMessages> = componentMessages;

export function getOpusTranslations(locale: Locale): OpusMessages {
  return opusTranslations[locale] ?? {};
}
