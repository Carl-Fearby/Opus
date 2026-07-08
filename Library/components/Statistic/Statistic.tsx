import type { StatisticTrend } from "@/components/fields/types";
import styles from "./Statistic.module.css";

type StatisticProps = {
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: StatisticTrend;
  trendLabel?: string;
  value: string;
};

export function Statistic({
  label,
  prefix,
  suffix,
  trend,
  trendLabel,
  value,
}: StatisticProps) {
  return (
    <div className={styles.root}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>
        {prefix ? <span className={styles.affix}>{prefix}</span> : null}
        <span>{value}</span>
        {suffix ? <span className={styles.affix}>{suffix}</span> : null}
      </p>
      {trend && trendLabel ? (
        <p className={styles.trend} data-trend={trend}>
          <span aria-hidden="true">
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </span>
          {trendLabel}
        </p>
      ) : null}
    </div>
  );
}
