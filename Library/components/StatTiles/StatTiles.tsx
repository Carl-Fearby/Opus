"use client";

import { StatTile, type StatTileTone, type StatTileTrend } from "../StatTile";
import type { TilesLayout } from "../Tiles";
import styles from "./StatTiles.module.css";

export type StatTileItem = {
  comparison?: string;
  icon: string;
  id: string;
  label: string;
  onClick?: () => void;
  tone?: StatTileTone;
  trend?: StatTileTrend;
  trendValue?: string;
  value: string;
};

export type StatTilesProps = {
  className?: string;
  items: StatTileItem[];
  layout?: TilesLayout;
};

const defaultToneForIndex = (index: number): StatTileTone => (index % 2 === 0 ? "purple" : "blue");

export function StatTiles({ className, items, layout = "fill" }: StatTilesProps) {
  const rowStyle =
    layout === "fill" && items.length > 0
      ? ({ gridTemplateColumns: `repeat(${items.length}, minmax(12.75rem, 1fr))` } as const)
      : undefined;

  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      data-layout={layout}
      role="list"
      style={rowStyle}
    >
      {items.map((item, index) => {
        const tone = item.tone ?? defaultToneForIndex(index);

        return (
          <div className={styles.statTileItem} key={item.id} role="listitem">
            <StatTile
              className={styles.statTile}
              comparison={item.comparison}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              tone={tone}
              trend={item.trend}
              trendValue={item.trendValue}
              value={item.value}
            />
          </div>
        );
      })}
    </div>
  );
}
