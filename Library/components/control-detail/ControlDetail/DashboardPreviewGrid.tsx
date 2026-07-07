"use client";

import type { ReactNode } from "react";
import {
  dashboardPreviewCount,
  type DashboardPreviewLayout,
} from "@/lib/controls/dashboardPreview";
import styles from "./ControlDetail.module.css";

type DashboardPreviewGridProps = {
  layout: DashboardPreviewLayout;
  renderItem: (index: number) => ReactNode;
};

export function DashboardPreviewGrid({ layout, renderItem }: DashboardPreviewGridProps) {
  const count = dashboardPreviewCount(layout);

  return (
    <div className={styles.dashboardPreviewGrid} data-count={count}>
      {Array.from({ length: count }, (_, index) => (
        <div className={styles.dashboardPreviewItem} key={index}>
          {renderItem(index)}
        </div>
      ))}
    </div>
  );
}
