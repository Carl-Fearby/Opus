"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./CountryPickerField.module.css";
import { countries as allCountries, type PhoneCountry } from "../PhoneNumberField/countries";

function flagClassName(code: string) {
  return `fi fi-${code.toLowerCase()}`;
}

type CountryPickerFieldProps = {
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
  placeholder = "Select country…",
  required,
  searchPlaceholder = "Search countries…",
  size = "md",
  value,
  onChange,
}: CountryPickerFieldProps) {
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

  const filteredCountries = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    if (!normalised) {
      return countries;
    }

    return countries.filter(
      (country) =>
        country.label.toLowerCase().includes(normalised) ||
        country.code.toLowerCase().includes(normalised) ||
        country.dialCode.includes(normalised),
    );
  }, [countries, query]);

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div className={styles.root} ref={rootRef}>
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={activeCountry ? `Country: ${activeCountry.label}` : placeholder}
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
              <span>{activeCountry.label}</span>
            </span>
          ) : (
            <span className={shared.placeholder}>{placeholder}</span>
          )}
          <span aria-hidden="true" className={shared.chevron}>
            ▾
          </span>
        </button>
        {open ? (
          <div className={shared.panel}>
            <input
              aria-label="Search countries"
              autoFocus
              className={shared.search}
              placeholder={searchPlaceholder}
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
                  <span className={styles.optionLabel}>{country.label}</span>
                  <span className={styles.optionCode}>{country.code}</span>
                </button>
              ))}
              {filteredCountries.length === 0 ? (
                <p className={styles.empty}>No countries match.</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
