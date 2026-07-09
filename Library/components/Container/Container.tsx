import type { CSSProperties, ReactNode } from "react";
import styles from "./Container.module.css";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  size?: ContainerSize;
  style?: CSSProperties;
};

const maxWidths: Record<ContainerSize, string> = {
  sm: "40rem",
  md: "56rem",
  lg: "72rem",
  xl: "88rem",
  full: "100%",
};

export function Container({
  children,
  className,
  padded = true,
  size = "lg",
  style,
}: ContainerProps) {
  return (
    <div
      className={[styles.container, className].filter(Boolean).join(" ")}
      data-padded={padded || undefined}
      style={{ ...style, maxWidth: maxWidths[size] }}
    >
      {children}
    </div>
  );
}
