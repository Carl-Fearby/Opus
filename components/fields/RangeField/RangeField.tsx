import styles from "./RangeField.module.css";
import { Tooltip } from "@/components/Tooltip";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import { formatByStep } from "@/components/fields/numericUtils";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler, CSSProperties } from "react";

type RangeFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  max?: number;
  min?: number;
  mode?: FieldMode;
  step?: number;
  value: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function RangeField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  max = 100,
  min = 0,
  mode = "stacked",
  step = 1,
  value,
  onChange,
}: RangeFieldProps) {
  const shellAria = useFieldShellAria();
  const progress = ((value - min) / (max - min)) * 100;
  const rangeStyle = { "--range-progress": `${progress}%` } as CSSProperties;
  const formattedValue = formatByStep(value, step);
  const formattedMin = formatByStep(min, step);
  const formattedMax = formatByStep(max, step);

  return (
    <FieldShell
      error={error}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="div"
      labelVisuallyHidden
      mode={mode}
    >
      <div className={styles.wrap} style={rangeStyle}>
        <div className={styles.topRow}>
          <label className={styles.fieldLabel} htmlFor={id}>
            <span>{label}</span>
            {help ? <Tooltip content={help} label={`Help for ${label}`} /> : null}
          </label>
          <span className={styles.value}>{formattedValue}%</span>
        </div>
        <input
          aria-invalid={error ? "true" : undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${formattedValue}%`}
          className={`${styles.slider} ${error ? styles.error : ""}`}
          id={id}
          max={max}
          min={min}
          onChange={onChange}
          step={step}
          style={rangeStyle}
          type="range"
          value={value}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        />
        <div className={styles.footer}>
          <span>{formattedMin}%</span>
          <span>{formattedMax}%</span>
        </div>
      </div>
    </FieldShell>
  );
}
