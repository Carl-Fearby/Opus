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
import { en } from "./englishSiteMessages";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  isRtlLocale,
  localeHtmlLang,
  locales,
  parseLocale,
  type Locale,
  type MessageKey,
} from "./config";
import type { LocaleResources } from "./resources";
import type { OpusLocale } from "@/components/OpusI18n";

/**
 * The site hands its own locale list to the picker, which owns no list of its
 * own. `country` makes the picker draw the same flag-icons SVGs the country
 * picker uses; `flag` stays as the emoji fallback.
 */
const LOCALE_OPTIONS = locales.map(({ id, flag, htmlLang, country }) => ({
  id,
  flag,
  htmlLang,
  country,
}));

type LocaleContextValue = {
  locale: Locale;
  resources: LocaleResources;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
};

const defaultResources: LocaleResources = {
  component: {},
};

function translateFrom(
  _resources: LocaleResources,
  key: MessageKey,
  params?: Record<string, string | number>,
) {
  const template = en[key] ?? key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  resources: defaultResources,
  setLocale: () => undefined,
  t: (key, params) => translateFrom(defaultResources, key, params),
});

export function LocaleProvider({
  children,
  initialLocale,
  initialResources,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialResources: LocaleResources;
}) {
  const router = useRouter();
  const [state, setState] = useState(() => ({
    locale: parseLocale(initialLocale),
    resources: initialResources,
  }));

  useEffect(() => {
    setState({
      locale: parseLocale(initialLocale),
      resources: initialResources,
    });
  }, [initialLocale, initialResources]);

  const setLocale = useCallback(
    (next: Locale) => {
      const parsed = parseLocale(next);
      if (parsed === state.locale) return;

      void (async () => {
        let resources = defaultResources;
        try {
          const response = await fetch(`/i18n/${parsed}.json`);
          if (response.ok) {
            resources = (await response.json()) as LocaleResources;
          }
        } catch {
          resources = defaultResources;
        }

        setState({ locale: parsed, resources });
        if (typeof document !== "undefined") {
          document.documentElement.lang = localeHtmlLang(parsed);
          document.documentElement.dir = isRtlLocale(parsed) ? "rtl" : "ltr";
        }
        try {
          window.localStorage.setItem(LOCALE_STORAGE_KEY, parsed);
        } catch {
          // Storage can be unavailable in privacy modes.
        }
        document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(parsed)}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
      })();
    },
    [router, state.locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale: state.locale,
      resources: state.resources,
      setLocale,
      t: (key, params) => translateFrom(state.resources, key, params),
    }),
    [setLocale, state.locale, state.resources],
  );

  const handleLocaleChange = useCallback(
    (next: OpusLocale) => setLocale(parseLocale(next)),
    [setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <OpusI18nProvider
        availableLocales={LOCALE_OPTIONS}
        locale={state.locale}
        messages={state.resources.component}
        onLocaleChange={handleLocaleChange}
      >
        {children}
      </OpusI18nProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
