"use client";

import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import styles from "./RatingField.module.css";

export type RatingVariant = "stars" | "hearts" | "numeric";

type RatingFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  max?: number;
  mode?: FieldMode;
  required?: boolean;
  value: number;
  variant?: RatingVariant;
  onChange: (value: number) => void;
};

function iconForVariant(variant: RatingVariant, active: boolean) {
  if (variant === "hearts") {
    return active ? "♥" : "♡";
  }
  if (variant === "stars") {
    return active ? "★" : "☆";
  }
  return null;
}

export function RatingField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  max = 5,
  mode = "stacked",
  required,
  value,
  variant = "stars",
  onChange,
}: RatingFieldProps) {
  const shellAria = useFieldShellAria();
  const items = Array.from({ length: max }, (_, index) => index + 1);

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
      <div
        aria-label={`${label}: ${value} of ${max}`}
        className={styles.root}
        role={variant === "numeric" ? "radiogroup" : "group"}
        {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
      >
        {variant === "numeric"
          ? items.map((item) => (
              <button
                aria-checked={value === item}
                className={[styles.numeric, value === item ? styles.numericActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                key={item}
                role="radio"
                type="button"
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            ))
          : items.map((item) => (
              <button
                aria-label={`${item} of ${max}`}
                aria-pressed={value >= item}
                className={[styles.symbol, value >= item ? styles.symbolActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                key={item}
                type="button"
                onClick={() => onChange(item === value ? item - 1 : item)}
              >
                {iconForVariant(variant, value >= item)}
              </button>
            ))}
      </div>
    </FieldShell>
  );
}
