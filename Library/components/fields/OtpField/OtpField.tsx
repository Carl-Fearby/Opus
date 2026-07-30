"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { FieldShell } from "../FieldShell";
import type { FieldMode, LabelPosition } from "../types";
import styles from "./OtpField.module.css";

export type OtpFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  length?: number;
  mode?: FieldMode;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

export function OtpField({ error, help, id, label, labelPosition = "left", length = 6, mode = "stacked", required, value, onChange, onComplete }: OtpFieldProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? "");
  const commit = (nextValue: string) => {
    const normalized = nextValue.replace(/\D/g, "").slice(0, length);
    onChange(normalized);
    if (normalized.length === length) onComplete?.(normalized);
    return normalized;
  };
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    commit(pasted);
    window.requestAnimationFrame(() => refs.current[Math.min(pasted.length, length) - 1]?.focus());
  };

  return <FieldShell error={error} help={help} id={id} label={label} labelPosition={labelPosition} labelTag="div" mode={mode} required={required}>
    <div aria-label={label} className={styles.inputs} onPaste={handlePaste} role="group" style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}>
      {digits.map((digit, index) => <input
        aria-label={`Digit ${index + 1} of ${length}`}
        aria-invalid={error ? "true" : undefined}
        autoComplete={index === 0 ? "one-time-code" : "off"}
        className={styles.input}
        id={index === 0 ? id : undefined}
        inputMode="numeric"
        key={index}
        maxLength={1}
        pattern="[0-9]*"
        ref={(node) => { refs.current[index] = node; }}
        value={digit}
        onChange={(event) => {
          const raw = event.target.value.replace(/\D/g, "");
          if (raw.length > 1) {
            const pasted = commit(raw);
            window.requestAnimationFrame(() => refs.current[Math.min(pasted.length, length) - 1]?.focus());
            return;
          }
          const next = digits.slice();
          next[index] = raw.slice(-1);
          commit(next.join(""));
          if (raw) window.requestAnimationFrame(() => refs.current[index + 1]?.focus());
        }}
        onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Backspace" && !digit) refs.current[index - 1]?.focus();
          if (event.key === "ArrowLeft") refs.current[index - 1]?.focus();
          if (event.key === "ArrowRight") refs.current[index + 1]?.focus();
        }}
      />)}
    </div>
  </FieldShell>;
}
