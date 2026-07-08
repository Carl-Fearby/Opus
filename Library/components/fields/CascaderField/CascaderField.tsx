"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import styles from "./CascaderField.module.css";

export type CascaderOption = {
  children?: CascaderOption[];
  label: string;
  value: string;
};

type CascaderFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  options: CascaderOption[];
  placeholder?: string;
  required?: boolean;
  value: string[];
  onChange: (value: string[]) => void;
};

function getColumns(options: CascaderOption[], value: string[]) {
  const columns: CascaderOption[][] = [options];
  let current = options;

  for (const selected of value) {
    const match = current.find((option) => option.value === selected);
    if (!match?.children?.length) {
      break;
    }
    current = match.children;
    columns.push(current);
  }

  return columns;
}

function labelForValue(options: CascaderOption[], value: string[]) {
  const labels: string[] = [];
  let current = options;

  for (const selected of value) {
    const match = current.find((option) => option.value === selected);
    if (!match) {
      break;
    }
    labels.push(match.label);
    current = match.children ?? [];
  }

  return labels.join(" / ");
}

export function CascaderField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  options,
  placeholder = "Select…",
  required,
  value,
  onChange,
}: CascaderFieldProps) {
  const shellAria = useFieldShellAria();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const columns = useMemo(() => getColumns(options, value), [options, value]);
  const summary = value.length ? labelForValue(options, value) : placeholder;

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

  function selectOption(level: number, option: CascaderOption) {
    const next = value.slice(0, level);
    next[level] = option.value;
    onChange(next);
    if (!option.children?.length) {
      setOpen(false);
    }
  }

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
          className={[
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
          <span className={value.length ? "" : shared.placeholder}>{summary}</span>
          <span aria-hidden="true" className={shared.chevron}>
            ▾
          </span>
        </button>
        {open ? (
          <div className={styles.panel}>
            {columns.map((column, level) => (
              <div className={styles.column} key={`column-${level}`}>
                {column.map((option) => (
                  <button
                    className={[
                      styles.option,
                      value[level] === option.value ? styles.optionActive : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    key={option.value}
                    type="button"
                    onClick={() => selectOption(level, option)}
                  >
                    <span>{option.label}</span>
                    {option.children?.length ? <span aria-hidden="true">›</span> : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
