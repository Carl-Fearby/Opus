import styles from "./DateField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";
import type { NativeInputProps, TextEntryBehaviourProps } from "../shared/nativeFieldProps";

export type DateInputType = "date" | "datetime-local" | "month" | "time" | "week";

export type DateFieldProps = TextEntryBehaviourProps & {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  inputProps?: NativeInputProps;
  required?: boolean;
  size?: InputControlSize;
  type?: DateInputType;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function DateField({
  autoComplete,
  autoFocus,
  disabled,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  inputProps,
  name,
  readOnly,
  required,
  size = "md",
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
        {...inputProps}
        aria-invalid={error ? "true" : undefined}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={[
          styles.input,
          inputControlSizeClassName[size],
          error ? styles.error : "",
        ]
          .filter(Boolean)
          .join(" ")}
        id={id}
        disabled={disabled}
        name={name}
        onChange={onChange}
        type={type}
        readOnly={readOnly}
        required={required}
        value={value}
        {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
      />
    </FieldShell>
  );
}
