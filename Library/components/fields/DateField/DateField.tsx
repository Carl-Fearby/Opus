"use client";

import styles from "./DateField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import { OpusDateInput, OpusDateTimeInput, OpusMonthInput, OpusTimeInput, OpusWeekInput } from "../DatePickerPanel";
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
  max?: string;
  min?: string;
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
  max,
  min,
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
  const ariaProps = fieldInputAriaProps(shellAria, { invalid: Boolean(error) });
  const resolvedMin = min ?? (typeof inputProps?.min === "string" ? inputProps.min : undefined);
  const resolvedMax = max ?? (typeof inputProps?.max === "string" ? inputProps.max : undefined);
  const controlClassName = [inputControlSizeClassName[size], error ? styles.error : ""]
    .filter(Boolean)
    .join(" ");

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
      {type === "date" ? (
        <OpusDateInput
          aria-describedby={ariaProps["aria-describedby"]}
          aria-invalid={error ? "true" : undefined}
          className={controlClassName}
          disabled={disabled}
          id={id}
          label={label}
          max={resolvedMax}
          min={resolvedMin}
          name={name}
          readOnly={readOnly}
          required={required}
          value={value}
          onChange={onChange}
        />
      ) : type === "datetime-local" ? (
        <OpusDateTimeInput
          aria-describedby={ariaProps["aria-describedby"]}
          aria-invalid={error ? "true" : undefined}
          className={controlClassName}
          disabled={disabled}
          id={id}
          label={label}
          max={resolvedMax}
          min={resolvedMin}
          name={name}
          readOnly={readOnly}
          required={required}
          value={value}
          onChange={onChange}
        />
      ) : type === "time" ? (
        <OpusTimeInput
          aria-describedby={ariaProps["aria-describedby"]}
          aria-invalid={error ? "true" : undefined}
          className={controlClassName}
          disabled={disabled}
          id={id}
          label={label}
          name={name}
          readOnly={readOnly}
          required={required}
          value={value}
          onChange={onChange}
        />
      ) : type === "month" ? (
        <OpusMonthInput
          aria-describedby={ariaProps["aria-describedby"]}
          aria-invalid={error ? "true" : undefined}
          className={controlClassName}
          disabled={disabled}
          id={id}
          label={label}
          max={resolvedMax}
          min={resolvedMin}
          name={name}
          readOnly={readOnly}
          required={required}
          value={value}
          onChange={onChange}
        />
      ) : type === "week" ? (
        <OpusWeekInput
          aria-describedby={ariaProps["aria-describedby"]}
          aria-invalid={error ? "true" : undefined}
          className={controlClassName}
          disabled={disabled}
          id={id}
          label={label}
          max={resolvedMax}
          min={resolvedMin}
          name={name}
          readOnly={readOnly}
          required={required}
          value={value}
          onChange={onChange}
        />
      ) : (
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
          max={resolvedMax}
          min={resolvedMin}
          name={name}
          onChange={onChange}
          type={type}
          readOnly={readOnly}
          required={required}
          value={value}
          {...ariaProps}
        />
      )}
    </FieldShell>
  );
}
