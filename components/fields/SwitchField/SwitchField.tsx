import styles from "./SwitchField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";

type SwitchFieldProps = {
  checked: boolean;
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function SwitchField({
  checked,
  error,
  help,
  id,
  label,
  labelPosition = "right",
  mode = "flagged",
  onChange,
}: SwitchFieldProps) {
  const shellAria = useFieldShellAria();

  return (
    <FieldShell
      className={styles.shell}
      error={error}
      fitContent={mode === "flagged"}
      flaggedAlign="center"
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="label"
      mode={mode}
    >
      <div className={styles.toggle}>
        <input
          aria-checked={checked}
          aria-invalid={error ? "true" : undefined}
          className={`${styles.track} ${error ? styles.error : ""}`}
          checked={checked}
          id={id}
          onChange={onChange}
          role="switch"
          type="checkbox"
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        />
      </div>
    </FieldShell>
  );
}
