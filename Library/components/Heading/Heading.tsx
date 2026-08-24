import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Heading.module.css";

export type HeadingSize = 100 | 200 | 300 | 400 | 500;
export type HeadingPadding = "snug" | "compact" | "comfortable" | "relaxed" | "cozy";
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingWeight = 300 | 400 | 500 | 600 | 700;

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  children: ReactNode;
  /** Semantic heading level. */
  level?: HeadingLevel;
  /** Vertical spacing preset. `snug` applies no padding. */
  padding?: HeadingPadding;
  /** Type scale token from 100 (smallest) to 500 (largest). */
  size?: HeadingSize;
  /** Available font weight token. */
  weight?: HeadingWeight;
};

export function Heading({ children, className, level = 2, padding = "snug", size = 300, weight = 700, ...props }: HeadingProps) {
  const Element = `h${level}` as const;
  return <Element {...props} className={[styles.heading, className].filter(Boolean).join(" ")} data-padding={padding} data-size={size} data-weight={weight}>{children}</Element>;
}
