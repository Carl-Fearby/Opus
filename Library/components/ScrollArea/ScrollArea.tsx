import type { CSSProperties, ReactNode } from "react";
import styles from "./ScrollArea.module.css";

export type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  maxHeight?: number | string;
  orientation?: "vertical" | "horizontal" | "both";
  style?: CSSProperties;
};

export function ScrollArea({
  children,
  className,
  maxHeight = 240,
  orientation = "vertical",
  style,
}: ScrollAreaProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-orientation={orientation}
      style={{
        ...style,
        maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
      }}
    >
      <div className={styles.viewport}>{children}</div>
    </div>
  );
}
