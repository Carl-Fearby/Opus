"use client";

import { useLocale } from "./LocaleProvider";
import { localizeComponentDescription } from "./componentDescriptions";

export function useComponentDescription() {
  const { locale } = useLocale();
  return (slug: string, fallback: string) =>
    localizeComponentDescription(locale, slug, fallback);
}
