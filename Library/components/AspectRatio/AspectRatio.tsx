import type { CSSProperties, ReactNode } from "react";
import styles from "./AspectRatio.module.css";

export type AspectRatioProps = {
  children: ReactNode;
  className?: string;
  ratio?: number | string;
  style?: CSSProperties;
};

export function AspectRatio({ children, className, ratio = "16 / 9", style }: AspectRatioProps) {
  const resolved =
    typeof ratio === "number" ? String(ratio) : ratio.includes("/") ? ratio : ratio;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={{ ...style, aspectRatio: resolved }}
    >
      <div className={styles.content}>{children}</div>
    </div>
  );
}
