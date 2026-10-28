"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useId, useMemo } from "react";
import {
  normalizeLocaleOptions,
  useOpusI18n,
  type OpusLocale,
  type OpusLocaleInput,
  type OpusLocaleOption,
} from "@/components/OpusI18n";
import styles from "./LanguagePicker.module.css";

/** Language name in the active language, falling back to the locale code. */
function formatLocaleLabel(option: OpusLocaleOption, locale: OpusLocale) {
  if (option.label) return option.label;

  try {
    const names = new Intl.DisplayNames([locale], { type: "language" });
    const name = names.of(option.id);
    if (!name) return option.id;
    return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
  } catch {
    return option.id;
  }
}

/** Orders choices by their label in the active language. */
function sortLocaleOptions(options: readonly OpusLocaleOption[], locale: OpusLocale) {
  try {
    const collator = new Intl.Collator(locale, { sensitivity: "base" });
    return [...options].sort((left, right) =>
      collator.compare(formatLocaleLabel(left, locale), formatLocaleLabel(right, locale)),
    );
  } catch {
    return [...options];
  }
}

export type LanguagePickerProps = {
  compact?: boolean;
  /** Locales to offer. Defaults to the provider's `availableLocales`. */
  availableLocales?: readonly OpusLocaleInput[];
  /** Controlled value. Defaults to the provider's locale. */
  locale?: OpusLocale;
  /** Called with the chosen locale. Defaults to the provider's `onLocaleChange`. */
  onLocaleChange?: (locale: OpusLocale) => void;
  /** Accessible label. Defaults to the `language.label` message, then "Language". */
  label?: string;
  id?: string;
};

export function LanguagePicker({
  compact = false,
  availableLocales,
  locale: localeProp,
  onLocaleChange,
  label: labelProp,
  id: idProp,
}: LanguagePickerProps) {
  const {
    availableLocales: providerLocales,
    locale: providerLocale,
    onLocaleChange: providerOnLocaleChange,
    t,
  } = useOpusI18n();
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const locale = localeProp ?? providerLocale;
  const options = useMemo(() => {
    const normalized = normalizeLocaleOptions(availableLocales ?? providerLocales);
    // Keep the control usable when neither the host nor a provider offers a list.
    return normalized.length ? normalized : [{ id: locale }];
  }, [availableLocales, providerLocales, locale]);
  const sortedOptions = useMemo(
    () => sortLocaleOptions(options, locale),
    [options, locale],
  );

  const label = labelProp ?? t("language.label", "Language");
  const changeLocale = onLocaleChange ?? providerOnLocaleChange;

  return (
    <label
      className={[styles.control, compact ? styles.compact : ""].filter(Boolean).join(" ")}
      htmlFor={id}
    >
      <FontAwesomeIcon aria-hidden="true" className={styles.icon} icon={faGlobe} />
      <span className={styles.srOnly}>{label}</span>
      <select
        aria-label={label}
        className={styles.select}
        id={id}
        onChange={(event) => changeLocale?.(event.target.value)}
        value={locale}
      >
        {sortedOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.flag ? `${option.flag} ` : ""}
            {formatLocaleLabel(option, locale)}
          </option>
        ))}
      </select>
    </label>
  );
}
