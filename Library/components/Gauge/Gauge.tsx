import type { CSSProperties } from "react";
import type { SurfaceDensity } from "@/components/fields/types";
import styles from "./Gauge.module.css";

export type GaugeTrend = "up" | "down";
export type GaugeVariant = "half" | "full";

export type GaugeFooterItem = {
  color?: string;
  label: string;
  trend?: GaugeTrend;
  value: string;
};

type GaugeProps = {
  change?: string;
  changeTrend?: GaugeTrend;
  density?: SurfaceDensity;
  footer?: GaugeFooterItem[];
  subtitle?: string;
  summary?: string;
  title: string;
  trackColor?: string;
  value: number;
  valueColor?: string;
  variant?: GaugeVariant;
};

function GaugeArc({
  trackColor,
  value,
  valueColor,
  variant,
}: {
  trackColor?: string;
  value: number;
  valueColor?: string;
  variant: GaugeVariant;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const style = {
    "--gauge-track": trackColor,
    "--gauge-value": valueColor,
  } as CSSProperties;
  const valueDashArray = `${clamped} 100`;

  if (variant === "full") {
    return (
      <div className={styles.gauge} data-variant="full" style={style}>
        <svg aria-hidden="true" className={styles.gaugeSvg} viewBox="0 0 220 220">
          <circle
            className={styles.gaugeTrack}
            cx="110"
            cy="110"
            pathLength={100}
            r="82"
          />
          <circle
            className={styles.gaugeValue}
            cx="110"
            cy="110"
            pathLength={100}
            r="82"
            strokeDasharray={valueDashArray}
          />
        </svg>
        <div className={styles.gaugeCenter}>
          <strong>{Math.round(clamped)}%</strong>
          <span>{clamped.toFixed(2)} score</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gauge} data-variant="half" style={style}>
      <svg aria-hidden="true" className={styles.gaugeSvg} viewBox="0 0 220 130">
        <path
          className={styles.gaugeTrack}
          d="M 22 118 A 88 88 0 0 1 198 118"
          pathLength={100}
        />
        <path
          className={styles.gaugeValue}
          d="M 22 118 A 88 88 0 0 1 198 118"
          pathLength={100}
          strokeDasharray={valueDashArray}
        />
      </svg>
      <div className={styles.gaugeCenter}>
        <strong>{Math.round(clamped)}%</strong>
        <span>{clamped.toFixed(2)} score</span>
      </div>
    </div>
  );
}

export function Gauge({
  change,
  changeTrend = "up",
  density = "comfortable",
  footer,
  subtitle,
  summary,
  title,
  trackColor,
  value,
  valueColor,
  variant = "half",
}: GaugeProps) {
  return (
    <section className={styles.widget} data-density={density} data-variant={variant}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.gaugeSlot}>
          <GaugeArc trackColor={trackColor} value={value} valueColor={valueColor} variant={variant} />
        </div>
        {change ? (
          <span className={styles.change} data-trend={changeTrend}>
            {changeTrend === "up" ? "↑" : "↓"} {change}
          </span>
        ) : null}
        {summary ? <p className={styles.summary}>{summary}</p> : null}
      </div>

      {footer?.length ? (
        <footer className={styles.footer} data-count={footer.length}>
          {footer.map((item, index) => (
            <div
              className={styles.footerItem}
              key={`${item.label}-${index}`}
              style={{ "--gauge-footer-color": item.color } as CSSProperties}
            >
              <span className={styles.footerLabel}>{item.label}</span>
              <span className={styles.footerValue}>
                {item.value}
                {item.trend ? (
                  <span aria-hidden="true" className={styles.footerTrend} data-trend={item.trend}>
                    {item.trend === "up" ? "↑" : "↓"}
                  </span>
                ) : null}
              </span>
            </div>
          ))}
        </footer>
      ) : null}
    </section>
  );
}
