"use client";

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
  const rowStyle =
    layout === "fill" && items.length > 0
      ? ({ gridTemplateColumns: `repeat(${items.length}, minmax(var(--tile-size), 1fr))` } as const)
      : undefined;

  return (
    <div
      className={[styles.row, className].filter(Boolean).join(" ")}
      data-layout={layout}
      role="list"
      style={rowStyle}
    >
      <TileGradientDefs />
      {items.map((item, index) => {
        const tone = item.tone ?? defaultToneForIndex(index);

        return (
          <Tile
            className={styles.tile}
            href={item.href}
            icon={item.icon}
            key={item.id}
            label={item.label}
            onClick={item.onClick}
            role="listitem"
            tone={tone}
            withGradients={false}
          />
        );
      })}
    </div>
  );
}
