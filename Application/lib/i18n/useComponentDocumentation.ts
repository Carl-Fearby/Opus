"use client";

import { useLocale } from "./LocaleProvider";
import { localizeComponentDocumentation } from "./componentDocumentation";

export function useComponentDocumentation() {
  const { locale } = useLocale();
  return (slug: string, fallback: string) =>
    localizeComponentDocumentation(locale, slug, fallback);
}
