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
  const nextTheme: Theme = value === "light" ? "dark" : "light";

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
      <button
        aria-label={`Switch to ${nextTheme} theme`}
        aria-pressed={value === "dark"}
        className={styles.toggle}
        onClick={() => onChange(nextTheme)}
        type="button"
      >
        <span
          aria-hidden="true"
          className={styles.indicator}
          data-active={value}
        />
        <span
          aria-hidden="true"
          className={`${styles.option} ${value === "light" ? styles.active : ""}`}
        >
          <FontAwesomeIcon aria-hidden="true" icon={faSun} />
        </span>
        <span
          aria-hidden="true"
          className={`${styles.option} ${value === "dark" ? styles.active : ""}`}
        >
          <FontAwesomeIcon aria-hidden="true" icon={faMoon} />
        </span>
      </button>
    </FieldShell>
  );
}
