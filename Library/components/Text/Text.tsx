import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import styles from "./Text.module.css";

export type TextSize = 100 | 200 | 300 | 400 | 500;
/** Pixel-exact sizes for UI chrome that the 100–500 scale cannot express. */
export type TextNamedSize = "2xs" | "xs" | "sm";
export type TextPadding = "snug" | "compact" | "comfortable" | "relaxed" | "cozy";
export type TextElement = "p" | "span" | "div";
export type TextWeight = 300 | 400 | 500 | 600 | 700;
export type TextTone = "default" | "muted" | "accent" | "danger" | "success" | "warning";
export type TextAlign = "left" | "center" | "right";
export type TextLeading = "none" | "tight" | "snug" | "normal" | "relaxed" | "loose";
export type TextTracking = "tighter" | "tight" | "normal" | "wide" | "wider" | "widest";
/** Numbers below 100 are read as pixels, so `size={11}` means 11px. */
export type TextSizeValue = TextSize | TextNamedSize | number;

export type TextProps = HTMLAttributes<HTMLElement> & {
  /** Horizontal text alignment. */
  align?: TextAlign;
  /** The semantic HTML element to render. */
  as?: TextElement;
  children: ReactNode;
  /** Line-height preset. */
  leading?: TextLeading;
  /** Clamp the text to this many lines, adding an ellipsis when it overflows. */
  lineClamp?: number;
  /** Vertical spacing preset. `snug` applies no padding. */
  padding?: TextPadding;
  /** Type scale token from 100 (smallest) to 500 (largest), a named 11/13/15px size, or a pixel value below 100. */
  size?: TextSizeValue;
  /** Semantic text colour. */
  tone?: TextTone;
  /** Letter-spacing preset. Overrides the spacing `uppercase` applies. */
  tracking?: TextTracking;
  /** Truncate to a single line with an ellipsis. */
  truncate?: boolean;
  /** Uppercase the text, with a small built-in letter-spacing. */
  uppercase?: boolean;
  /** Available font weight token. */
  weight?: TextWeight;
};

export function Text({
  align,
  as: Element = "p",
  children,
  className,
  leading,
  lineClamp,
  padding = "snug",
  size = 300,
  style,
  tone = "default",
  tracking,
  truncate = false,
  uppercase = false,
  weight = 400,
  ...props
}: TextProps) {
  const clamped = typeof lineClamp === "number" && lineClamp > 0;
  const pixelSize = typeof size === "number" && size < 100 ? size : null;
  const mergedStyle = { ...style } as CSSProperties;

  if (pixelSize !== null) {
    mergedStyle.fontSize = `${pixelSize}px`;
  }
  if (clamped) {
    mergedStyle.WebkitLineClamp = lineClamp;
  }

  return (
    <Element
      {...props}
      className={[styles.text, className].filter(Boolean).join(" ")}
      data-align={align}
      data-clamp={clamped || undefined}
      data-leading={leading}
      data-padding={padding}
      data-size={pixelSize === null ? size : undefined}
      data-tone={tone}
      data-tracking={tracking}
      data-truncate={truncate || undefined}
      data-uppercase={uppercase || undefined}
      data-weight={weight}
      style={mergedStyle}
    >
      {children}
    </Element>
  );
}
