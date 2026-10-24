"use client";

import { createContext, useContext, useMemo, type Context, type ReactNode } from "react";

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

// Site chrome and package components can be loaded from separate module
// instances. Share the context object through the realm so a provider in one
// copy is visible to `useOpusI18n` in every other copy.
const contextRegistry = globalThis as unknown as {
  __opusI18nContext__?: Context<OpusI18nContextValue>;
  __opusI18nValue__?: OpusI18nContextValue;
};
const OpusI18nContext =
  contextRegistry.__opusI18nContext__ ??
  createContext<OpusI18nContextValue>({
    locale: "en",
    messages: {},
    t: (_key, fallback, params) => interpolate(fallback, params),
  });
contextRegistry.__opusI18nContext__ = OpusI18nContext;

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

  if (typeof window !== "undefined") {
    contextRegistry.__opusI18nValue__ = value;
  }

  return <OpusI18nContext.Provider value={value}>{children}</OpusI18nContext.Provider>;
}

export function useOpusI18n() {
  const context = useContext(OpusI18nContext);

  // Package code and the documentation site can be bundled from separate
  // copies. Prefer the provider value published by either copy when the local
  // context is still the empty English default.
  if (typeof window !== "undefined" && context.messages && Object.keys(context.messages).length === 0) {
    const published = contextRegistry.__opusI18nValue__;
    if (published) {
      return published;
    }
  }

  return context;
}
