import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Text.module.css";

export type TextSize = 100 | 200 | 300 | 400 | 500;
/** Pixel-exact sizes for UI chrome that the 100–500 scale cannot express. */
export type TextNamedSize = "2xs" | "xs" | "sm";
export type TextPadding = "snug" | "compact" | "comfortable" | "relaxed" | "cozy";
export type TextElement = "p" | "span" | "div";
export type TextWeight = 300 | 400 | 500 | 600 | 700;
export type TextTone = "default" | "muted" | "accent" | "danger" | "success" | "warning";

export type TextProps = HTMLAttributes<HTMLElement> & {
  /** The semantic HTML element to render. */
  as?: TextElement;
  children: ReactNode;
  /** Clamp the text to this many lines, adding an ellipsis when it overflows. */
  lineClamp?: number;
  /** Vertical spacing preset. `snug` applies no padding. */
  padding?: TextPadding;
  /** Type scale token from 100 (smallest) to 500 (largest), or a named 11/13/15px size. */
  size?: TextSize | TextNamedSize;
  /** Semantic text colour. */
  tone?: TextTone;
  /** Truncate to a single line with an ellipsis. */
  truncate?: boolean;
  /** Available font weight token. */
  weight?: TextWeight;
};

export function Text({
  as: Element = "p",
  children,
  className,
  lineClamp,
  padding = "snug",
  size = 300,
  style,
  tone = "default",
  truncate = false,
  weight = 400,
  ...props
}: TextProps) {
  const clamped = typeof lineClamp === "number" && lineClamp > 0;

  return (
    <Element
      {...props}
      className={[styles.text, className].filter(Boolean).join(" ")}
      data-clamp={clamped || undefined}
      data-padding={padding}
      data-size={size}
      data-tone={tone}
      data-truncate={truncate || undefined}
      data-weight={weight}
      style={clamped ? { ...style, WebkitLineClamp: lineClamp } : style}
    >
      {children}
    </Element>
  );
}
