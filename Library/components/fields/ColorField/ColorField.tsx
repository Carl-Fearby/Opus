import styles from "./ColorField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";

type ColorFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
};

export function ColorField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  onChange,
  value,
}: ColorFieldProps) {
  const shellAria = useFieldShellAria();

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="div"
      mode={mode}
    >
      <div className={`${styles.picker} ${error ? styles.error : ""}`}>
        <input
          aria-invalid={error ? "true" : undefined}
          aria-valuetext={value.toUpperCase()}
          className={styles.nativeInput}
          id={id}
          onChange={onChange}
          type="color"
          value={value}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        />
        <span aria-hidden="true" className={styles.swatch} style={{ background: value }} />
        <span className={styles.value}>{value.toUpperCase()}</span>
        <span aria-hidden="true" className={styles.icon}>
          <span />
          <span />
        </span>
      </div>
    </FieldShell>
  );
}
