import { useState } from "react";
import type { ChangeEventHandler } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { PasswordToggle } from "../shared/PasswordToggle";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";

type TextFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  placeholder?: string;
  required?: boolean;
  size?: InputControlSize;
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
  size = "md",
  type,
  value,
  onChange,
}: TextFieldProps) {
  const shellAria = useFieldShellAria();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const isSearch = type === "search";
  const inputType = isPassword && revealed ? "text" : type;
  const sizeClass = inputControlSizeClassName[size];

  const inputEl = (
    <input
      aria-invalid={error ? "true" : undefined}
      className={[
        isSearch ? shared.searchInput : shared.input,
        error ? shared.error : "",
        isPassword ? shared.passwordInput : "",
      ]
        .filter(Boolean)
        .join(" ")}
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
      {isSearch ? (
        <div
          className={[
            sizeClass,
            shared.searchWrap,
            error ? shared.searchWrapError : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <span aria-hidden="true" className={shared.prefixIcon}>
            <FontAwesomeIcon className={shared.prefixIconSvg} icon={faMagnifyingGlass} />
          </span>
          {inputEl}
        </div>
      ) : isPassword ? (
        <div className={`${shared.passwordWrap} ${sizeClass}`}>
          {inputEl}
          <PasswordToggle
            controlsId={id}
            visible={revealed}
            onToggle={() => setRevealed((current) => !current)}
          />
        </div>
      ) : (
        <div className={sizeClass}>{inputEl}</div>
      )}
    </FieldShell>
  );
}
