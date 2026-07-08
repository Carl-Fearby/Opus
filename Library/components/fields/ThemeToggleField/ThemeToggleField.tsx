import "@/lib/fontawesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import styles from "./ThemeToggleField.module.css";
import { FieldShell } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition, Theme } from "@/components/fields/types";

type ThemeToggleFieldProps = {
  className?: string;
  help?: string;
  id: string;
  label?: string;
  labelPosition?: LabelPosition;
  labelVisuallyHidden?: boolean;
  mode?: FieldMode;
  value: Theme;
  onChange: (value: Theme) => void;
};

export function ThemeToggleField({
  className,
  help,
  id,
  label = "Theme",
  labelPosition = "left",
  labelVisuallyHidden,
  mode = "flagged",
  value,
  onChange,
}: ThemeToggleFieldProps) {
  return (
    <FieldShell
      className={className}
      fitContent
      flaggedAlign="center"
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="div"
      labelVisuallyHidden={labelVisuallyHidden}
      mode={mode}
    >
      <div className={styles.toggle} role="group" aria-label={label}>
        <span
          aria-hidden="true"
          className={styles.indicator}
          data-active={value}
        />
        <button
          aria-label="Light theme"
          aria-pressed={value === "light"}
          className={`${styles.option} ${value === "light" ? styles.active : ""}`}
          onClick={() => onChange("light")}
          type="button"
        >
          <FontAwesomeIcon aria-hidden="true" icon={faSun} />
        </button>
        <button
          aria-label="Dark theme"
          aria-pressed={value === "dark"}
          className={`${styles.option} ${value === "dark" ? styles.active : ""}`}
          onClick={() => onChange("dark")}
          type="button"
        >
          <FontAwesomeIcon aria-hidden="true" icon={faMoon} />
        </button>
      </div>
    </FieldShell>
  );
}
