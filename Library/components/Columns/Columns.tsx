import { Children, type CSSProperties, type ReactNode } from "react";
import styles from "./Columns.module.css";

export type ColumnsDirection = "column" | "row";

export type ColumnsProps = {
  children: ReactNode;
  className?: string;
  columns?: number;
  direction?: ColumnsDirection;
  gap?: number | string;
  style?: CSSProperties;
};

export function Columns({
  children,
  className,
  columns = 3,
  direction = "row",
  gap = 16,
  style,
}: ColumnsProps) {
  const columnCount = direction === "column" ? 1 : Math.max(1, columns);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-direction={direction}
      style={
        {
          ...style,
          "--columns-count": columnCount,
          gap: typeof gap === "number" ? `${gap}px` : gap,
        } as CSSProperties
      }
    >
      {Children.toArray(children)
        .filter(Boolean)
        .map((child, index) => (
          <div className={styles.cell} key={index}>
            {child}
          </div>
        ))}
    </div>
  );
}
