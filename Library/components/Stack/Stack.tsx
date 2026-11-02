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
  /** Caps the stack width. Numbers are pixels, strings are any CSS length. */
  maxWidth?: number | string;
  /** Inner spacing. Numbers are pixels, strings are any CSS shorthand value. */
  padding?: number | string;
  style?: CSSProperties;
  wrap?: boolean;
};

function toCssValue(value: number | string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  return typeof value === "number" ? `${value}px` : value;
}

export function Stack({
  align = "stretch",
  children,
  className,
  direction = "column",
  gap = 12,
  justify = "start",
  maxWidth,
  padding,
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
      style={{
        ...style,
        gap: toCssValue(gap),
        maxWidth: toCssValue(maxWidth),
        padding: toCssValue(padding),
      }}
    >
      {children}
    </div>
  );
}
