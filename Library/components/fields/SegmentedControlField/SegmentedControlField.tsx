"use client";

import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import styles from "./SegmentedControlField.module.css";

type SegmentedControlFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  options: string[];
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControlField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  options,
  required,
  value,
  onChange,
}: SegmentedControlFieldProps) {
  const shellAria = useFieldShellAria();

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
        className={styles.root}
        role="radiogroup"
        {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
      >
        {options.map((option) => (
          <button
            aria-checked={value === option}
            className={[styles.segment, value === option ? styles.segmentActive : ""]
              .filter(Boolean)
              .join(" ")}
            key={option}
            role="radio"
            type="button"
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </FieldShell>
  );
}
