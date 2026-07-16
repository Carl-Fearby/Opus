import type { ReactNode } from "react";
import styles from "./DashboardContentContainer.module.css";

export type DashboardContentContainerWidth = "full" | "widget";
export type DashboardContentContainerHeight = "auto" | "full";

export type DashboardContentContainerProps = {
  children: ReactNode;
  className?: string;
  "data-component"?: string;
  height?: DashboardContentContainerHeight;
  paddingBottom?: boolean;
  paddingLeft?: boolean;
  paddingRight?: boolean;
  paddingTop?: boolean;
  title?: string;
  width?: DashboardContentContainerWidth;
};

export function DashboardContentContainer({
  children,
  className,
  "data-component": dataComponent = "dashboard-content-container",
  height = "auto",
  paddingBottom = true,
  paddingLeft = true,
  paddingRight = true,
  paddingTop = true,
  title,
  width = "widget",
}: DashboardContentContainerProps) {
  return (
    <article
      className={[styles.container, className].filter(Boolean).join(" ")}
      data-component={dataComponent}
      data-height={height}
      data-padding-bottom={paddingBottom ? "true" : "false"}
      data-padding-left={paddingLeft ? "true" : "false"}
      data-padding-right={paddingRight ? "true" : "false"}
      data-padding-top={paddingTop ? "true" : "false"}
      data-width={width}
    >
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      {children}
    </article>
  );
}
