import { Fragment, type KeyboardEvent } from "react";
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

export type ContentTimelineGroup = {
  items: ContentTimelineItem[];
  label?: string;
};

type ContentTimelineProps = {
  groups?: ContentTimelineGroup[];
  items?: ContentTimelineItem[];
  onItemClick?: (item: ContentTimelineItem, index: number) => void;
  /** @deprecated Prefer per-item `avatarName` to choose avatar vs status markers. */
  variant?: "avatar" | "default";
};

function itemUsesAvatar(item: ContentTimelineItem, variant?: ContentTimelineProps["variant"]) {
  if (variant === "default") {
    return false;
  }

  return Boolean(item.avatarName);
}

type RenderTimelineItemOptions = {
  groupIndex: number;
  index: number;
  isLastInGroup: boolean;
  item: ContentTimelineItem;
  onItemClick?: ContentTimelineProps["onItemClick"];
  variant?: ContentTimelineProps["variant"];
};

function renderTimelineItem({
  groupIndex,
  index,
  isLastInGroup,
  item,
  onItemClick,
  variant,
}: RenderTimelineItemOptions) {
  const itemKey = item.id ?? `${groupIndex}-${item.title}-${index}`;
  const showAvatar = itemUsesAvatar(item, variant);
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
      key={itemKey}
      onClick={onItemClick ? () => onItemClick(item, index) : undefined}
      onKeyDown={handleKeyDown}
      role={onItemClick ? "button" : undefined}
      tabIndex={onItemClick ? 0 : undefined}
    >
      <div aria-hidden="true" className={styles.rail}>
        <div className={styles.markerSlot}>
          {showAvatar ? (
            <Avatar name={item.avatarName!} size="sm" src={item.avatarSrc} />
          ) : (
            <span className={styles.dot} />
          )}
        </div>
        {!isLastInGroup ? <span className={styles.line} /> : null}
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
}

export function ContentTimeline({ groups, items, onItemClick, variant }: ContentTimelineProps) {
  const resolvedGroups = groups ?? (items ? [{ items }] : []);

  return (
    <ol className={styles.list}>
      {resolvedGroups.map((group, groupIndex) => (
        <Fragment key={group.label ?? `group-${groupIndex}`}>
          {group.label ? (
            <li aria-hidden="true" className={styles.groupLabel}>
              {group.label}
            </li>
          ) : null}
          {group.items.map((item, index) =>
            renderTimelineItem({
              groupIndex,
              index,
              isLastInGroup: index === group.items.length - 1,
              item,
              onItemClick,
              variant,
            }),
          )}
        </Fragment>
      ))}
    </ol>
  );
}
