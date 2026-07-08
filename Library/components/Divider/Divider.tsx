import type { DividerOrientation, DividerTone } from "@/components/fields/types";
import styles from "./Divider.module.css";

type DividerProps = {
  label?: string;
  orientation?: DividerOrientation;
  tone?: DividerTone;
};

export function Divider({
  label,
  orientation = "horizontal",
  tone = "default",
}: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div
        aria-orientation="vertical"
        className={styles.divider}
        data-orientation="vertical"
        data-tone={tone}
        role="separator"
      />
    );
  }

  if (label) {
    return (
      <div className={styles.labelled} data-tone={tone} role="separator">
        <span aria-hidden="true" className={styles.line} />
        <span className={styles.label}>{label}</span>
        <span aria-hidden="true" className={styles.line} />
      </div>
    );
  }

  return (
    <hr
      className={styles.divider}
      data-orientation="horizontal"
      data-tone={tone}
    />
  );
}
