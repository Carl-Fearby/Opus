import { useId, type ChangeEventHandler } from "react";
import styles from "./TextAreaField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";

type TextAreaFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  maxChars?: number;
  mode?: FieldMode;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
};

export function TextAreaField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  maxChars,
  mode = "stacked",
  placeholder,
  required,
  value,
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
        <div className={styles.inputWrap}>
          <textarea
            aria-invalid={error ? "true" : undefined}
            className={[
              styles.textarea,
              error ? styles.error : "",
              showCharCount ? styles.withCount : "",
            ]
              .filter(Boolean)
              .join(" ")}
            id={id}
            maxLength={maxChars}
            onChange={onChange}
            placeholder={placeholder}
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
