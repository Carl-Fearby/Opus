"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { OpusI18nProvider } from "@/components/OpusI18n";
import { componentMessages } from "./componentMessages";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  localeHtmlLang,
  parseLocale,
  translate,
  type Locale,
  type MessageKey,
} from "./index";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  t: (key, params) => translate(DEFAULT_LOCALE, key, params),
});

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(parseLocale(initialLocale));

  useEffect(() => {
    setLocaleState(parseLocale(initialLocale));
  }, [initialLocale]);

  const setLocale = useCallback(
    (next: Locale) => {
      const parsed = parseLocale(next);
      setLocaleState(parsed);
      if (typeof document !== "undefined") {
        document.documentElement.lang = localeHtmlLang(parsed);
      }
      try {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, parsed);
      } catch {
        // Storage can be unavailable in privacy modes.
      }
      document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(parsed)}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => translate(locale, key, params),
    }),
    [locale, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <OpusI18nProvider locale={locale} messages={componentMessages[locale]}>
        {children}
      </OpusI18nProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
