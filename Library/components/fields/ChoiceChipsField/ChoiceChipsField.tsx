"use client";

import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type {
  ChoiceChipsSelectionMode,
  ChoiceChipsVariant,
  ChoiceOption,
  FieldMode,
  InputControlSize,
  LabelPosition,
} from "@/components/fields/types";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./ChoiceChipsField.module.css";

type ChoiceChipsProps = {
  disabled?: boolean;
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  options: ChoiceOption[];
  required?: boolean;
  selectionMode?: ChoiceChipsSelectionMode;
  size?: InputControlSize;
  value: string | string[];
  variant?: ChoiceChipsVariant;
  onChange: (value: string | string[]) => void;
};

function normaliseValue(value: string | string[]) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

export function ChoiceChips({
  disabled = false,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  options,
  required,
  selectionMode = "multiple",
  size = "md",
  value,
  variant = "soft",
  onChange,
}: ChoiceChipsProps) {
  const shellAria = useFieldShellAria();
  const selectedValues = normaliseValue(value);
  const isSingle = selectionMode === "single";

  const toggleValue = (nextValue: string) => {
    if (disabled) {
      return;
    }

    if (isSingle) {
      onChange(nextValue);
      return;
    }

    onChange(
      selectedValues.includes(nextValue)
        ? selectedValues.filter((selectedValue) => selectedValue !== nextValue)
        : [...selectedValues, nextValue],
    );
  };

  return (
    <FieldShell
      className={styles.shell}
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div
        aria-disabled={disabled ? "true" : undefined}
        className={[styles.root, inputControlSizeClassName[size], disabled ? styles.disabled : ""]
          .filter(Boolean)
          .join(" ")}
        data-choice-chip-variant={variant}
        role={isSingle ? "radiogroup" : "group"}
        {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
      >
        {options.map((option) => {
          const selected = selectedValues.includes(option.value);
          const optionDisabled = disabled || option.disabled;

          return (
            <button
              aria-checked={isSingle ? selected : undefined}
              aria-pressed={isSingle ? undefined : selected}
              className={[styles.chip, selected ? styles.selected : "", optionDisabled ? styles.optionDisabled : ""]
                .filter(Boolean)
                .join(" ")}
              disabled={optionDisabled}
              key={option.value}
              role={isSingle ? "radio" : undefined}
              type="button"
              onClick={() => toggleValue(option.value)}
            >
              <span className={styles.indicator} aria-hidden="true" />
              <span className={styles.label}>{option.label}</span>
            </button>
          );
        })}
      </div>
    </FieldShell>
  );
}

export const ChoiceChipsField = ChoiceChips;
