import { type KeyboardEvent } from "react";
import { Avatar } from "@/components/Avatar";
import type { ContentTimelineStatus } from "@/components/fields/types";
import styles from "./ContentTimeline.module.css";

export type ContentTimelineTagTone = "blue" | "green" | "orange" | "purple";

export type ContentTimelineTag = {
  label: string;
  tone?: ContentTimelineTagTone;
};

export type ContentTimelineItem = {
  avatarName?: string;
  avatarSrc?: string;
  description?: string;
  id?: string;
  status?: ContentTimelineStatus;
  tags?: ContentTimelineTag[];
  time?: string;
  title: string;
};

type ContentTimelineProps = {
  items: ContentTimelineItem[];
  onItemClick?: (item: ContentTimelineItem, index: number) => void;
  variant?: "avatar" | "default";
};

function resolveVariant(items: ContentTimelineItem[], variant?: ContentTimelineProps["variant"]) {
  if (variant) {
    return variant;
  }

  return items.some((item) => item.avatarName) ? "avatar" : "default";
}

export function ContentTimeline({ items, onItemClick, variant }: ContentTimelineProps) {
  const resolvedVariant = resolveVariant(items, variant);

  return (
    <ol className={styles.list} data-variant={resolvedVariant}>
      {items.map((item, index) => {
        const itemKey = item.id ?? `${item.title}-${index}`;
        const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
          if (!onItemClick) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onItemClick(item, index);
          }
        };

        return (
          <li
            className={styles.item}
            data-clickable={onItemClick ? "true" : undefined}
            data-status={item.status ?? "default"}
            data-variant={resolvedVariant}
            key={itemKey}
            onClick={onItemClick ? () => onItemClick(item, index) : undefined}
            onKeyDown={handleKeyDown}
            role={onItemClick ? "button" : undefined}
            tabIndex={onItemClick ? 0 : undefined}
          >
            <div aria-hidden="true" className={styles.rail}>
              {resolvedVariant === "avatar" && item.avatarName ? (
                <Avatar name={item.avatarName} size="sm" src={item.avatarSrc} />
              ) : (
                <span className={styles.dot} />
              )}
              {index < items.length - 1 ? <span className={styles.line} /> : null}
            </div>
            <div className={styles.body}>
              <div className={styles.head}>
                <h3 className={styles.title}>{item.title}</h3>
                {item.time ? <time className={styles.time}>{item.time}</time> : null}
              </div>
              {item.description ? <p className={styles.description}>{item.description}</p> : null}
              {item.tags?.length ? (
                <div className={styles.tags}>
                  {item.tags.map((tag) => (
                    <span className={styles.tag} data-tone={tag.tone ?? "purple"} key={`${itemKey}-${tag.label}`}>
                      {tag.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
