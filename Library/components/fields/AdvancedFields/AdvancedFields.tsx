"use client";

import { useId, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { FieldShell } from "../FieldShell";
import type { FieldMode, LabelPosition } from "../types";
import styles from "./AdvancedFields.module.css";

type ShellProps = { error?: string; help?: string; id: string; label: string; labelPosition?: LabelPosition; mode?: FieldMode; required?: boolean };

export type DateRangeValue = { from: string; to: string };
export type DateRangeFieldProps = ShellProps & { value: DateRangeValue; min?: string; max?: string; onChange: (value: DateRangeValue) => void };
export function DateRangeField({ error, help, id, label, labelPosition, max, min, mode, required, value, onChange }: DateRangeFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} labelTag="div" mode={mode} required={required}>
    <div className={styles.rangeGrid}>
      <label><span>From</span><input aria-invalid={Boolean(error)} id={id} max={value.to || max} min={min} type="date" value={value.from} onChange={(event) => onChange({ ...value, from: event.target.value })} /></label>
      <label><span>To</span><input aria-invalid={Boolean(error)} max={max} min={value.from || min} type="date" value={value.to} onChange={(event) => onChange({ ...value, to: event.target.value })} /></label>
    </div>
  </FieldShell>;
}

export type ComboboxOption = { label: string; value: string };
export type ComboboxFieldProps = ShellProps & { options: ComboboxOption[]; placeholder?: string; value: string; onChange: (value: string) => void };
export function ComboboxField({ error, help, id, label, labelPosition, mode, options, placeholder, required, value, onChange }: ComboboxFieldProps) {
  const listId = `${id}-options`;
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} required={required}>
    <input aria-autocomplete="list" aria-controls={listId} aria-expanded="false" aria-invalid={Boolean(error)} className={styles.input} id={id} list={listId} placeholder={placeholder} role="combobox" value={value} onChange={(event) => onChange(event.target.value)} />
    <datalist id={listId}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</datalist>
  </FieldShell>;
}

export type CurrencyFieldProps = ShellProps & { currency?: string; locale?: string; value: number | null; onChange: (value: number | null) => void };
export function CurrencyField({ currency = "GBP", error, help, id, label, labelPosition, locale = "en-GB", mode, required, value, onChange }: CurrencyFieldProps) {
  const symbol = new Intl.NumberFormat(locale, { currency, style: "currency" }).formatToParts(0).find((part) => part.type === "currency")?.value ?? currency;
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} required={required}>
    <div className={styles.affixed}><span aria-hidden="true">{symbol}</span><input aria-invalid={Boolean(error)} className={styles.bareInput} id={id} inputMode="decimal" type="number" value={value ?? ""} onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))} /></div>
  </FieldShell>;
}

export type MaskedFieldProps = ShellProps & { mask: string; placeholder?: string; value: string; onChange: (value: string) => void };
function applyMask(raw: string, mask: string) {
  const chars = raw.replace(/[^a-z0-9]/gi, "").split("");
  let result = "";
  for (const token of mask) {
    if (token === "#" || token === "A" || token === "*") {
      const index = chars.findIndex((char) => token === "#" ? /\d/.test(char) : token === "A" ? /[a-z]/i.test(char) : true);
      if (index < 0) break;
      result += chars.splice(index, 1)[0];
    } else if (result || chars.length) result += token;
  }
  return result;
}
export function MaskedField({ error, help, id, label, labelPosition, mask, mode, placeholder, required, value, onChange }: MaskedFieldProps) {
  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} mode={mode} required={required}>
    <input aria-invalid={Boolean(error)} className={styles.input} id={id} placeholder={placeholder ?? mask} value={value} onChange={(event) => onChange(applyMask(event.target.value, mask))} />
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
export function FormSection({ children, title }: { children: ReactNode; title?: string }) { const id = useId(); return <section aria-labelledby={title ? id : undefined} className={styles.formSection}>{title ? <h3 id={id}>{title}</h3> : null}{children}</section>; }
export function FormActions({ children }: { children: ReactNode }) { return <div className={styles.actions}>{children}</div>; }
