import type { ReactNode } from "react";
import styles from "./Toolbar.module.css";

export type ToolbarProps = {
  children: ReactNode;
  className?: string;
  dense?: boolean;
  end?: ReactNode;
  label?: string;
  start?: ReactNode;
};

export function Toolbar({ children, className, dense = false, end, label, start }: ToolbarProps) {
  return (
    <div
      aria-label={label ?? "Toolbar"}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-dense={dense || undefined}
      role="toolbar"
    >
      {start ? <div className={styles.cluster}>{start}</div> : null}
      <div className={styles.cluster}>{children}</div>
      {end ? <div className={`${styles.cluster} ${styles.end}`}>{end}</div> : null}
    </div>
  );
}
