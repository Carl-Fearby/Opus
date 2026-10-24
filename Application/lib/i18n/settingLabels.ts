import { settingLabelsEs } from "./settingLabels.es";
import { settingLabelsPt } from "./settingLabels.pt";
import { settingLabelsRu } from "./settingLabels.ru";
import { settingLabelsHi } from "./settingLabels.hi";
import { settingLabelsBn } from "./settingLabels.bn";
import { settingLabelsZh } from "./settingLabels.zh";
import { settingLabelsAr } from "./settingLabels.ar";
import { settingLabelsUr } from "./settingLabels.ur";
import type { Locale } from "./index";
import { settingLabelsFr } from "./settingLabels.fr";
import { settingLabelsCs } from "./settingLabels.cs";
import { settingLabelsSk } from "./settingLabels.sk";

export const settingLabels: Record<Locale, Record<string, string>> = {
  en: {},
  fr: settingLabelsFr,
  cs: settingLabelsCs,
  sk: settingLabelsSk,
  es: settingLabelsEs,
  pt: settingLabelsPt,
  ru: settingLabelsRu,
  hi: settingLabelsHi,
  bn: settingLabelsBn,
  zh: settingLabelsZh,
  ar: settingLabelsAr,
  ur: settingLabelsUr,
};

export function localizeSettingLabel(locale: Locale, label: string) {
  return settingLabels[locale]?.[label] ?? label;
}
