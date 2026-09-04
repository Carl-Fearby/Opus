"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { FieldShell } from "../FieldShell";
import { OpusDateRangeInput, type DateRangeValue } from "../DatePickerPanel";
import type { ControlRadius, FieldMode, LabelPosition } from "../types";
import styles from "./AdvancedFields.module.css";

type ShellProps = { error?: string; help?: string; id: string; label: string; labelPosition?: LabelPosition; mode?: FieldMode; radius?: ControlRadius; transparency?: import("../types").ControlTransparency; gradient?: boolean; required?: boolean };

export type { DateRangeValue };
export type DateRangeFieldProps = ShellProps & { value: DateRangeValue; min?: string; max?: string; onChange: (value: DateRangeValue) => void };
export function DateRangeField({ error, help, id, label, labelPosition, max, min, mode, radius, transparency, gradient, required, value, onChange }: DateRangeFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} labelTag="div" mode={mode} radius={radius} transparency={transparency} gradient={gradient} required={required}>
    <OpusDateRangeInput
      aria-invalid={Boolean(error)}
      id={id}
      label={label}
      max={max}
      min={min}
      value={value}
      onChange={onChange}
    />
  </FieldShell>;
}

export type { ComboboxFieldProps, ComboboxOption } from "../ComboboxField";
export { ComboboxField } from "../ComboboxField";

const fallbackCurrencyCodes = ["AED", "ARS", "AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "COP", "CZK", "DKK", "EGP", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MAD", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON", "SAR", "SEK", "SGD", "THB", "TRY", "TWD", "UAH", "USD", "VND", "ZAR"];
const supportedCurrencyCodes = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("currency") : fallbackCurrencyCodes;
const currencyNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "currency" }) : undefined;
/** ISO 4217 currency-to-territory mapping. Shared currencies use a representative territory or region. */
const currencyRegions: Record<string, string> = {
  AED: "AE", AFN: "AF", ALL: "AL", AMD: "AM", ANG: "CW", AOA: "AO", ARS: "AR", AUD: "AU", AWG: "AW", AZN: "AZ",
  BAM: "BA", BBD: "BB", BDT: "BD", BGN: "BG", BHD: "BH", BIF: "BI", BMD: "BM", BND: "BN", BOB: "BO", BRL: "BR", BSD: "BS", BTN: "BT", BWP: "BW", BYN: "BY", BZD: "BZ",
  CAD: "CA", CDF: "CD", CHF: "CH", CLP: "CL", CNY: "CN", COP: "CO", CRC: "CR", CUC: "CU", CUP: "CU", CVE: "CV", CZK: "CZ",
  DJF: "DJ", DKK: "DK", DOP: "DO", DZD: "DZ",
  EGP: "EG", ERN: "ER", ETB: "ET", EUR: "EU",
  FJD: "FJ", FKP: "FK",
  GBP: "GB", GEL: "GE", GHS: "GH", GIP: "GI", GMD: "GM", GNF: "GN", GTQ: "GT", GYD: "GY",
  HKD: "HK", HNL: "HN", HRK: "HR", HTG: "HT", HUF: "HU",
  IDR: "ID", ILS: "IL", INR: "IN", IQD: "IQ", IRR: "IR", ISK: "IS",
  JMD: "JM", JOD: "JO", JPY: "JP",
  KES: "KE", KGS: "KG", KHR: "KH", KMF: "KM", KPW: "KP", KRW: "KR", KWD: "KW", KYD: "KY", KZT: "KZ",
  LAK: "LA", LBP: "LB", LKR: "LK", LRD: "LR", LSL: "LS", LYD: "LY",
  MAD: "MA", MDL: "MD", MGA: "MG", MKD: "MK", MMK: "MM", MNT: "MN", MOP: "MO", MRU: "MR", MUR: "MU", MVR: "MV", MWK: "MW", MXN: "MX", MYR: "MY", MZN: "MZ",
  NAD: "NA", NGN: "NG", NIO: "NI", NOK: "NO", NPR: "NP", NZD: "NZ",
  OMR: "OM",
  PAB: "PA", PEN: "PE", PGK: "PG", PHP: "PH", PKR: "PK", PLN: "PL", PYG: "PY",
  QAR: "QA",
  RON: "RO", RSD: "RS", RUB: "RU", RWF: "RW",
  SAR: "SA", SBD: "SB", SCR: "SC", SDG: "SD", SEK: "SE", SGD: "SG", SHP: "SH", SLE: "SL", SLL: "SL", SOS: "SO", SRD: "SR", SSP: "SS", STN: "ST", SVC: "SV", SYP: "SY", SZL: "SZ",
  THB: "TH", TJS: "TJ", TMT: "TM", TND: "TN", TOP: "TO", TRY: "TR", TTD: "TT", TWD: "TW", TZS: "TZ",
  UAH: "UA", UGX: "UG", USD: "US", UYU: "UY", UZS: "UZ",
  VES: "VE", VND: "VN", VUV: "VU",
  WST: "WS",
  XAF: "CM", XCD: "AG", XCG: "CW", XOF: "SN", XPF: "PF",
  YER: "YE",
  ZAR: "ZA", ZMW: "ZM", ZWG: "ZW", ZWL: "ZW",
};

