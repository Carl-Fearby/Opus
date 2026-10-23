"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

export type OpusLocale = "en" | "fr" | "cs" | "sk" | (string & {});
export type OpusMessages = Record<string, string>;

type OpusI18nContextValue = {
  locale: OpusLocale;
  messages: OpusMessages;
  t: (
    key: string,
    fallback: string,
    params?: Record<string, string | number>,
  ) => string;
};

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}

const OpusI18nContext = createContext<OpusI18nContextValue>({
  locale: "en",
  messages: {},
  t: (_key, fallback, params) => interpolate(fallback, params),
});

export function OpusI18nProvider({
  children,
  locale = "en",
  messages = {},
}: {
  children: ReactNode;
  locale?: OpusLocale;
  messages?: OpusMessages;
}) {
  const value = useMemo<OpusI18nContextValue>(
    () => ({
      locale,
      messages,
      t: (key, fallback, params) =>
        interpolate(messages[key] ?? fallback, params),
    }),
    [locale, messages],
  );

  return <OpusI18nContext.Provider value={value}>{children}</OpusI18nContext.Provider>;
}

export function useOpusI18n() {
  return useContext(OpusI18nContext);
}
