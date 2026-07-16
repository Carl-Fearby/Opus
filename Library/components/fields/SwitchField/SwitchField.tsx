import styles from "./SwitchField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import type { ChangeEventHandler } from "react";

type SwitchFieldProps = {
  checked: boolean;
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelVisuallyHidden?: boolean;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  size?: InputControlSize;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function SwitchField({
  checked,
  error,
  help,
  id,
  label,
  labelVisuallyHidden,
  labelPosition = "left",
  mode = "flagged",
  size = "md",
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
      labelVisuallyHidden={labelVisuallyHidden}
      mode={mode}
    >
      <div className={`${styles.toggle} ${inputControlSizeClassName[size]}`}>
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
