"use client";

import { useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { FieldShell } from "../FieldShell";
import { OpusDateRangeInput, type DateRangeValue } from "../DatePickerPanel";
import type { FieldMode, LabelPosition } from "../types";
import styles from "./AdvancedFields.module.css";

type ShellProps = { error?: string; help?: string; id: string; label: string; labelPosition?: LabelPosition; mode?: FieldMode; required?: boolean };

export type { DateRangeValue };
export type DateRangeFieldProps = ShellProps & { value: DateRangeValue; min?: string; max?: string; onChange: (value: DateRangeValue) => void };
export function DateRangeField({ error, help, id, label, labelPosition, max, min, mode, required, value, onChange }: DateRangeFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} labelTag="div" mode={mode} required={required}>
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

export type CurrencyFieldProps = ShellProps & { currency?: string; locale?: string; value: number | null; onChange: (value: number | null) => void };
export function CurrencyField({ currency = "GBP", error, help, id, label, labelPosition, locale = "en-GB", mode, required, value, onChange }: CurrencyFieldProps) {
  const symbol = new Intl.NumberFormat(locale, { currency, style: "currency" }).formatToParts(0).find((part) => part.type === "currency")?.value ?? currency;
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} required={required}>
    <div className={styles.affixed}><span aria-hidden="true">{symbol}</span><input aria-invalid={Boolean(error)} className={styles.bareInput} id={id} inputMode="decimal" type="number" value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} /></div>
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
  required,
  step = 0.01,
  value,
  onChange,
}: PercentageFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} required={required}>
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

export function MaskedField({ error, help, id, label, labelPosition, mask, mode, placeholder, required, value, onChange }: MaskedFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} required={required}>
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
export function MultiFileField({ accept, error, files, help, id, label, labelPosition, maxFiles = 5, mode, required, onChange }: MultiFileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const add = (next: FileList | null) => next && onChange([...files, ...Array.from(next)].slice(0, maxFiles));
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} labelTag="div" mode={mode} required={required}>
    <label className={styles.drop} htmlFor={id}><strong>Choose files</strong><span>{files.length ? `${files.length} of ${maxFiles} selected` : `Up to ${maxFiles} files`}</span><input accept={accept} className={styles.hidden} id={id} multiple ref={inputRef} type="file" onChange={(event) => add(event.target.files)} /></label>
    {files.length ? <ul className={styles.fileList}>{files.map((file, index) => <li key={`${file.name}-${file.size}-${index}`}><span>{file.name}</span><button aria-label={`Remove ${file.name}`} type="button" onClick={() => onChange(files.filter((_, itemIndex) => itemIndex !== index))}>×</button></li>)}</ul> : null}
  </FieldShell>;
}

export type CheckboxGroupOption = { disabled?: boolean; label: string; value: string };
export type CheckboxGroupFieldProps = ShellProps & { options: CheckboxGroupOption[]; value: string[]; onChange: (value: string[]) => void };
export function CheckboxGroupField({ error, help, id, label, labelPosition, mode, options, required, value, onChange }: CheckboxGroupFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} labelTag="div" mode={mode} required={required}>
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
