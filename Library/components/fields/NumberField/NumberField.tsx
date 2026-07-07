"use client";

import { useEffect, useState, type ChangeEventHandler, type FocusEventHandler } from "react";
import styles from "./NumberField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import { formatByStep, roundToStep } from "@/components/fields/numericUtils";
import type { FieldMode, LabelPosition } from "@/components/fields/types";

type NumberFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  max?: number;
  min?: number;
  mode?: FieldMode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  step?: number;
  value: number;
};

function sanitizeNumericInput(
  raw: string,
  { allowDecimal, allowNegative }: { allowDecimal: boolean; allowNegative: boolean },
): string {
  if (raw === "") {
    return "";
  }

  if (raw === "-" && allowNegative) {
    return "-";
  }

  let sanitized = "";
  let hasDecimal = false;

  for (const char of raw) {
    if (char >= "0" && char <= "9") {
      sanitized += char;
      continue;
    }

    if (char === "-" && allowNegative && sanitized === "") {
      sanitized = "-";
      continue;
    }

    if (char === "." && allowDecimal && !hasDecimal && sanitized !== "" && sanitized !== "-") {
      sanitized += ".";
      hasDecimal = true;
    }
  }

  return sanitized;
}

export function NumberField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  max,
  min,
  mode = "stacked",
  onChange,
  step = 1,
  value,
}: NumberFieldProps) {
  const shellAria = useFieldShellAria();
  const [text, setText] = useState(() => formatByStep(value, step));

  useEffect(() => {
    setText(formatByStep(value, step));
  }, [value, step]);

  const boundValue = (nextValue: number) => {
    const rounded = roundToStep(nextValue, step, min ?? 0);
    return Math.min(max ?? rounded, Math.max(min ?? rounded, rounded));
  };

  const emitValue = (nextValue: number) => {
    const bounded = boundValue(nextValue);

    onChange({
      target: { value: formatByStep(bounded, step), valueAsNumber: bounded },
    } as unknown as Parameters<ChangeEventHandler<HTMLInputElement>>[0]);
  };

  const allowNegative = (min ?? 0) < 0;
  const allowDecimal = !Number.isInteger(step);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const sanitized = sanitizeNumericInput(event.target.value, { allowDecimal, allowNegative });
    setText(sanitized);

    if (sanitized === "" || sanitized === "-" || sanitized.endsWith(".")) {
      return;
    }

    const parsed = Number(sanitized);
    if (!Number.isNaN(parsed)) {
      emitValue(parsed);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = () => {
    if (text === "" || text === "-" || Number.isNaN(Number(text))) {
      setText(formatByStep(value, step));
      return;
    }

    const bounded = boundValue(Number(text));
    setText(formatByStep(bounded, step));
    emitValue(bounded);
  };

  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
    >
      <div className={`${styles.stepper} ${error ? styles.error : ""}`}>
        <button
          aria-controls={id}
          aria-label={`Decrease ${label}`}
          className={styles.button}
          disabled={atMin}
          onClick={() => emitValue(value - step)}
          type="button"
        >
          -
        </button>
        <input
          aria-invalid={error ? "true" : undefined}
          className={styles.input}
          id={id}
          inputMode={allowDecimal ? "decimal" : "numeric"}
          onBlur={handleBlur}
          onChange={handleChange}
          type="text"
          value={text}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        />
        <button
          aria-controls={id}
          aria-label={`Increase ${label}`}
          className={styles.button}
          disabled={atMax}
          onClick={() => emitValue(value + step)}
          type="button"
        >
          +
        </button>
      </div>
    </FieldShell>
  );
}
