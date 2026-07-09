import type { CSSProperties, ReactNode } from "react";
import styles from "./Grid.module.css";

export type GridProps = {
  children: ReactNode;
  className?: string;
  columns?: number | string;
  gap?: number | string;
  minItemWidth?: number | string;
  style?: CSSProperties;
};

export function Grid({
  children,
  className,
  columns = 3,
  gap = 12,
  minItemWidth,
  style,
}: GridProps) {
  const gridTemplateColumns = minItemWidth
    ? `repeat(auto-fit, minmax(${typeof minItemWidth === "number" ? `${minItemWidth}px` : minItemWidth}, 1fr))`
    : typeof columns === "number"
      ? `repeat(${columns}, minmax(0, 1fr))`
      : columns;

  return (
    <div
      className={[styles.grid, className].filter(Boolean).join(" ")}
      style={{
        ...style,
        gap: typeof gap === "number" ? `${gap}px` : gap,
        gridTemplateColumns,
      }}
    >
      {children}
    </div>
  );
}
