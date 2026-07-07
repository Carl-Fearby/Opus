import styles from "./CheckboxField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { ChoiceShape, FieldMode, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";

type CheckboxFieldProps = {
  checked: boolean;
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  shape?: ChoiceShape;
};

export function CheckboxField({
  checked,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "flagged",
  onChange,
  shape = "square",
}: CheckboxFieldProps) {
  const shellAria = useFieldShellAria();

  return (
    <FieldShell
      className={styles.shell}
      compactControl
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="label"
      mode={mode}
    >
      <div className={styles.toggle}>
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
      </div>
    </FieldShell>
  );
}
