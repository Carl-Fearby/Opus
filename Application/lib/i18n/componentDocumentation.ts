import type { Locale } from "./index";
import { componentDocumentationFr } from "./componentDocumentation.fr";
import { componentDocumentationCs } from "./componentDocumentation.cs";
import { componentDocumentationSk } from "./componentDocumentation.sk";

export const componentDocumentation: Record<Locale, Record<string, string>> = {
  en: {},
  fr: componentDocumentationFr,
  cs: componentDocumentationCs,
  sk: componentDocumentationSk,
};

export function localizeComponentDocumentation(
  locale: Locale,
  slug: string,
  fallback: string,
) {
  return componentDocumentation[locale]?.[slug] ?? fallback;
}
