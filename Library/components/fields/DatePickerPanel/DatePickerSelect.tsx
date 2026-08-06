"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./DatePickerSelect.module.css";

export type DatePickerSelectOption = {
  label: string;
  value: number;
};

type DatePickerSelectProps = {
  "aria-label": string;
  className?: string;
  options: DatePickerSelectOption[];
  value: number;
  onChange: (value: number) => void;
};

export function DatePickerSelect({
  "aria-label": ariaLabel,
  className,
  options,
  value,
  onChange,
}: DatePickerSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const active = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    selectedRef.current?.scrollIntoView({ block: "nearest" });

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

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} ref={rootRef}>
      <button
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={[styles.trigger, open ? styles.triggerOpen : ""].filter(Boolean).join(" ")}
        type="button"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={styles.value}>{active?.label ?? ""}</span>
        <span aria-hidden="true" className={styles.chevron} />
      </button>
      {open ? (
        <div className={styles.panel}>
          <div aria-label={ariaLabel} className={styles.list} id={listboxId} role="listbox">
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  aria-selected={selected}
                  className={[styles.option, selected ? styles.optionActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  key={option.value}
                  ref={selected ? selectedRef : undefined}
                  role="option"
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
