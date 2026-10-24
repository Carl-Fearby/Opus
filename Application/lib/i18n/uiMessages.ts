import type { Locale } from "./index";
import { uiMessagesAr } from "./uiMessages.ar";
import { uiMessagesBn } from "./uiMessages.bn";
import { uiMessagesCs } from "./uiMessages.cs";
import { uiMessagesEs } from "./uiMessages.es";
import { uiMessagesFr } from "./uiMessages.fr";
import { uiMessagesHi } from "./uiMessages.hi";
import { uiMessagesPt } from "./uiMessages.pt";
import { uiMessagesRu } from "./uiMessages.ru";
import { uiMessagesSk } from "./uiMessages.sk";
import { uiMessagesUr } from "./uiMessages.ur";
import { uiMessagesZh } from "./uiMessages.zh";

export const uiMessages: Partial<Record<Locale, Record<string, string>>> = {
  ar: uiMessagesAr,
  bn: uiMessagesBn,
  cs: uiMessagesCs,
  es: uiMessagesEs,
  fr: uiMessagesFr,
  hi: uiMessagesHi,
  pt: uiMessagesPt,
  ru: uiMessagesRu,
  sk: uiMessagesSk,
  ur: uiMessagesUr,
  zh: uiMessagesZh,
};