function flagForCurrency(currency: string) {
  const region = currencyRegions[currency];
  if (!/^[A-Z]{2}$/.test(region)) return "🌐";
  return String.fromCodePoint(...[...region].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65));
}

const currencyLocales: Record<string, string> = {
  AED: "ar-AE", AUD: "en-AU", BRL: "pt-BR", CAD: "en-CA", CHF: "de-CH", CNY: "zh-CN",
  CZK: "cs-CZ", DKK: "da-DK", EUR: "de-DE", GBP: "en-GB", HKD: "zh-HK", HUF: "hu-HU",
  IDR: "id-ID", ILS: "he-IL", INR: "en-IN", JPY: "ja-JP", KRW: "ko-KR", MXN: "es-MX",
  MYR: "ms-MY", NOK: "nb-NO", NZD: "en-NZ", PHP: "en-PH", PLN: "pl-PL", RON: "ro-RO",
  SAR: "ar-SA", SEK: "sv-SE", SGD: "en-SG", THB: "th-TH", TRY: "tr-TR", TWD: "zh-TW",
  UAH: "uk-UA", USD: "en-US", VND: "vi-VN", ZAR: "en-ZA",
};

function currencyLocale(currency: string) {
  if (currencyLocales[currency]) return currencyLocales[currency];
  const region = currencyRegions[currency];
  // `und` deliberately lets Intl select the territory's currency presentation
  // without assuming English when we do not have a language-specific locale.
  return /^[A-Z]{2}$/.test(region) ? `und-${region}` : "en-US";
}

const regionNames = typeof Intl.DisplayNames === "function" ? new Intl.DisplayNames(["en"], { type: "region" }) : undefined;

function currencySymbol(currency: string) {
  return new Intl.NumberFormat(currencyLocale(currency), { currency, style: "currency" })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? currency;
}

/** Every ISO 4217 currency exposed by the runtime, with its testable territory and display sign. */
export const currencyOptions = supportedCurrencyCodes.map((currency) => {
  const region = currencyRegions[currency];
  const territory = region && regionNames?.of(region);
  return {
    label: `${flagForCurrency(currency)} ${currency} — ${currencyNames?.of(currency) ?? currency}${territory ? ` · ${territory}` : ""} · ${currencySymbol(currency)}`,
    value: currency,
  };
});

