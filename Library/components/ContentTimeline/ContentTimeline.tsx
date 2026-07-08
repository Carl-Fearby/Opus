import type { ContentTimelineStatus } from "@/components/fields/types";
import styles from "./ContentTimeline.module.css";

export type ContentTimelineItem = {
  description?: string;
  status?: ContentTimelineStatus;
  time?: string;
  title: string;
};

type ContentTimelineProps = {
  items: ContentTimelineItem[];
};

export function ContentTimeline({ items }: ContentTimelineProps) {
  return (
    <ol className={styles.list}>
      {items.map((item, index) => (
        <li
          className={styles.item}
          data-status={item.status ?? "default"}
          key={`${item.title}-${index}`}
        >
          <div aria-hidden="true" className={styles.rail}>
            <span className={styles.dot} />
            {index < items.length - 1 ? <span className={styles.line} /> : null}
          </div>
          <div className={styles.body}>
            <div className={styles.head}>
              <h3 className={styles.title}>{item.title}</h3>
              {item.time ? <time className={styles.time}>{item.time}</time> : null}
            </div>
            {item.description ? <p className={styles.description}>{item.description}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
