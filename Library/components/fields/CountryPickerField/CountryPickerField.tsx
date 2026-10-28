"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./CountryPickerField.module.css";
import type { ControlRadius } from "../types";
import { countries as allCountries, type PhoneCountry } from "../PhoneNumberField/countries";

function flagClassName(code: string) {
  return `fi fi-${code.toLowerCase()}`;
}

/** Case and diacritic insensitive, so "curacao" finds "Curaçao". */
function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

type CountryPickerFieldProps = {
  radius?: ControlRadius;
  transparency?: import("../types").ControlTransparency;
  gradient?: boolean;
  countries?: PhoneCountry[];
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  placeholder?: string;
  required?: boolean;
  searchPlaceholder?: string;
  size?: InputControlSize;
  value: string;
  onChange: (countryCode: string) => void;
};

export function CountryPickerField({
  countries = allCountries,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  placeholder,
  required,
  searchPlaceholder,
  size = "md",
  value,
  onChange,
  radius,
  transparency,
  gradient,
}: CountryPickerFieldProps) {
  const { locale, t } = useOpusI18n();
  const displayPlaceholder = placeholder ?? t("field.selectCountry", "Select country…");
  const displaySearchPlaceholder = searchPlaceholder ?? t("field.searchCountriesPlaceholder", "Search countries…");
  const shellAria = useFieldShellAria();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const activeCountry = value ? countries.find((country) => country.code === value) : undefined;

  useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Country names follow the interface language the same way component labels do,
  // so a French page lists "Royaume-Uni" rather than "United Kingdom".
  const countryNames = useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      names = null;
    }

    const map = new Map<string, string>();
    for (const country of countries) {
      const localized = names?.of(country.code) ?? undefined;
      const name =
        localized && localized !== country.code
          ? localized.charAt(0).toLocaleUpperCase(locale) + localized.slice(1)
          : country.label;
      map.set(country.code, name);
    }

    return map;
  }, [countries, locale]);

  const nameOf = (country: PhoneCountry) => countryNames.get(country.code) ?? country.label;

  const sortedCountries = useMemo(() => {
    let collator: Intl.Collator | null = null;
    try {
      collator = new Intl.Collator(locale, { sensitivity: "base" });
    } catch {
      collator = null;
    }

    return [...countries].sort((left, right) => {
      const leftName = countryNames.get(left.code) ?? left.label;
      const rightName = countryNames.get(right.code) ?? right.label;
      return collator ? collator.compare(leftName, rightName) : leftName.localeCompare(rightName);
    });
  }, [countries, countryNames, locale]);

  // Search covers the displayed name, the English name, the code and the dial code,
  // so someone browsing in French can still find a country by typing "Netherlands".
  const filteredCountries = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) {
      return sortedCountries;
    }

    return sortedCountries.filter((country) =>
      fold(
        [
          countryNames.get(country.code) ?? country.label,
          country.label,
          country.code,
          country.dialCode,
        ].join(" "),
      ).includes(needle),
    );
  }, [countryNames, query, sortedCountries]);

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      radius={radius}
      transparency={transparency}
      gradient={gradient}
      required={required}
    >
      <div className={styles.root} ref={rootRef}>
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={
            activeCountry
              ? t("field.countryAria", "Country: {country}", { country: nameOf(activeCountry) })
              : displayPlaceholder
          }
          className={[
            inputControlSizeClassName[size],
            shared.trigger,
            open ? shared.triggerOpen : "",
            error ? shared.triggerError : "",
          ]
            .filter(Boolean)
            .join(" ")}
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        >
          {activeCountry ? (
            <span className={styles.triggerValue}>
              <span
                aria-hidden="true"
                className={`${flagClassName(activeCountry.code)} ${styles.flag}`}
              />
              <span>{nameOf(activeCountry)}</span>
            </span>
          ) : (
            <span className={shared.placeholder}>{displayPlaceholder}</span>
          )}
          <span aria-hidden="true" className={shared.chevron} />
        </button>
        {open ? (
          <div className={shared.panel}>
            <input
              aria-label={t("field.searchCountries", "Search countries")}
              autoFocus
              className={shared.search}
              placeholder={displaySearchPlaceholder}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className={shared.list} role="listbox">
              {filteredCountries.map((country) => (
                <button
                  aria-selected={country.code === value}
                  className={[
                    styles.option,
                    country.code === value ? styles.optionActive : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={`${country.code}-${country.dialCode}`}
                  role="option"
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={`${flagClassName(country.code)} ${styles.flag}`}
                  />
                  <span className={styles.optionLabel}>{nameOf(country)}</span>
                  <span className={styles.optionCode}>{country.code}</span>
                </button>
              ))}
              {filteredCountries.length === 0 ? (
                <p className={styles.empty}>{t("field.noCountriesMatch", "No countries match.")}</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
