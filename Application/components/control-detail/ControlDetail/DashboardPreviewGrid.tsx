"use client";

import type { ReactNode } from "react";
import { DashboardContentContainer } from "opus-react";
import {
  dashboardPreviewCount,
  type DashboardPreviewLayout,
} from "@/lib/controls/dashboardPreview";
import styles from "./ControlDetail.module.css";

type DashboardPreviewGridProps = {
  containerDataComponent?: string;
  containerHeight?: "auto" | "full";
  containerTitle?: string;
  containerWidth?: "full" | "widget";
  layout: DashboardPreviewLayout;
  renderItem: (index: number) => ReactNode;
  unwrapped?: boolean;
};

export function DashboardPreviewGrid({
  containerDataComponent,
  containerHeight = "auto",
  containerTitle,
  containerWidth = "widget",
  layout,
  renderItem,
  unwrapped = false,
}: DashboardPreviewGridProps) {
  const count = dashboardPreviewCount(layout);

  return (
    <div className={styles.dashboardPreviewGrid} data-count={count}>
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.dashboardPreviewItem} key={index}>
          {unwrapped ? (
            renderItem(index)
          ) : (
            <DashboardContentContainer
              data-component={containerDataComponent}
              height={containerHeight}
              title={containerTitle}
              width={containerWidth}
            >
              {renderItem(index)}
            </DashboardContentContainer>
          )}
        </div>
      ))}
    </div>
  );
}
