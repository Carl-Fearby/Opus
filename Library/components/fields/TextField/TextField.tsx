import { useState } from "react";
import type { ChangeEventHandler } from "react";
import styles from "./TextField.module.css";
import shared from "../shared/fieldControl.module.css";
import { PasswordToggle } from "../shared/PasswordToggle";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";

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
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  const inputEl = (
    <input
      aria-invalid={error ? "true" : undefined}
      className={`${styles.input} ${error ? styles.error : ""} ${
        isPassword ? shared.passwordInput : ""
      }`}
      id={id}
      placeholder={placeholder}
      onChange={onChange}
      type={inputType}
      value={value}
      {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
    />
  );

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
      {isPassword ? (
        <div className={shared.passwordWrap}>
          {inputEl}
          <PasswordToggle
            controlsId={id}
            visible={revealed}
            onToggle={() => setRevealed((current) => !current)}
          />
        </div>
      ) : (
        inputEl
      )}
    </FieldShell>
  );
}