export type CurrencyFieldProps = ShellProps & { currency?: string; locale?: string; value: number | null; onChange: (value: number | null) => void };
export function CurrencyField({ currency = "GBP", error, help, id, label, labelPosition, locale, mode, radius, transparency, gradient, required, value, onChange }: CurrencyFieldProps) {
  const resolvedLocale = locale ?? currencyLocale(currency);
  const currencyFormatter = useMemo(() => new Intl.NumberFormat(resolvedLocale, { currency, style: "currency" }), [currency, resolvedLocale]);
  const currencyParts = currencyFormatter.formatToParts(0);
  const symbol = currencyParts.find((part) => part.type === "currency")?.value ?? currency;
  const symbolIsPrefix = currencyParts.findIndex((part) => part.type === "currency") < currencyParts.findIndex((part) => part.type === "integer");
  const fractionDigits = currencyFormatter.resolvedOptions().maximumFractionDigits;
  const formatValue = useCallback((amount: number) => new Intl.NumberFormat(resolvedLocale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(amount), [fractionDigits, resolvedLocale]);
  const [text, setText] = useState(value === null ? "" : formatValue(value));

  useEffect(() => {
    setText(value === null ? "" : formatValue(value));
  }, [formatValue, value]);

  const numericText = (raw: string) => {
    let next = "";
    let hasDecimal = false;
    for (const character of raw) {
      if (character >= "0" && character <= "9") next += character;
      if ((character === "." || character === ",") && !hasDecimal) {
        next += character;
        hasDecimal = true;
      }
    }
    return next;
  };

  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} radius={radius} transparency={transparency} gradient={gradient} required={required}>
    <div className={styles.affixed} data-currency-position={symbolIsPrefix ? "prefix" : "suffix"}><span aria-hidden="true">{symbol}</span><input aria-invalid={Boolean(error)} className={styles.bareInput} id={id} inputMode="decimal" type="text" value={text} onFocus={() => setText(value === null ? "" : String(value))} onChange={(event) => setText(numericText(event.target.value))} onBlur={() => { if (text === "" || text === ".") { onChange(null); return; } const next = Number(text.replace(",", ".")); if (!Number.isFinite(next)) return; onChange(next); setText(formatValue(next)); }} /></div>
  </FieldShell>;
}

export type PercentageFieldProps = ShellProps & {
  max?: number;
  min?: number;
  step?: number;
  value: number | null;
  onChange: (value: number | null) => void;
};

/** Values are expressed as 0–100, rather than a fractional 0–1 value. */
export function PercentageField({
  error,
  help,
  id,
  label,
  labelPosition,
  max = 100,
  min = 0,
  mode,
  radius,
  transparency,
  gradient,
  required,
  step = 0.01,
  value,
  onChange,
}: PercentageFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} radius={radius} transparency={transparency} gradient={gradient} required={required}>
    <div className={styles.affixed}>
      <input
        aria-invalid={Boolean(error)}
        className={styles.bareInput}
        id={id}
        inputMode="decimal"
        max={max}
        min={min}
        step={step}
        type="number"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
      />
      <span aria-hidden="true">%</span>
    </div>
  </FieldShell>;
}

export type MaskedFieldProps = ShellProps & { mask: string; placeholder?: string; value: string; onChange: (value: string) => void };

function significantMaskChars(value: string) {
  return value.replace(/[^a-z0-9]/gi, "");
}

function matchesMaskToken(token: string, char: string) {
  if (token === "#") return /\d/.test(char);
  if (token === "A") return /[a-z]/i.test(char);
  if (token === "*") return true;
  return false;
}

/** Apply mask literals around significant characters. Never leave trailing separators, and treat
 * deleting a separator as deleting the preceding significant character. */
function applyMask(raw: string, mask: string, previous = "") {
  let significant = significantMaskChars(raw);
  const previousSignificant = significantMaskChars(previous);

  // Backspacing a mask literal leaves the same significant chars — drop one so delete works.
  if (
    previous &&
    raw.length < previous.length &&
    significant.length === previousSignificant.length &&
    previousSignificant.length > 0
  ) {
    significant = previousSignificant.slice(0, -1);
  }

  const chars = significant.split("");
  let charIndex = 0;
  let result = "";

  for (const token of mask) {
    if (token === "#" || token === "A" || token === "*") {
      if (charIndex >= chars.length) break;
      const char = chars[charIndex];
      if (!matchesMaskToken(token, char)) break;
      result += char;
      charIndex += 1;
      continue;
    }

    // Only emit literals when more significant input remains (avoids sticky trailing separators).
    if (charIndex < chars.length) {
      result += token;
    }
  }

  return result;
}

export function MaskedField({ error, help, id, label, labelPosition, mask, mode, placeholder, radius, transparency, gradient, required, value, onChange }: MaskedFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} radius={radius} transparency={transparency} gradient={gradient} required={required}>
    <input
      aria-invalid={Boolean(error)}
      className={styles.input}
      id={id}
      placeholder={placeholder ?? mask}
      value={value}
      onChange={(event) => onChange(applyMask(event.target.value, mask, value))}
    />
  </FieldShell>;
}

