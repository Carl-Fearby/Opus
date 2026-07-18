"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CatalogIcon } from "../CatalogIcon";
import { StatTile, type StatTileTone, type StatTileTrend, type StatTileTrendTone } from "../StatTile";
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
  trendTone?: StatTileTrendTone;
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
  const rowRef = useRef<HTMLDivElement>(null);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const rowStyle =
    layout === "fill" && items.length > 0
      ? ({ gridTemplateColumns: `repeat(${items.length}, minmax(var(--stat-tile-min), 1fr))` } as const)
      : undefined;

  const updateOverflow = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;

    setHasPrevious(row.scrollLeft > 2);
    setHasMore(row.scrollWidth - row.scrollLeft - row.clientWidth > 2);
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(row);
    Array.from(row.children).forEach((child) => observer.observe(child));
    row.addEventListener("scroll", updateOverflow, { passive: true });

    return () => {
      observer.disconnect();
      row.removeEventListener("scroll", updateOverflow);
    };
  }, [items, layout, updateOverflow]);

  const scrollTiles = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * Math.max(row.clientWidth * 0.75, 120), behavior: "smooth" });
  };

  return (
    <div
      className={styles.viewport}
      data-has-more={hasMore ? "true" : "false"}
      data-has-previous={hasPrevious ? "true" : "false"}
    >
      <div
        className={[styles.row, className].filter(Boolean).join(" ")}
        data-layout={layout}
        ref={rowRef}
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
                trendTone={item.trendTone}
                trendValue={item.trendValue}
                value={item.value}
              />
            </div>
          );
        })}
      </div>
      {hasPrevious ? (
        <button aria-label="Show previous metrics" className={[styles.moreButton, styles.previousButton].join(" ")} onClick={() => scrollTiles(-1)} type="button">
          <CatalogIcon iconName="chevron-left" />
        </button>
      ) : null}
      {hasMore ? (
        <button aria-label="Show more metrics" className={[styles.moreButton, styles.nextButton].join(" ")} onClick={() => scrollTiles(1)} type="button">
          <CatalogIcon iconName="chevron-right" />
        </button>
      ) : null}
    </div>
  );
}
