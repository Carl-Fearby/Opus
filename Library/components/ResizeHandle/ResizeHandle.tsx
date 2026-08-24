"use client";

import type { ComponentPropsWithoutRef } from "react";
import styles from "./ResizeHandle.module.css";

export type ResizeHandleBackground = "accent" | "contrast" | "none" | "subtle";
export type ResizeHandleHeight = "full" | "medium" | "short" | "tall";
export type ResizeHandleOrientation = "horizontal" | "vertical";

export type ResizeHandleProps = Omit<ComponentPropsWithoutRef<"button">, "type"> & {
  background?: ResizeHandleBackground;
  height?: ResizeHandleHeight;
  orientation: ResizeHandleOrientation;
  /** Keeps the resize track transparent, including on hover and focus. */
  transparent?: boolean;
};

export function ResizeHandle({
  background = "subtle",
  className,
  height = "medium",
  orientation,
  transparent = false,
  ...props
}: ResizeHandleProps) {
  return (
    <button
      {...props}
      aria-orientation={orientation}
      className={[styles.handle, className].filter(Boolean).join(" ")}
      data-background={transparent ? "none" : background}
      data-height={height}
      data-orientation={orientation}
      role="separator"
      type="button"
    >
      <span aria-hidden="true" className={styles.grip}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </span>
    </button>
  );
}
