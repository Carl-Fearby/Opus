import type { CSSProperties, ReactNode } from "react";
import styles from "./Stack.module.css";

export type StackAlign = "start" | "center" | "end" | "stretch";
export type StackJustify = "start" | "center" | "end" | "between" | "around";
export type StackDirection = "row" | "column";

export type StackProps = {
  align?: StackAlign;
  children: ReactNode;
  className?: string;
  direction?: StackDirection;
  gap?: number | string;
  justify?: StackJustify;
  style?: CSSProperties;
  wrap?: boolean;
};

export function Stack({
  align = "stretch",
  children,
  className,
  direction = "column",
  gap = 12,
  justify = "start",
  style,
  wrap = false,
}: StackProps) {
  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(" ")}
      data-align={align}
      data-direction={direction}
      data-justify={justify}
      data-wrap={wrap || undefined}
      style={{ ...style, gap: typeof gap === "number" ? `${gap}px` : gap }}
    >
      {children}
    </div>
  );
}
