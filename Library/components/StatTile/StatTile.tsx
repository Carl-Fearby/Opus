"use client";

import { CatalogIcon } from "@/components/CatalogIcon";
import { TileGradientDefs } from "@/components/Tile/TileGradientDefs";
import styles from "./StatTile.module.css";

export type StatTileTrend = "up" | "down";
export type StatTileTone = "purple" | "blue";

export type StatTileProps = {
  className?: string;
  comparison?: string;
  icon: string;
  label: string;
  onClick?: () => void;
  role?: string;
  tone?: StatTileTone;
  trend?: StatTileTrend;
  trendValue?: string;
  value: string;
};

export function StatTile({
  className,
  comparison,
  icon,
  label,
  onClick,
  role,
  tone = "blue",
  trend,
  trendValue,
  value,
}: StatTileProps) {
  const classNames = [styles.statTile, className].filter(Boolean).join(" ");
  const showTrend = Boolean(trend && trendValue);
  const content = (
    <>
      <TileGradientDefs />
      <div className={styles.body}>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
        {showTrend || comparison ? (
          <div className={styles.meta}>
            {showTrend ? (
              <span className={styles.trend} data-trend={trend}>
                <span aria-hidden="true">{trend === "up" ? "↑" : "↓"}</span>
                <span>{trendValue}</span>
              </span>
            ) : null}
            {comparison ? <p className={styles.comparison}>{comparison}</p> : null}
          </div>
        ) : null}
      </div>
      <span aria-hidden="true" className={styles.icon} data-tone={tone}>
        <CatalogIcon iconName={icon} />
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        className={classNames}
        data-interactive="true"
        data-tone={tone}
        onClick={onClick}
        role={role}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <article className={classNames} data-tone={tone} role={role}>
      {content}
    </article>
  );
}
