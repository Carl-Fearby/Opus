import type { CSSProperties } from "react";
import styles from "./Spacer.module.css";

export type SpacerProps = {
  axis?: "x" | "y" | "both";
  className?: string;
  flex?: boolean | number;
  size?: number | string;
  style?: CSSProperties;
};

export function Spacer({ axis = "y", className, flex = false, size = 16, style }: SpacerProps) {
  const resolved = typeof size === "number" ? `${size}px` : size;
  const flexValue = flex === true ? 1 : flex === false ? undefined : flex;

  return (
    <div
      aria-hidden="true"
      className={[styles.spacer, className].filter(Boolean).join(" ")}
      data-axis={axis}
      style={{
        ...style,
        flex: flexValue,
        ...(axis === "x" || axis === "both" ? { width: resolved, minWidth: resolved } : null),
        ...(axis === "y" || axis === "both" ? { height: resolved, minHeight: resolved } : null),
      }}
    />
  );
}
