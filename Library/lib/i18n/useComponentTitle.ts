"use client";

import { useLocale } from "./LocaleProvider";
import { localizeComponentTitle } from "./componentTitles";

export function useComponentTitle() {
  const { locale } = useLocale();
  return (slug: string, fallback: string) =>
    localizeComponentTitle(locale, slug, fallback);
}
