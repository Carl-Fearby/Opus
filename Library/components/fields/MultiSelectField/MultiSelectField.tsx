"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import styles from "./MultiSelectField.module.css";

type MultiSelectFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  options: string[];
  placeholder?: string;
  required?: boolean;
  value: string[];
  onChange: (value: string[]) => void;
};

export function MultiSelectField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  options,
  placeholder = "Select options…",
  required,
  value,
  onChange,
}: MultiSelectFieldProps) {
  const shellAria = useFieldShellAria();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

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

  const summary = useMemo(() => {
    if (value.length === 0) {
      return placeholder;
    }
    if (value.length <= 2) {
      return value.join(", ");
    }
    return `${value.length} selected`;
  }, [placeholder, value]);

  function toggleOption(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
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
          <div className={shared.panel}>
            <div className={shared.list} role="listbox">
              {options.map((option) => (
                <label className={shared.option} key={option}>
                  <input
                    checked={value.includes(option)}
                    type="checkbox"
                    onChange={() => toggleOption(option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
