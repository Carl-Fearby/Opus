import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Text.module.css";

export type TextSize = 100 | 200 | 300 | 400 | 500;
export type TextPadding = "snug" | "compact" | "comfortable" | "relaxed" | "cozy";
export type TextElement = "p" | "span" | "div";
export type TextWeight = 300 | 400 | 500 | 600 | 700;

export type TextProps = HTMLAttributes<HTMLElement> & {
  /** The semantic HTML element to render. */
  as?: TextElement;
  children: ReactNode;
  /** Vertical spacing preset. `snug` applies no padding. */
  padding?: TextPadding;
  /** Type scale token from 100 (smallest) to 500 (largest). */
  size?: TextSize;
  /** Available font weight token. */
  weight?: TextWeight;
};

export function Text({ as: Element = "p", children, className, padding = "snug", size = 300, weight = 400, ...props }: TextProps) {
  return <Element {...props} className={[styles.text, className].filter(Boolean).join(" ")} data-padding={padding} data-size={size} data-weight={weight}>{children}</Element>;
}
