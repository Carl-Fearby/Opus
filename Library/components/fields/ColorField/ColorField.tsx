import styles from "./ColorField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";

type ColorFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  size?: InputControlSize;
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
  size = "md",
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
      <div
        className={[
          styles.picker,
          inputControlSizeClassName[size],
          error ? styles.error : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          aria-label={label}
          aria-invalid={error ? "true" : undefined}
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
