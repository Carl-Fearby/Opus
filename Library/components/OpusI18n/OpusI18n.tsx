"use client";

import { createContext, useContext, useMemo, type Context, type ReactNode } from "react";

export type OpusLocale = "en" | "fr" | "cs" | "sk" | (string & {});
export type OpusMessages = Record<string, string>;

/** A locale offered to the provider or the language picker. */
export type OpusLocaleOption = {
  id: OpusLocale;
  /** Display name. Omit to derive one with `Intl.DisplayNames`. */
  label?: string;
  /** Optional emoji or icon shown before the label. */
  flag?: string;
  /** BCP 47 tag for the document, e.g. "fr-FR". */
  htmlLang?: string;
};

/** Either a bare locale code or a rich `OpusLocaleOption`. */
export type OpusLocaleInput = OpusLocale | OpusLocaleOption;

/**
 * Application-supplied resolver, so a host can translate with whatever engine
 * it already uses (i18next, next-intl, an API, a database). Return a string to
 * use it, or `undefined`/`null`/an empty string to fall through to `messages`,
 * then to the English fallback shipped with the component.
 */
export type OpusTranslate = (
  key: string,
  params?: Record<string, string | number>,
) => string | null | undefined;

export type OpusI18nContextValue = {
  locale: OpusLocale;
  messages: OpusMessages;
  availableLocales: readonly OpusLocaleOption[];
  t: (
    key: string,
    fallback: string,
    params?: Record<string, string | number>,
  ) => string;
  translate?: OpusTranslate;
  onLocaleChange?: (locale: OpusLocale) => void;
};

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    name in params ? String(params[name]) : `{${name}}`,
  );
}

/** Accepts bare locale codes or rich options, de-duplicating by id. */
export function normalizeLocaleOptions(
  input?: readonly OpusLocaleInput[] | null,
): OpusLocaleOption[] {
  if (!input?.length) return [];

  const seen = new Set<OpusLocale>();
  const options: OpusLocaleOption[] = [];

  for (const entry of input) {
    const option = typeof entry === "string" ? { id: entry } : entry;
    if (!option?.id || seen.has(option.id)) continue;
    seen.add(option.id);
    options.push(option);
  }

  return options;
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
    availableLocales: [],
    t: (_key, fallback, params) => interpolate(fallback, params),
  });
contextRegistry.__opusI18nContext__ = OpusI18nContext;

export function OpusI18nProvider({
  children,
  locale = "en",
  messages = {},
  translate,
  onLocaleChange,
  availableLocales,
}: {
  children: ReactNode;
  locale?: OpusLocale;
  messages?: OpusMessages;
  /** Resolve keys with the host's own translation engine. */
  translate?: OpusTranslate;
  /** Called with the locale a picker selected. The host owns the state. */
  onLocaleChange?: (locale: OpusLocale) => void;
  /** Locales a picker may offer: bare codes or `{ id, label, flag, htmlLang }`. */
  availableLocales?: readonly OpusLocaleInput[];
}) {
  const localeOptions = useMemo(
    () => normalizeLocaleOptions(availableLocales),
    [availableLocales],
  );

  const value = useMemo<OpusI18nContextValue>(
    () => ({
      locale,
      messages,
      availableLocales: localeOptions,
      translate,
      onLocaleChange,
      t: (key, fallback, params) => {
        const injected = translate?.(key, params);
        if (typeof injected === "string" && injected.length > 0) {
          return interpolate(injected, params);
        }

        const message = messages[key];
        if (typeof message === "string" && message.length > 0) {
          return interpolate(message, params);
        }

        return interpolate(fallback, params);
      },
    }),
    [locale, messages, localeOptions, onLocaleChange, translate],
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
  if (
    typeof window !== "undefined" &&
    Object.keys(context.messages).length === 0 &&
    !context.translate
  ) {
    const published = contextRegistry.__opusI18nValue__;
    if (published) {
      return published;
    }
  }

  return context;
}

/** Alias for `useOpusI18n`, for hosts that read their translations through `t`. */
export function useOpusTranslation() {
  return useOpusI18n();
}
