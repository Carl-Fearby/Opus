import { useId, type ChangeEventHandler } from "react";
import styles from "./TextAreaField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import type { NativeTextAreaProps, TextEntryBehaviourProps } from "../shared/nativeFieldProps";

export type TextAreaFieldProps = TextEntryBehaviourProps & {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  maxChars?: number;
  minLength?: number;
  inputProps?: NativeTextAreaProps;
  mode?: FieldMode;
  placeholder?: string;
  required?: boolean;
  size?: InputControlSize;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
};

export function TextAreaField({
  autoCapitalize,
  autoComplete,
  autoCorrect,
  autoFocus,
  disabled,
  enterKeyHint,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  maxChars,
  minLength,
  inputMode,
  inputProps,
  mode = "stacked",
  placeholder,
  required,
  name,
  readOnly,
  size = "md",
  value,
  spellCheck,
  onChange,
}: TextAreaFieldProps) {
  const shellAria = useFieldShellAria();
  const charCountId = useId();
  const charCount = value.length;
  const showCharCount = maxChars !== undefined;
  const describedBy = [shellAria?.describedBy, showCharCount ? charCountId : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <FieldShell
      error={error}
      flaggedAlign="start"
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
      suppressErrorDisplay={showCharCount}
    >
      <div className={styles.field}>
        <div className={`${styles.inputWrap} ${inputControlSizeClassName[size]}`}>
          <textarea
            {...inputProps}
            aria-invalid={error ? "true" : undefined}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            autoFocus={autoFocus}
            className={[
              styles.textarea,
              error ? styles.error : "",
              showCharCount ? styles.withCount : "",
            ]
              .filter(Boolean)
              .join(" ")}
            id={id}
            disabled={disabled}
            enterKeyHint={enterKeyHint}
            inputMode={inputMode}
            maxLength={maxChars}
            minLength={minLength}
            name={name}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            required={required}
            spellCheck={spellCheck}
            value={value}
            {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
            aria-describedby={describedBy || undefined}
          />
          {showCharCount ? (
            <span aria-hidden="true" className={styles.inlineCount}>
              {charCount} / {maxChars}
            </span>
          ) : null}
        </div>
        {showCharCount ? (
          <div className={styles.footer}>
            {error ? (
              <p className={styles.footerError} id={shellAria?.errorId} role="alert">
                {error}
              </p>
            ) : (
              <span />
            )}
            <span className={styles.externalCount} id={charCountId}>
              {charCount} / {maxChars} characters
            </span>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
