import styles from "./DateField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";

export type DateInputType = "date" | "datetime-local" | "month" | "time" | "week";

type DateFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  required?: boolean;
  type?: DateInputType;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function DateField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  required,
  type = "date",
  value,
  onChange,
}: DateFieldProps) {
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
      <input
        aria-invalid={error ? "true" : undefined}
        className={`${styles.input} ${error ? styles.error : ""}`}
        id={id}
        onChange={onChange}
        type={type}
        value={value}
        {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
      />
    </FieldShell>
  );
}
