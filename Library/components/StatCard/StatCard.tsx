import type { ReactNode } from "react";
import type { SurfaceDensity } from "@/components/fields/types";
import layout from "@/components/dashboardMetricCardLayout/dashboardMetricCardLayout.module.css";
import styles from "./StatCard.module.css";

export type StatCardTrend = "up" | "down";

type StatCardProps = {
  change?: string;
  density?: SurfaceDensity;
  icon?: ReactNode;
  label: string;
  trend?: StatCardTrend;
  value: string;
};

export function StatCard({
  change,
  density = "comfortable",
  icon,
  label,
  trend,
  value,
}: StatCardProps) {
  return (
    <div className={layout.shell} data-density={density}>
      <div className={layout.header}>
        <span className={layout.iconSlot}>
          {icon ?? <span aria-hidden="true" className={layout.iconPlaceholder} />}
        </span>
        <div className={layout.metaSlot}>
          {change && trend ? (
            <span className={styles.change} data-trend={trend}>
              {trend === "up" ? "↑" : "↓"} {change}
            </span>
          ) : (
            <span aria-hidden="true" className={layout.metaPlaceholder}>
              ↑ 00.00%
            </span>
          )}
        </div>
      </div>
      <p className={layout.label}>{label}</p>
      <p className={layout.value}>{value}</p>
    </div>
  );
}
