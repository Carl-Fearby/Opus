"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./PhoneNumberField.module.css";
import { countries as allCountries, type PhoneCountry } from "./countries";

function flagClassName(code: string) {
  return `fi fi-${code.toLowerCase()}`;
}

export type { PhoneCountry } from "./countries";

type PhoneNumberFieldProps = {
  countries?: PhoneCountry[];
  countryCode: string;
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  placeholder?: string;
  required?: boolean;
  size?: InputControlSize;
  value: string;
  onChange: (value: string) => void;
  onCountryCodeChange: (countryCode: string) => void;
};

export function PhoneNumberField({
  countries = allCountries,
  countryCode,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  placeholder = "7123 456789",
  required,
  size = "md",
  value,
  onChange,
  onCountryCodeChange,
}: PhoneNumberFieldProps) {
  const shellAria = useFieldShellAria();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const activeCountry =
    countries.find((country) => country.code === countryCode) ?? countries[0];

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
      <div className={`${styles.root} ${inputControlSizeClassName[size]}`} ref={rootRef}>
        <div className={styles.countryWrap}>
          <button
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={`Country code: ${activeCountry.label} ${activeCountry.dialCode}`}
            className={[inputControlSizeClassName[size], shared.trigger, styles.country, open ? shared.triggerOpen : ""]
              .filter(Boolean)
              .join(" ")}
            type="button"
            onClick={() => setOpen((current) => !current)}
          >
            <span className={styles.countryValue}>
              <span aria-hidden="true" className={`${flagClassName(activeCountry.code)} ${styles.flag}`} />
              <span className={styles.dial}>{activeCountry.dialCode}</span>
              <span className={styles.code}>{activeCountry.code}</span>
            </span>
            <span aria-hidden="true" className={styles.chevron}>
              ▾
            </span>
          </button>
          {open ? (
            <div className={`${shared.panel} ${styles.panel}`}>
              <input
                aria-label="Search countries"
                autoFocus
                className={shared.search}
                placeholder="Search countries…"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className={shared.list} role="listbox">
                {filteredCountries.map((country) => (
                  <button
                    aria-selected={country.code === activeCountry.code}
                    className={[
                      styles.option,
                      country.code === activeCountry.code ? styles.optionActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={`${country.code}-${country.dialCode}`}
                    type="button"
                    onClick={() => {
                      onCountryCodeChange(country.code);
                      setOpen(false);
                    }}
                  >
                    <span aria-hidden="true" className={`${flagClassName(country.code)} ${styles.flag}`} />
                    <span className={styles.optionLabel}>{country.label}</span>
                    <span className={styles.optionDial}>{country.dialCode}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 ? (
                  <p className={styles.empty}>No countries match.</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <input
          aria-invalid={error ? "true" : undefined}
          className={`${shared.input} ${error ? shared.error : ""}`}
          id={id}
          inputMode="tel"
          placeholder={placeholder}
          type="tel"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        />
      </div>
    </FieldShell>
  );
}
