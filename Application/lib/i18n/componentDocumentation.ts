import { componentDocumentationEs } from "./componentDocumentation.es";
import { componentDocumentationPt } from "./componentDocumentation.pt";
import { componentDocumentationRu } from "./componentDocumentation.ru";
import { componentDocumentationHi } from "./componentDocumentation.hi";
import { componentDocumentationBn } from "./componentDocumentation.bn";
import { componentDocumentationZh } from "./componentDocumentation.zh";
import { componentDocumentationAr } from "./componentDocumentation.ar";
import { componentDocumentationUr } from "./componentDocumentation.ur";
import type { Locale } from "./index";
import { componentDocumentationFr } from "./componentDocumentation.fr";
import { componentDocumentationCs } from "./componentDocumentation.cs";
import { componentDocumentationSk } from "./componentDocumentation.sk";

export const componentDocumentation: Record<Locale, Record<string, string>> = {
  en: {},
  fr: componentDocumentationFr,
  cs: componentDocumentationCs,
  sk: componentDocumentationSk,
  es: componentDocumentationEs,
  pt: componentDocumentationPt,
  ru: componentDocumentationRu,
  hi: componentDocumentationHi,
  bn: componentDocumentationBn,
  zh: componentDocumentationZh,
  ar: componentDocumentationAr,
  ur: componentDocumentationUr,
};

export function localizeComponentDocumentation(
  locale: Locale,
  slug: string,
  fallback: string,
) {
  return componentDocumentation[locale]?.[slug] ?? fallback;
}
