import type { ReactNode } from "react";
import styles from "./DashboardContentContainer.module.css";

export type DashboardContentContainerWidth = "full" | "widget";

export type DashboardContentContainerProps = {
  children: ReactNode;
  className?: string;
  "data-component"?: string;
  title?: string;
  width?: DashboardContentContainerWidth;
};

export function DashboardContentContainer({
  children,
  className,
  "data-component": dataComponent = "dashboard-content-container",
  title,
  width = "widget",
}: DashboardContentContainerProps) {
  return (
    <article
      className={[styles.container, className].filter(Boolean).join(" ")}
      data-component={dataComponent}
      data-width={width}
    >
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {children}
    </article>
  );
}
