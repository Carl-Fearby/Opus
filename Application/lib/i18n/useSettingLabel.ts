"use client";

import { useLocale } from "./LocaleProvider";
import { localizeSettingLabel } from "./settingLabels";

export function useSettingLabel() {
  const { locale } = useLocale();
  return (label: string) => localizeSettingLabel(locale, label);
}