export type MultiFileItem = File | { name: string; size: number };
export type MultiFileFieldProps = ShellProps & { accept?: string; files: MultiFileItem[]; maxFiles?: number; onChange: (files: MultiFileItem[]) => void };
export function MultiFileField({ accept, error, files, help, id, label, labelPosition, maxFiles = 5, mode, radius, transparency, gradient, required, onChange }: MultiFileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (next: FileList | null) => next && onChange([...files, ...Array.from(next)].slice(0, maxFiles));
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} labelTag="div" mode={mode} radius={radius} transparency={transparency} gradient={gradient} required={required}>
    <label className={styles.drop} htmlFor={id}><strong>Choose files</strong><span>{files.length ? `${files.length} of ${maxFiles} selected` : `Up to ${maxFiles} files`}</span><input accept={accept} className={styles.hidden} id={id} multiple ref={inputRef} type="file" onChange={(event) => add(event.target.files)} /></label>
    {files.length ? <ul className={styles.fileList}>{files.map((file, index) => <li key={`${file.name}-${file.size}-${index}`}><span>{file.name}</span><button aria-label={`Remove ${file.name}`} type="button" onClick={() => onChange(files.filter((_, itemIndex) => itemIndex !== index))}>×</button></li>)}</ul> : null}
  </FieldShell>;
}

export type CheckboxGroupOption = { disabled?: boolean; label: string; value: string };
export type CheckboxGroupFieldProps = ShellProps & { options: CheckboxGroupOption[]; value: string[]; onChange: (value: string[]) => void };
export function CheckboxGroupField({ error, help, id, label, labelPosition, mode, options, radius, transparency, gradient, required, value, onChange }: CheckboxGroupFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} labelTag="div" mode={mode} radius={radius} transparency={transparency} gradient={gradient} required={required}>
    <div className={styles.checkGroup} role="group">{options.map((option, index) => <label key={option.value}><input checked={value.includes(option.value)} disabled={option.disabled} id={index === 0 ? id : undefined} type="checkbox" onChange={(event) => onChange(event.target.checked ? [...value, option.value] : value.filter((item) => item !== option.value))} /><span>{option.label}</span></label>)}</div>
  </FieldShell>;
}

export type FormValidationSummaryProps = { errors: Array<{ fieldId?: string; message: string }>; title?: string };
export function FormValidationSummary({ errors, title = "Please correct the following" }: FormValidationSummaryProps) {
  if (!errors.length) return null;
  return <section aria-labelledby="form-validation-title" className={styles.summary} role="alert"><h3 id="form-validation-title">{title}</h3><ul>{errors.map((error, index) => <li key={`${error.fieldId}-${index}`}>{error.fieldId ? <a href={`#${error.fieldId}`}>{error.message}</a> : error.message}</li>)}</ul></section>;
}
export type FormProps = Omit<ComponentPropsWithoutRef<"form">, "className"> & {
  className?: string;
};
export function Form({ children, className, ...props }: FormProps) {
  return <form {...props} className={[styles.form, className].filter(Boolean).join(" ")}>{children}</form>;
}
export type FormHeaderProps = {
  /** Trailing controls, aligned opposite the title on wide layouts. */
  actions?: ReactNode;
  align?: "start" | "center";
  description?: string;
  /** Heading level for the document outline. Visual size is unchanged. */
  headingLevel?: 2 | 3 | 4;
  /** Small uppercase label above the title. */
  eyebrow?: string;
  title: string;
  /** Id placed on the heading, for wiring `aria-labelledby` on the surrounding region. */
  titleId?: string;
};
export function FormHeader({ actions, align = "start", description, eyebrow, headingLevel = 2, title, titleId }: FormHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  return <header className={styles.formHeader} data-align={align}>
    <div className={styles.formHeaderCopy}>
      {eyebrow ? <p className={styles.formHeaderEyebrow}>{eyebrow}</p> : null}
      <Heading className={styles.formHeaderTitle} id={titleId}>{title}</Heading>
      {description ? <p className={styles.formHeaderDescription}>{description}</p> : null}
    </div>
    {actions ? <div className={styles.formHeaderActions}>{actions}</div> : null}
  </header>;
}
export function FormSection({ children, title }: { children: ReactNode; title?: string }) { const id = useId(); return <section aria-labelledby={title ? id : undefined} className={styles.formSection}>{title ? <h3 id={id}>{title}</h3> : null}{children}</section>; }
export function FormActions({ children }: { children: ReactNode }) { return <div className={styles.actions}>{children}</div>; }
