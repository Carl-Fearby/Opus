import type { ReactNode } from "react";
import styles from "./VisuallyHidden.module.css";

type VisuallyHiddenProps = {
  as?: "span" | "div";
  children: ReactNode;
};

export function VisuallyHidden({ as = "span", children }: VisuallyHiddenProps) {
  const Tag = as;
  return <Tag className={styles.hidden}>{children}</Tag>;
}
