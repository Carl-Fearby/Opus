import type { CSSProperties, ReactNode } from "react";
import styles from "./Grid.module.css";

export type GridBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
/** Column counts per breakpoint, e.g. `{ base: 1, sm: 2, lg: 3 }`. */
export type GridColumns = Partial<Record<GridBreakpoint, number>>;

export type GridProps = {
  children: ReactNode;
  className?: string;
  /** Fixed column count, any `grid-template-columns` value, or a breakpoint map. */
  columns?: number | string | GridColumns;
  gap?: number | string;
  minItemWidth?: number | string;
  style?: CSSProperties;
};

function isColumnMap(columns: GridProps["columns"]): columns is GridColumns {
  return typeof columns === "object" && columns !== null;
}

function toCssValue(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function Grid({
  children,
  className,
  columns = 3,
  gap = 12,
  minItemWidth,
  style,
}: GridProps) {
  const columnMap = isColumnMap(columns) ? columns : null;
  const responsiveColumns = columnMap
    ? (Object.fromEntries(
        (["base", "sm", "md", "lg", "xl"] as const)
          .filter((breakpoint) => columnMap[breakpoint] !== undefined)
          .map((breakpoint) => [`--grid-cols-${breakpoint}`, String(columnMap[breakpoint])]),
      ) as unknown as CSSProperties)
    : null;

  const fixedColumns =
    minItemWidth !== undefined
      ? `repeat(auto-fit, minmax(${toCssValue(minItemWidth)}, 1fr))`
      : typeof columns === "string"
        ? columns
        : `repeat(${columns as number}, minmax(0, 1fr))`;

  return (
    <div
      className={[styles.grid, className].filter(Boolean).join(" ")}
      data-responsive={columnMap ? true : undefined}
      style={{
        ...style,
        gap: toCssValue(gap),
        ...(columnMap ? responsiveColumns : { gridTemplateColumns: fixedColumns }),
      }}
    >
      {children}
    </div>
  );
}
