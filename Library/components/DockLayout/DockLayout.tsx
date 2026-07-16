"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "./DockLayout.module.css";

export type DockLayoutProps = {
  bottom?: ReactNode;
  children: ReactNode;
  className?: string;
  left?: ReactNode;
  right?: ReactNode;
  style?: CSSProperties;
  top?: ReactNode;
};

export function DockLayout({
  bottom,
  children,
  className,
  left,
  right,
  style,
  top,
}: DockLayoutProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
      {top ? <div className={styles.top}>{top}</div> : null}
      <div className={styles.middle}>
        {left ? <aside className={styles.left}>{left}</aside> : null}
        <div className={styles.center}>{children}</div>
        {right ? <aside className={styles.right}>{right}</aside> : null}
      </div>
      {bottom ? <div className={styles.bottom}>{bottom}</div> : null}
    </div>
  );
}
