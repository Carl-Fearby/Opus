import { en } from "./englishSiteMessages";

export const LOCALE_COOKIE = "opus-language";
export const LOCALE_STORAGE_KEY = "opus-language";

export const locales = [
  { id: "en", label: "English", htmlLang: "en-GB", flag: "🇬🇧" },
  { id: "zh", label: "中文（简体）", htmlLang: "zh-CN", flag: "🇨🇳" },
  { id: "hi", label: "हिन्दी", htmlLang: "hi-IN", flag: "🇮🇳" },
  { id: "es", label: "Español", htmlLang: "es-ES", flag: "🇪🇸" },
  { id: "fr", label: "Français", htmlLang: "fr-FR", flag: "🇫🇷" },
  { id: "ar", label: "العربية", htmlLang: "ar-SA", flag: "🇸🇦" },
  { id: "bn", label: "বাংলা", htmlLang: "bn-BD", flag: "🇧🇩" },
  { id: "pt", label: "Português", htmlLang: "pt-PT", flag: "🇵🇹" },
  { id: "ru", label: "Русский", htmlLang: "ru-RU", flag: "🇷🇺" },
  { id: "ur", label: "اردو", htmlLang: "ur-PK", flag: "🇵🇰" },
  { id: "cs", label: "Čeština", htmlLang: "cs-CZ", flag: "🇨🇿" },
  { id: "sk", label: "Slovenčina", htmlLang: "sk-SK", flag: "🇸🇰" },
  { id: "de", label: "Deutsch", htmlLang: "de-DE", flag: "🇩🇪" },
  { id: "ja", label: "日本語", htmlLang: "ja-JP", flag: "🇯🇵" },
  { id: "ko", label: "한국어", htmlLang: "ko-KR", flag: "🇰🇷" },
  { id: "it", label: "Italiano", htmlLang: "it-IT", flag: "🇮🇹" },
  { id: "nl", label: "Nederlands", htmlLang: "nl-NL", flag: "🇳🇱" },
  { id: "tr", label: "Türkçe", htmlLang: "tr-TR", flag: "🇹🇷" },
  { id: "pl", label: "Polski", htmlLang: "pl-PL", flag: "🇵🇱" },
  { id: "uk", label: "Українська", htmlLang: "uk-UA", flag: "🇺🇦" },
  { id: "vi", label: "Tiếng Việt", htmlLang: "vi-VN", flag: "🇻🇳" },
  { id: "th", label: "ไทย", htmlLang: "th-TH", flag: "🇹🇭" },
  { id: "id", label: "Bahasa Indonesia", htmlLang: "id-ID", flag: "🇮🇩" },
  { id: "he", label: "עברית", htmlLang: "he-IL", flag: "🇮🇱" },
  { id: "fa", label: "فارسی", htmlLang: "fa-IR", flag: "🇮🇷" },
  { id: "sw", label: "Kiswahili", htmlLang: "sw-KE", flag: "🇰🇪" },
  { id: "el", label: "Ελληνικά", htmlLang: "el-GR", flag: "🇬🇷" },
  { id: "ro", label: "Română", htmlLang: "ro-RO", flag: "🇷🇴" },
  { id: "hu", label: "Magyar", htmlLang: "hu-HU", flag: "🇭🇺" },
  { id: "sv", label: "Svenska", htmlLang: "sv-SE", flag: "🇸🇪" },
  { id: "no", label: "Norsk", htmlLang: "no-NO", flag: "🇳🇴" },
  { id: "da", label: "Dansk", htmlLang: "da-DK", flag: "🇩🇰" },
  { id: "fi", label: "Suomi", htmlLang: "fi-FI", flag: "🇫🇮" },
  { id: "bg", label: "Български", htmlLang: "bg-BG", flag: "🇧🇬" },
  { id: "sr", label: "Српски", htmlLang: "sr-RS", flag: "🇷🇸" },
  { id: "hr", label: "Hrvatski", htmlLang: "hr-HR", flag: "🇭🇷" },
  { id: "ms", label: "Bahasa Melayu", htmlLang: "ms-MY", flag: "🇲🇾" },
  { id: "fil", label: "Filipino", htmlLang: "fil-PH", flag: "🇵🇭" },
  { id: "ta", label: "தமிழ்", htmlLang: "ta-IN", flag: "🇮🇳" },
  { id: "te", label: "తెలుగు", htmlLang: "te-IN", flag: "🇮🇳" },
  { id: "mr", label: "मराठी", htmlLang: "mr-IN", flag: "🇮🇳" },
  { id: "gu", label: "ગુજરાતી", htmlLang: "gu-IN", flag: "🇮🇳" },
  { id: "pa", label: "ਪੰਜਾਬੀ", htmlLang: "pa-IN", flag: "🇮🇳" },
  { id: "ne", label: "नेपाली", htmlLang: "ne-NP", flag: "🇳🇵" },
  { id: "ka", label: "ქართული", htmlLang: "ka-GE", flag: "🇬🇪" },
  { id: "az", label: "Azərbaycanca", htmlLang: "az-AZ", flag: "🇦🇿" },
  { id: "kk", label: "Қазақша", htmlLang: "kk-KZ", flag: "🇰🇿" },
  { id: "uz", label: "Oʻzbekcha", htmlLang: "uz-UZ", flag: "🇺🇿" },
] as const;

export type Locale = (typeof locales)[number]["id"];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.some((locale) => locale.id === value);
}

export function parseLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localeHtmlLang(locale: Locale) {
  return locales.find((entry) => entry.id === locale)?.htmlLang ?? "en-GB";
}

const RTL_LOCALES = new Set<Locale>(["ar", "ur", "he", "fa"]);

export function isRtlLocale(locale: Locale) {
  return RTL_LOCALES.has(locale);
}

export function languageLabel(locale: Locale, target: Locale) {
  const fallback = locales.find((entry) => entry.id === target)?.label ?? target;

  try {
    const names = new Intl.DisplayNames([locale], { type: "language" });
    const name = names.of(target);
    if (!name) return fallback;
    return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
  } catch {
    return fallback;
  }
}

export function sortedLocales(locale: Locale) {
  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  return [...locales].sort((left, right) =>
    collator.compare(languageLabel(locale, left.id), languageLabel(locale, right.id)),
  );
}

export type MessageKey = keyof typeof en;

export function categoryMessageKey(category: string): MessageKey {
  const key = `docs.category.${category}` as MessageKey;
  return key in en ? key : "docs.components";
}

export function categoryDescriptionMessageKey(category: string): MessageKey {
  const key = `docs.category.${category}.description` as MessageKey;
  return key in en ? key : "docs.category.content.description";
}
