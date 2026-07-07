import styles from "./TextField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";

type TextFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  placeholder?: string;
  required?: boolean;
  type: "email" | "password" | "search" | "tel" | "text" | "url";
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function TextField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  placeholder,
  required,
  type,
  value,
  onChange,
}: TextFieldProps) {
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
        placeholder={placeholder}
        onChange={onChange}
        type={type}
        value={value}
        {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
      />
    </FieldShell>
  );
}
