"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { FieldShell } from "../FieldShell";
import styles from "./AsyncSelectField.module.css";

export type AsyncSelectOption = { label: string; value: string; description?: string };
export type AsyncSelectFieldProps = {
  id: string;
  label: string;
  value?: AsyncSelectOption | null;
  defaultOptions?: AsyncSelectOption[];
  loadOptions: (query: string) => Promise<AsyncSelectOption[]>;
  debounceMs?: number;
  minQueryLength?: number;
  placeholder?: string;
  loadingMessage?: string;
  emptyMessage?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  help?: string;
  onChange: (option: AsyncSelectOption | null) => void;
};

export function AsyncSelectField({ id, label, value, defaultOptions = [], loadOptions, debounceMs = 250, minQueryLength = 0, placeholder = "Search…", loadingMessage = "Loading options…", emptyMessage = "No options found", disabled, required, error, help, onChange }: AsyncSelectFieldProps) {
  const listId = useId();
  const requestRef = useRef(0);
  const [query, setQuery] = useState(value?.label ?? "");
  const [options, setOptions] = useState(defaultOptions);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (!open || !query.trim() || query.trim().length < minQueryLength) return;
    const request = ++requestRef.current;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const next = await loadOptions(query.trim());
        if (request === requestRef.current) { setOptions(next); setHighlight(0); }
      } finally { if (request === requestRef.current) setLoading(false); }
    }, debounceMs);
    return () => window.clearTimeout(timeout);
  }, [debounceMs, loadOptions, minQueryLength, open, query]);

  const select = (option: AsyncSelectOption) => { setQuery(option.label); setOpen(false); onChange(option); };
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setOpen(true);

    if (!nextQuery.length) {
      requestRef.current += 1;
      setOptions([]);
      setHighlight(0);
      setLoading(false);
      onChange(null);
    }
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setHighlight((value) => Math.min(value + 1, Math.max(options.length - 1, 0))); }
    if (event.key === "ArrowUp") { event.preventDefault(); setHighlight((value) => Math.max(value - 1, 0)); }
    if (event.key === "Enter" && open && options[highlight]) { event.preventDefault(); select(options[highlight]); }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
  };

  return <FieldShell id={id} label={label} required={required} error={error} help={help}>
    <div className={styles.root}>
      <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && options[highlight] ? `${listId}-${highlight}` : undefined} className={styles.input} disabled={disabled} placeholder={placeholder} value={query} onChange={handleChange} onFocus={() => setOpen(true)} onKeyDown={handleKeyDown} />
      {open ? <div className={styles.list} id={listId} role="listbox">
        {loading ? <p role="status">{loadingMessage}</p> : options.length ? options.map((option, index) => <button aria-selected={value?.value === option.value} className={styles.option} data-highlighted={index === highlight} id={`${listId}-${index}`} key={option.value} role="option" type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => select(option)}><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</button>) : <p role="status">{emptyMessage}</p>}
      </div> : null}
    </div>
  </FieldShell>;
}
