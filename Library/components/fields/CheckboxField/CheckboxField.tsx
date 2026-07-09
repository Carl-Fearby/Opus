import styles from "./CheckboxField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import { choiceControlSizeClassName } from "@/components/fields/shared/choiceControlSizes";
import type { ChangeEventHandler } from "react";
import type { ChoiceControlSize, ChoiceShape, FieldMode, LabelPosition } from "@/components/fields/types";

type CheckboxFieldProps = {
  checked: boolean;
  className?: string;
  error?: string;
  fitContent?: boolean;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  labelVisuallyHidden?: boolean;
  mode?: FieldMode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  shape?: ChoiceShape;
  size?: ChoiceControlSize;
};

export function CheckboxField({
  checked,
  className,
  error,
  fitContent,
  help,
  id,
  label,
  labelPosition = "left",
  labelVisuallyHidden,
  mode = "flagged",
  onChange,
  shape = "square",
  size = "md",
}: CheckboxFieldProps) {
  const shellAria = useFieldShellAria();

  return (
    <FieldShell
      className={[styles.shell, choiceControlSizeClassName[size], className].filter(Boolean).join(" ")}
      compactControl
      error={error}
      fitContent={fitContent}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="label"
      labelVisuallyHidden={labelVisuallyHidden}
      mode={mode}
    >
      <div className={styles.toggle}>
        <label className={styles.toggleLabel} htmlFor={id}>
          <input
            aria-invalid={error ? "true" : undefined}
            className={styles.nativeInput}
            checked={checked}
            id={id}
            onChange={onChange}
            type="checkbox"
            {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
          />
          <span
            aria-hidden="true"
            className={[
              styles.visual,
              shape === "round" ? styles.round : styles.square,
              error ? styles.error : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        </label>
      </div>
    </FieldShell>
  );
}
