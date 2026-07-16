import { Fragment, type KeyboardEvent, type ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { NoteTagList, type NoteTagTone } from "@/components/NoteTag";
import type { ContentTimelineStatus } from "@/components/fields/types";
import styles from "./ContentTimeline.module.css";

export type ContentTimelineTagTone = NoteTagTone;

export type ContentTimelineTag = {
  label: string;
  tone?: ContentTimelineTagTone;
};

export type ContentTimelineItem = {
  action?: ReactNode;
  children?: ReactNode;
  avatarName?: string;
  avatarSrc?: string;
  description?: string;
  footer?: ReactNode;
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
  onItemDoubleClick?: (item: ContentTimelineItem, index: number) => void;
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
  onItemDoubleClick?: ContentTimelineProps["onItemDoubleClick"];
  variant?: ContentTimelineProps["variant"];
};

function renderTimelineItem({
  groupIndex,
  index,
  isLastInGroup,
  item,
  onItemClick,
  onItemDoubleClick,
  variant,
}: RenderTimelineItemOptions) {
  const itemKey = item.id ?? `${groupIndex}-${item.title}-${index}`;
  const showAvatar = itemUsesAvatar(item, variant);
  const showStatus = Boolean(item.status);
  const isInteractive = Boolean(onItemClick || onItemDoubleClick);
  const onKeyboardAction = onItemClick ?? onItemDoubleClick;
  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (!onKeyboardAction || event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      onKeyboardAction(item, index);
    }
  };

  return (
    <li
      className={styles.item}
      data-clickable={isInteractive ? "true" : undefined}
      data-content-timeline-item="true"
      data-has-children={item.children ? "true" : undefined}
      data-marker={showAvatar ? "avatar" : "dot"}
      data-status={item.status ?? "default"}
      key={itemKey}
      aria-label={isInteractive ? `${item.title}. Press Enter to activate.` : undefined}
      aria-roledescription={isInteractive ? "interactive timeline item" : undefined}
      onClick={
        onItemClick
          ? (event) => {
              event.stopPropagation();
              onItemClick(item, index);
            }
          : undefined
      }
      onDoubleClick={
        onItemDoubleClick
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onItemDoubleClick(item, index);
            }
          : undefined
      }
      onKeyDown={handleKeyDown}
      role={isInteractive ? "listitem" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      <div aria-hidden="true" className={styles.rail} data-content-timeline-rail="true">
        <div className={styles.markerSlot} data-content-timeline-marker="true">
          {showAvatar ? (
            <Avatar name={item.avatarName!} size="lg" src={item.avatarSrc} />
          ) : (
            <span className={styles.dot} />
          )}
        </div>
        {!isLastInGroup || item.children || item.footer ? (
          <span className={styles.line} data-content-timeline-line="true" />
        ) : null}
      </div>
      <div className={styles.body} data-content-timeline-body="true">
        <div
          className={styles.content}
          data-content-timeline-content="true"
          data-has-footer={item.footer ? "true" : undefined}
        >
          <div className={styles.head}>
            {showAvatar && showStatus ? <span aria-hidden="true" className={styles.statusDot} /> : null}
            <h3 className={styles.title}>{item.title}</h3>
            {item.time ? <time className={styles.time}>{item.time}</time> : null}
          </div>
          {item.description ? <p className={styles.description}>{item.description}</p> : null}
          {item.tags?.length || item.action ? (
            <div className={styles.metaRow}>
              {item.tags?.length ? (
                <div className={styles.tags}>
                  <NoteTagList tags={item.tags.map((tag) => ({ ...tag, tone: tag.tone ?? "purple" }))} />
                </div>
              ) : null}
              {item.action ? <div className={styles.itemAction}>{item.action}</div> : null}
            </div>
          ) : null}
          {item.footer ? <div className={styles.itemFooter}>{item.footer}</div> : null}
        </div>
        {item.children ? (
          <div className={styles.children} data-content-timeline-children="true">
            {item.children}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function ContentTimeline({ groups, items, onItemClick, onItemDoubleClick, variant }: ContentTimelineProps) {
  const resolvedGroups = groups ?? (items ? [{ items }] : []);

  return (
    <ol className={styles.list} data-content-timeline-list="true">
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
              onItemDoubleClick,
              variant,
            }),
          )}
        </Fragment>
      ))}
    </ol>
  );
}
