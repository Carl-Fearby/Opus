import styles from "./MasonryGrid.module.css";

export type MasonryGridItem = {
  body?: string;
  height?: number;
  title: string;
};

type MasonryGridProps = {
  columns?: number;
  gap?: number;
  items: MasonryGridItem[];
};

export function MasonryGrid({ columns = 3, gap = 12, items }: MasonryGridProps) {
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
      {items.map((item, index) => (
        <article
          className={styles.card}
          key={`${item.title}-${index}`}
          style={{
            marginBottom: `${safeGap}px`,
            minHeight: item.height ? `${item.height}px` : undefined,
          }}
        >
          <h3 className={styles.title}>{item.title}</h3>
          {item.body ? <p className={styles.body}>{item.body}</p> : null}
        </article>
      ))}
    </div>
  );
}
