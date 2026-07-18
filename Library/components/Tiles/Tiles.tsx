"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CatalogIcon } from "../CatalogIcon";
import { Tile, type TileTone } from "../Tile";
import { TileGradientDefs } from "../Tile/TileGradientDefs";
import styles from "./Tiles.module.css";

export type TilesLayout = "fill" | "fixed";

export type TileItem = {
  href?: string;
  icon: string;
  id: string;
  label: string;
  onClick?: () => void;
  tone?: TileTone;
};

export type TilesProps = {
  className?: string;
  items: TileItem[];
  layout?: TilesLayout;
};

const defaultToneForIndex = (index: number): TileTone => (index % 2 === 0 ? "purple" : "blue");

export function Tiles({ className, items, layout = "fill" }: TilesProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const rowStyle =
    layout === "fill" && items.length > 0
      ? ({ gridTemplateColumns: `repeat(${items.length}, minmax(var(--tile-width), 1fr))` } as const)
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
    <div className={styles.viewport}>
      <div className={[styles.row, className].filter(Boolean).join(" ")} data-layout={layout} ref={rowRef} role="list" style={rowStyle}>
        <TileGradientDefs />
        {items.map((item, index) => {
          const tone = item.tone ?? defaultToneForIndex(index);

          return (
            <div className={styles.tileItem} key={item.id} role="listitem">
              <Tile
                className={styles.tile}
                href={item.href}
                icon={item.icon}
                label={item.label}
                onClick={item.onClick}
                tone={tone}
                withGradients={false}
              />
            </div>
          );
        })}
      </div>
      {hasPrevious ? (
        <button
          aria-label="Show previous tiles"
          className={[styles.moreButton, styles.previousButton].join(" ")}
          onClick={() => scrollTiles(-1)}
          type="button"
        >
          <CatalogIcon iconName="chevron-left" />
        </button>
      ) : null}
      {hasMore ? (
        <button
          aria-label="Show more tiles"
          className={[styles.moreButton, styles.nextButton].join(" ")}
          onClick={() => scrollTiles(1)}
          type="button"
        >
          <CatalogIcon iconName="chevron-right" />
        </button>
      ) : null}
    </div>
  );
}
