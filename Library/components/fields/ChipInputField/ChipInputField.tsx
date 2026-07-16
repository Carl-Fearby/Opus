"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import styles from "./ChipInputField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { ChipInputVariant, FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";

const CHIP_COMMIT_KEYS = new Set(["Enter", "Tab", ","]);

type ChipInputProps = {
  disabled?: boolean;
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  onChange: (value: string[]) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  size?: InputControlSize;
  value: string[];
  variant?: ChipInputVariant;
};

export function ChipInput({
  disabled = false,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  onChange,
  placeholder = "Add item…",
  readOnly = false,
  required,
  size = "md",
  value,
  variant = "soft",
}: ChipInputProps) {
  const autoId = useId();
  const fieldId = id || `chip-input-${autoId}`;
  const shellAria = useFieldShellAria();
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsRef = useRef(value);
  chipsRef.current = value;
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const next = draft.trim();
    if (!next || disabled || readOnly) {
      setDraft("");
      return;
    }

    const current = chipsRef.current;
    if (!current.includes(next)) {
      onChange([...current, next]);
    }

    setDraft("");
  };

  const removeChip = (index: number) => {
    if (disabled || readOnly) {
      return;
    }

    onChange(chipsRef.current.filter((_, chipIndex) => chipIndex !== index));
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || readOnly) {
      return;
    }

    if (CHIP_COMMIT_KEYS.has(event.key)) {
      event.preventDefault();
      commitDraft();
      return;
    }

    if (event.key === "Backspace" && !draft && chipsRef.current.length > 0) {
      onChange(chipsRef.current.slice(0, -1));
    }
  };

  const focusInput = () => {
    if (!disabled && !readOnly) {
      inputRef.current?.focus();
    }
  };

  return (
    <FieldShell
      className={styles.shell}
      error={error}
      help={help}
      id={fieldId}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div
        aria-disabled={disabled ? "true" : undefined}
        aria-label={`${label} values`}
        className={[
          styles.field,
          inputControlSizeClassName[size],
          error ? styles.error : "",
          disabled ? styles.disabled : "",
          readOnly ? styles.readOnly : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-chip-variant={variant}
        onClick={focusInput}
        role="group"
      >
        {value.map((chip, index) => (
          <span key={`${chip}-${index}`} className={styles.chip}>
            <span className={styles.chipLabel}>{chip}</span>
            {!readOnly ? (
              <button
                aria-label={`Remove ${chip}`}
                className={styles.remove}
                disabled={disabled}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeChip(index);
                }}
              >
                <span aria-hidden="true">×</span>
              </button>
            ) : null}
          </span>
        ))}
        {!readOnly ? (
          <input
            ref={inputRef}
            aria-label={value.length ? `Add another ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
            aria-invalid={error ? "true" : undefined}
            className={styles.input}
            disabled={disabled}
            id={fieldId}
            placeholder={value.length ? "" : placeholder}
            type="text"
            value={draft}
            onBlur={commitDraft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
          />
        ) : null}
      </div>
    </FieldShell>
  );
}

export const ChipInputField = ChipInput;
