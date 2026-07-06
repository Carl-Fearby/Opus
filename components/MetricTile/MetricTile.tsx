import type { ReactNode } from "react";
import type { SurfaceDensity } from "@/components/fields/types";
import { Sparkline } from "@/components/Sparkline";
import layout from "@/components/dashboardMetricCardLayout/dashboardMetricCardLayout.module.css";
import styles from "./MetricTile.module.css";

const SPARKLINE_HEIGHT = 72;

type MetricTileProps = {
  density?: SurfaceDensity;
  icon?: ReactNode;
  label: string;
  sparkline?: number[];
  value: string;
};

export function MetricTile({ density = "comfortable", icon, label, sparkline, value }: MetricTileProps) {
  return (
    <article className={`${layout.shell} ${styles.tile}`} data-density={density}>
      <div className={layout.header}>
        <span className={layout.iconSlot}>
          {icon ?? <span aria-hidden="true" className={layout.iconPlaceholder} />}
        </span>
        <div className={layout.metaSlot}>
          <span aria-hidden="true" className={layout.metaPlaceholder}>
            ↑ 00.00%
          </span>
        </div>
      </div>
      <p className={layout.label}>{label}</p>
      <p className={layout.value}>{value}</p>
      <div aria-hidden="true" className={styles.sparklineRail}>
        {sparkline ? (
          <Sparkline height={SPARKLINE_HEIGHT} values={sparkline} variant="inline" width={120} />
        ) : (
          <span className={styles.sparklineReserve} />
        )}
      </div>
    </article>
  );
}
