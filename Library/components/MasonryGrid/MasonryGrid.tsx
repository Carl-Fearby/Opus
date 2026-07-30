"use client";

import styles from "./MasonryGrid.module.css";

export type MasonryGridItem = {
  body?: string;
  height?: number;
  id?: string;
  title: string;
};

type MasonryGridProps = {
  columns?: number;
  gap?: number;
  items: MasonryGridItem[];
  onItemClick?: (item: MasonryGridItem, index: number) => void;
};

export function MasonryGrid({ columns = 3, gap = 12, items, onItemClick }: MasonryGridProps) {
  const safeColumns = Math.min(Math.max(Math.round(columns), 2), 4);
  const safeGap = Math.min(Math.max(Math.round(gap), 8), 28);

  return (
    <div
      className={styles.grid}
      style={{
        columnCount: safeColumns,
        columnGap: `${safeGap}px`,
      }}
    >
      {items.map((item, index) => {
        const content = (
          <>
          <h3 className={styles.title}>{item.title}</h3>
          {item.body ? <p className={styles.body}>{item.body}</p> : null}
          </>
        );
        const style = {
          marginBottom: `${safeGap}px`,
          minHeight: item.height ? `${item.height}px` : undefined,
        };
        return onItemClick ? (
          <button
            className={styles.card}
            key={item.id ?? `${item.title}-${index}`}
            onClick={() => onItemClick(item, index)}
            style={style}
            type="button"
          >
            {content}
          </button>
        ) : (
          <article className={styles.card} key={item.id ?? `${item.title}-${index}`} style={style}>
            {content}
          </article>
        );
      })}
    </div>
  );
}
