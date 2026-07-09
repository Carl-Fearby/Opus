"use client";

import { useMemo, useState } from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import { ContentTimeline, type ContentTimelineItem } from "@/components/ContentTimeline";
import { NoteComposer } from "@/components/NoteComposer";
import styles from "./NotesActivity.module.css";

export type NotesActivityTagTone = "blue" | "green" | "orange" | "purple";

export type NotesActivityTag = {
  label: string;
  tone: NotesActivityTagTone;
};

export type NotesActivityItem = {
  author: string;
  avatarSrc?: string;
  body: string;
  dateGroup: string;
  id: string;
  kind: "activity" | "note";
  tags?: NotesActivityTag[];
  time: string;
};

export type NotesActivityTab = "activity" | "notes";

export type NotesActivityProps = {
  className?: string;
  composerPlaceholder?: string;
  defaultTab?: NotesActivityTab;
  footerHref?: string;
  footerLabel?: string;
  items: NotesActivityItem[];
  onFooterClick?: () => void;
  onItemClick?: (item: NotesActivityItem) => void;
  onNoteSave?: (note: string) => void;
  onTabChange?: (tab: NotesActivityTab) => void;
  saveButtonLabel?: string;
};

function groupItemsByDate(items: NotesActivityItem[]) {
  const groups: { dateGroup: string; items: NotesActivityItem[] }[] = [];

  for (const item of items) {
    const existing = groups.find((group) => group.dateGroup === item.dateGroup);
    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.push({ dateGroup: item.dateGroup, items: [item] });
  }

  return groups;
}

function toTimelineItems(items: NotesActivityItem[]): ContentTimelineItem[] {
  return items.map((item) => ({
    avatarName: item.author,
    avatarSrc: item.avatarSrc,
    description: item.body,
    id: item.id,
    tags: item.tags,
    time: item.time,
    title: item.author,
  }));
}

export function NotesActivity({
  className,
  composerPlaceholder = "Add a note...",
  defaultTab = "notes",
  footerHref,
  footerLabel = "View all notes & activity",
  items,
  onFooterClick,
  onItemClick,
  onNoteSave,
  onTabChange,
  saveButtonLabel = "Save Note",
}: NotesActivityProps) {
  const [activeTab, setActiveTab] = useState<NotesActivityTab>(defaultTab);
  const [draft, setDraft] = useState("");

  const visibleItems = useMemo(
    () => (activeTab === "activity" ? items.filter((item) => item.kind === "activity") : items),
    [activeTab, items],
  );
  const groupedItems = useMemo(() => groupItemsByDate(visibleItems), [visibleItems]);
  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const setTab = (tab: NotesActivityTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleSave = (note: string) => {
    onNoteSave?.(note);
    setDraft("");
  };

  const handleTimelineClick = onItemClick
    ? (timelineItem: ContentTimelineItem) => {
        if (!timelineItem.id) {
          return;
        }

        const source = itemsById.get(timelineItem.id);
        if (source) {
          onItemClick(source);
        }
      }
    : undefined;

  const footerContent = (
    <>
      <span>{footerLabel}</span>
      <span aria-hidden="true" className={styles.footerIcon}>
        <CatalogIcon iconName="arrow-right" />
      </span>
    </>
  );

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div aria-label="Notes and activity" className={styles.tabs} role="tablist">
        {(["notes", "activity"] as const).map((tab) => (
          <button
            aria-selected={activeTab === tab}
            className={styles.tab}
            data-active={activeTab === tab}
            key={tab}
            onClick={() => setTab(tab)}
            role="tab"
            type="button"
          >
            {tab === "notes" ? "Notes" : "Activity"}
          </button>
        ))}
      </div>

      {activeTab === "notes" ? (
        <NoteComposer
          onChange={setDraft}
          onSave={handleSave}
          placeholder={composerPlaceholder}
          saveButtonLabel={saveButtonLabel}
          value={draft}
        />
      ) : null}

      <div className={styles.feed}>
        {groupedItems.map((group) => (
          <section className={styles.dateGroup} key={group.dateGroup}>
            <h4 className={styles.dateLabel}>{group.dateGroup}</h4>
            <ContentTimeline
              items={toTimelineItems(group.items)}
              onItemClick={
                handleTimelineClick
                  ? (timelineItem) => handleTimelineClick(timelineItem)
                  : undefined
              }
              variant="avatar"
            />
          </section>
        ))}
      </div>

      <footer className={styles.footer}>
        {footerHref ? (
          <a className={styles.footerAction} href={footerHref}>
            {footerContent}
          </a>
        ) : (
          <button className={styles.footerAction} onClick={onFooterClick} type="button">
            {footerContent}
          </button>
        )}
      </footer>
    </div>
  );
}
