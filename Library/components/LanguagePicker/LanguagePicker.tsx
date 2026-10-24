"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { useId } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { languageLabel, sortedLocales, type Locale } from "@/lib/i18n/config";
import styles from "./LanguagePicker.module.css";

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();
  const id = useId();
  const label = t("language.label");

  return (
    <label className={[styles.control, compact ? styles.compact : ""].filter(Boolean).join(" ")} htmlFor={id}>
      <FontAwesomeIcon aria-hidden="true" className={styles.icon} icon={faGlobe} />
      <span className={styles.srOnly}>{label}</span>
      <select
        aria-label={label}
        className={styles.select}
        id={id}
        onChange={(event) => setLocale(event.target.value as Locale)}
        value={locale}
      >
        {sortedLocales(locale).map((entry) => (
          <option key={entry.id} value={entry.id}>
            {entry.flag} {languageLabel(locale, entry.id)}
          </option>
        ))}
      </select>
    </label>
  );
}
