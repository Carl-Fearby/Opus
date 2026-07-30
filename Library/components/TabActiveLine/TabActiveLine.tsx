import type { CSSProperties } from "react";
import styles from "./TabActiveLine.module.css";

export type TabActiveLineOrientation = "horizontal" | "vertical";

export type TabActiveLineProps = {
  className?: string;
  orientation?: TabActiveLineOrientation;
  style?: CSSProperties;
};

export function TabActiveLine({ className, orientation = "horizontal", style }: TabActiveLineProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.line, className].filter(Boolean).join(" ")}
      data-orientation={orientation}
      style={style}
    />
  );
}
