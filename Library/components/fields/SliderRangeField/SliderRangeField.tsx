"use client";

import { useMemo, type CSSProperties } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./SliderRangeField.module.css";

type SliderRangeFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  max?: number;
  min?: number;
  mode?: FieldMode;
  required?: boolean;
  size?: InputControlSize;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SliderRangeField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  max = 100,
  min = 0,
  mode = "stacked",
  required,
  size = "md",
  step = 1,
  value,
  onChange,
}: SliderRangeFieldProps) {
  const shellAria = useFieldShellAria();
  const [start, end] = value;
  const range = max - min || 1;
  const startPercent = ((start - min) / range) * 100;
  const endPercent = ((end - min) / range) * 100;

  const trackStyle = useMemo(
    () =>
      ({
        "--range-start": `${startPercent}%`,
        "--range-end": `${endPercent}%`,
      }) as CSSProperties,
    [endPercent, startPercent],
  );

  function updateStart(next: number) {
    onChange([clamp(next, min, end), end]);
  }

  function updateEnd(next: number) {
    onChange([start, clamp(next, start, max)]);
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
      <div className={`${styles.root} ${inputControlSizeClassName[size]}`} {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}>
        <div className={styles.header}>
          <span className={styles.value}>
            {start} – {end}
          </span>
        </div>
        <div className={styles.trackWrap} style={trackStyle}>
          <div className={styles.track} />
          <input
            aria-label={`${label} minimum`}
            className={styles.slider}
            max={max}
            min={min}
            step={step}
            type="range"
            value={start}
            onChange={(event) => updateStart(Number(event.target.value))}
          />
          <input
            aria-label={`${label} maximum`}
            className={styles.slider}
            max={max}
            min={min}
            step={step}
            type="range"
            value={end}
            onChange={(event) => updateEnd(Number(event.target.value))}
          />
        </div>
        <div className={styles.footer}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </FieldShell>
  );
}
