"use client";

import { useLocale } from "./LocaleProvider";

export function useComponentDocumentation() {
  const { locale } = useLocale();
  return (slug: string, fallback: string) => fallback || slug || locale;
}
