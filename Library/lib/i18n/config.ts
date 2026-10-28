import { en } from "./englishSiteMessages";

export const LOCALE_COOKIE = "opus-language";
export const LOCALE_STORAGE_KEY = "opus-language";

export const locales = [
  { id: "en", label: "English", htmlLang: "en-GB", flag: "🇬🇧", country: "gb" },
  { id: "zh", label: "中文（简体）", htmlLang: "zh-CN", flag: "🇨🇳", country: "cn" },
  { id: "hi", label: "हिन्दी", htmlLang: "hi-IN", flag: "🇮🇳", country: "in" },
  { id: "es", label: "Español", htmlLang: "es-ES", flag: "🇪🇸", country: "es" },
  { id: "fr", label: "Français", htmlLang: "fr-FR", flag: "🇫🇷", country: "fr" },
  { id: "ar", label: "العربية", htmlLang: "ar-SA", flag: "🇸🇦", country: "sa" },
  { id: "bn", label: "বাংলা", htmlLang: "bn-BD", flag: "🇧🇩", country: "bd" },
  { id: "pt", label: "Português", htmlLang: "pt-PT", flag: "🇵🇹", country: "pt" },
  { id: "ru", label: "Русский", htmlLang: "ru-RU", flag: "🇷🇺", country: "ru" },
  { id: "ur", label: "اردو", htmlLang: "ur-PK", flag: "🇵🇰", country: "pk" },
  { id: "cs", label: "Čeština", htmlLang: "cs-CZ", flag: "🇨🇿", country: "cz" },
  { id: "sk", label: "Slovenčina", htmlLang: "sk-SK", flag: "🇸🇰", country: "sk" },
  { id: "de", label: "Deutsch", htmlLang: "de-DE", flag: "🇩🇪", country: "de" },
  { id: "ja", label: "日本語", htmlLang: "ja-JP", flag: "🇯🇵", country: "jp" },
  { id: "ko", label: "한국어", htmlLang: "ko-KR", flag: "🇰🇷", country: "kr" },
  { id: "it", label: "Italiano", htmlLang: "it-IT", flag: "🇮🇹", country: "it" },
  { id: "nl", label: "Nederlands", htmlLang: "nl-NL", flag: "🇳🇱", country: "nl" },
  { id: "tr", label: "Türkçe", htmlLang: "tr-TR", flag: "🇹🇷", country: "tr" },
  { id: "pl", label: "Polski", htmlLang: "pl-PL", flag: "🇵🇱", country: "pl" },
  { id: "uk", label: "Українська", htmlLang: "uk-UA", flag: "🇺🇦", country: "ua" },
  { id: "vi", label: "Tiếng Việt", htmlLang: "vi-VN", flag: "🇻🇳", country: "vn" },
  { id: "th", label: "ไทย", htmlLang: "th-TH", flag: "🇹🇭", country: "th" },
  { id: "id", label: "Bahasa Indonesia", htmlLang: "id-ID", flag: "🇮🇩", country: "id" },
  { id: "he", label: "עברית", htmlLang: "he-IL", flag: "🇮🇱", country: "il" },
  { id: "fa", label: "فارسی", htmlLang: "fa-IR", flag: "🇮🇷", country: "ir" },
  { id: "sw", label: "Kiswahili", htmlLang: "sw-KE", flag: "🇰🇪", country: "ke" },
  { id: "el", label: "Ελληνικά", htmlLang: "el-GR", flag: "🇬🇷", country: "gr" },
  { id: "ro", label: "Română", htmlLang: "ro-RO", flag: "🇷🇴", country: "ro" },
  { id: "hu", label: "Magyar", htmlLang: "hu-HU", flag: "🇭🇺", country: "hu" },
  { id: "sv", label: "Svenska", htmlLang: "sv-SE", flag: "🇸🇪", country: "se" },
  { id: "no", label: "Norsk", htmlLang: "no-NO", flag: "🇳🇴", country: "no" },
  { id: "da", label: "Dansk", htmlLang: "da-DK", flag: "🇩🇰", country: "dk" },
  { id: "fi", label: "Suomi", htmlLang: "fi-FI", flag: "🇫🇮", country: "fi" },
  { id: "bg", label: "Български", htmlLang: "bg-BG", flag: "🇧🇬", country: "bg" },
  { id: "sr", label: "Српски", htmlLang: "sr-RS", flag: "🇷🇸", country: "rs" },
  { id: "hr", label: "Hrvatski", htmlLang: "hr-HR", flag: "🇭🇷", country: "hr" },
  { id: "ms", label: "Bahasa Melayu", htmlLang: "ms-MY", flag: "🇲🇾", country: "my" },
  { id: "fil", label: "Filipino", htmlLang: "fil-PH", flag: "🇵🇭", country: "ph" },
  { id: "ta", label: "தமிழ்", htmlLang: "ta-IN", flag: "🇮🇳", country: "in" },
  { id: "te", label: "తెలుగు", htmlLang: "te-IN", flag: "🇮🇳", country: "in" },
  { id: "mr", label: "मराठी", htmlLang: "mr-IN", flag: "🇮🇳", country: "in" },
  { id: "gu", label: "ગુજરાતી", htmlLang: "gu-IN", flag: "🇮🇳", country: "in" },
  { id: "pa", label: "ਪੰਜਾਬੀ", htmlLang: "pa-IN", flag: "🇮🇳", country: "in" },
  { id: "ne", label: "नेपाली", htmlLang: "ne-NP", flag: "🇳🇵", country: "np" },
  { id: "ka", label: "ქართული", htmlLang: "ka-GE", flag: "🇬🇪", country: "ge" },
  { id: "az", label: "Azərbaycanca", htmlLang: "az-AZ", flag: "🇦🇿", country: "az" },
  { id: "kk", label: "Қазақша", htmlLang: "kk-KZ", flag: "🇰🇿", country: "kz" },
  { id: "uz", label: "Oʻzbekcha", htmlLang: "uz-UZ", flag: "🇺🇿", country: "uz" },
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
