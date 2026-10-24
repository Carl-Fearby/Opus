import type { Locale } from "./index";
import { settingLabelsFr } from "./settingLabels.fr";
import { settingLabelsCs } from "./settingLabels.cs";
import { settingLabelsSk } from "./settingLabels.sk";

export const settingLabels: Record<Locale, Record<string, string>> = {
  en: {},
  fr: settingLabelsFr,
  cs: settingLabelsCs,
  sk: settingLabelsSk,
};

export function localizeSettingLabel(locale: Locale, label: string) {
  return settingLabels[locale]?.[label] ?? label;
}
