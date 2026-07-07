import styles from "./HiddenField.module.css";
import { FieldShell } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";

type HiddenFieldProps = {
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  name?: string;
  required?: boolean;
  value: string;
};

export function HiddenField({
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  name,
  required,
  value,
}: HiddenFieldProps) {
  const fieldName = name ?? id;

  return (
    <FieldShell
      help={help ?? "Hidden fields are not visible to users but submit with the form."}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div className={styles.preview}>
        <input
          id={id}
          name={fieldName}
          type="hidden"
          value={value}
        />
        <p className={styles.note}>Not visible in the UI</p>
        <code className={styles.meta}>
          name=&quot;{fieldName}&quot; value=&quot;{value}&quot;
        </code>
      </div>
    </FieldShell>
  );
}
