import type { ReactNode } from "react";
import type { SurfaceDensity } from "@/components/fields/types";
import { Sparkline } from "@/components/Sparkline";
import layout from "@/components/dashboardMetricCardLayout/dashboardMetricCardLayout.module.css";
import styles from "./MetricTile.module.css";

const SPARKLINE_HEIGHT = 56;

type MetricTileProps = {
  density?: SurfaceDensity;
  icon?: ReactNode;
  label: string;
  sparkline?: number[];
  value: string;
};

export function MetricTile({ density = "comfortable", icon, label, sparkline, value }: MetricTileProps) {
  return (
    <div className={`${layout.shell} ${styles.tile}`} data-density={density}>
      <div className={styles.topRow}>
        <span className={layout.iconSlot}>
          {icon ?? <span aria-hidden="true" className={layout.iconPlaceholder} />}
        </span>
        {sparkline ? (
          <div className={styles.sparklineSlot}>
            <Sparkline height={SPARKLINE_HEIGHT} values={sparkline} variant="inline" width={112} />
          </div>
        ) : null}
      </div>
      <p className={layout.label}>{label}</p>
      <p className={layout.value}>{value}</p>
    </div>
  );
}
