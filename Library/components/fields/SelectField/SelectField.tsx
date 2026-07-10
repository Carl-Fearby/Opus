import styles from "./SelectField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";

type SelectFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  options: string[];
  required?: boolean;
  size?: InputControlSize;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
};

export function SelectField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  options,
  required,
  size = "md",
  value,
  onChange,
}: SelectFieldProps) {
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
      <div className={`${styles.wrap} ${inputControlSizeClassName[size]}`}>
        <select
          aria-invalid={error ? "true" : undefined}
          className={`${styles.select} ${error ? styles.error : ""}`}
          id={id}
          onChange={onChange}
          value={value}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    </FieldShell>
  );
}
