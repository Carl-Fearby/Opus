"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { FieldShell } from "../fields/FieldShell";
import { inputControlSizeClassName } from "../fields/shared/inputControlSizes";
import type { ControlRadius, ControlTransparency, FieldMode, InputControlSize, LabelPosition } from "../fields/types";
import styles from "./SearchBox.module.css";

export type SearchBoxCategory = {
  label: string;
  value: string;
};

export type SearchBoxProps = {
  /** Accessible name used when no visible label is supplied. */
  ariaLabel?: string;
  categories?: SearchBoxCategory[];
  category?: string;
  className?: string;
  defaultCategory?: string;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onCategoryChange?: (category: string) => void;
  onSearch?: (query: string, category?: string) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  labelVisuallyHidden?: boolean;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  radius?: ControlRadius;
  transparency?: ControlTransparency;
  gradient?: boolean;
  error?: string;
  help?: string;
  required?: boolean;
  size?: InputControlSize;
  /** Optional third accent used by the search action. Defaults to the theme tertiary accent. */
  tertiaryAccent?: string;
  searchLabel?: string;
  value?: string;
};

/** A single search control with an optional category filter and submit button. */
export function SearchBox({
  ariaLabel = "Search",
  categories = [],
  category,
  className,
  defaultCategory,
  defaultValue = "",
  disabled = false,
  name = "search",
  onCategoryChange,
  onSearch,
  onValueChange,
  placeholder = "Search for anything",
  label = "Search",
  labelVisuallyHidden = true,
  labelPosition,
  mode,
  radius,
  transparency,
  gradient,
  error,
  help,
  required,
  size = "md",
  tertiaryAccent,
  searchLabel = "Search",
  value,
}: SearchBoxProps) {
  const inputId = useId();
  const categoryId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalCategory, setInternalCategory] = useState(
    defaultCategory ?? categories[0]?.value ?? "",
  );
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLSpanElement>(null);
  const query = value ?? internalValue;
  const selectedCategory = category ?? internalCategory;
  const hasCategories = categories.length > 0;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(query, hasCategories ? selectedCategory : undefined);
  };

  useEffect(() => {
    if (!categoryOpen) return;
    const close = (event: PointerEvent) => {
      if (!categoryRef.current?.contains(event.target as Node)) setCategoryOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [categoryOpen]);

  return <FieldShell error={error} help={help} id={inputId} label={label} labelVisuallyHidden={labelVisuallyHidden} labelPosition={labelPosition} mode={mode} radius={radius} transparency={transparency} gradient={gradient} required={required}>
    <form
      className={[styles.root, inputControlSizeClassName[size], className].filter(Boolean).join(" ")}
      role="search"
      style={
        tertiaryAccent
          ? ({ "--opus-search-box-accent": tertiaryAccent } as CSSProperties)
          : undefined
      }
      onSubmit={submit}
    >
      <label className={styles.visuallyHidden} htmlFor={inputId}>{ariaLabel}</label>
      <span className={styles.inputWrap}>
        <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24"><path d="m20 20-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" /></svg>
        <input
          id={inputId}
          name={name}
          autoComplete="off"
          type="search"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={(event) => { setInternalValue(event.target.value); onValueChange?.(event.target.value); }}
        />
      </span>
      {hasCategories ? <span className={styles.categoryWrap} ref={categoryRef}>
        <button aria-controls={categoryId} aria-expanded={categoryOpen} aria-haspopup="listbox" className={styles.categoryTrigger} disabled={disabled} onClick={() => setCategoryOpen((open) => !open)} type="button">{categories.find((item) => item.value === selectedCategory)?.label}<span aria-hidden="true" className={styles.chevron} /></button>
        <input name="category" type="hidden" value={selectedCategory} />
        {categoryOpen ? <div className={styles.categoryPanel} id={categoryId} role="listbox">{categories.map((item) => <button aria-selected={item.value === selectedCategory} key={item.value} onClick={() => { setInternalCategory(item.value); onCategoryChange?.(item.value); setCategoryOpen(false); }} role="option" type="button">{item.label}</button>)}</div> : null}
      </span> : null}
      <button type="submit" disabled={disabled}>{searchLabel}</button>
    </form>
  </FieldShell>;
}
