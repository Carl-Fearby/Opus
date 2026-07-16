"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import {
  ContentTimeline,
  type ContentTimelineItem,
} from "@/components/ContentTimeline";
import { EmojiPicker } from "@/components/EmojiPicker";
import { NoteComposer } from "@/components/NoteComposer";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import {
  DEFAULT_NOTE_TAG_OPTIONS,
  NoteTagList,
  NoteTagPicker,
  type NoteTagOption,
  type NoteTagTone,
} from "@/components/NoteTag";
import type {
  ContentTimelineStatus,
  SurfaceDensity,
} from "@/components/fields/types";
import styles from "./NotesActivity.module.css";

export type NotesActivityTagTone = NoteTagTone;

export type NotesActivityTag = NoteTagOption;

export type NotesActivityItem = {
  author: string;
  avatarSrc?: string;
  body: string;
  comments?: NotesActivityComment[];
  dateGroup: string;
  id: string;
  kind: "activity" | "note";
  status?: ContentTimelineStatus;
  tags?: NotesActivityTag[];
  time: string;
};

export type NotesActivityComment = {
  author: string;
  avatarSrc?: string;
  body: string;
  id: string;
  tags?: NotesActivityTag[];
  time: string;
};

export type NotesActivityTab = "activity" | "notes";

export type NotesActivityProps = {
  activeTab?: NotesActivityTab;
  addNoteButtonLabel?: string;
  addNoteModalDescription?: string;
  addNoteModalTitle?: string;
  className?: string;
  composerPlaceholder?: string;
  defaultTab?: NotesActivityTab;
  density?: SurfaceDensity;
  activityFooterHref?: string;
  activityFooterLabel?: string;
  items: NotesActivityItem[];
  notesFooterHref?: string;
  notesFooterLabel?: string;
  noteAuthorAvatarSrc?: string;
  noteAuthorName?: string;
  noteTagOptions?: NotesActivityTag[];
  onActivityFooterClick?: () => void;
  onItemClick?: (item: NotesActivityItem) => void;
  onNoteAttachClick?: () => void;
  onNoteEmojiSelect?: (emoji: string) => void;
  onNoteMentionClick?: () => void;
  onNotesFooterClick?: () => void;
  onNoteSave?: (
    note: string,
    parentNote?: NotesActivityItem,
    tags?: NotesActivityTag[],
  ) => void;
  onOpenTask?: (item: NotesActivityItem) => void;
  onTabChange?: (tab: NotesActivityTab) => void;
  saveButtonLabel?: string;
  showAttach?: boolean;
  showEmoji?: boolean;
  showMention?: boolean;
  showTags?: boolean;
};

function formatNoteTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

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

type CommentsByNoteId = Record<string, NotesActivityComment[]>;

type InlineReplyComposerProps = {
  onAttachClick?: () => void;
  onChange: (value: string) => void;
  onEmojiSelect?: (emoji: string) => void;
  onMentionClick?: () => void;
  onTagsChange: (tags: NoteTagOption[]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  selectedTags: NoteTagOption[];
  showAttach: boolean;
  showEmoji: boolean;
  showMention: boolean;
  showTags: boolean;
  tagOptions: NoteTagOption[];
  value: string;
};

type ThreadedTimelineProps = {
  items: ContentTimelineItem[];
  onItemClick?: (item: ContentTimelineItem, index: number) => void;
  onItemDoubleClick?: (item: ContentTimelineItem, index: number) => void;
};

function ThreadedTimeline({
  items,
  onItemClick,
  onItemDoubleClick,
}: ThreadedTimelineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [connectorPaths, setConnectorPaths] = useState<string[]>([]);

  const measureConnectors = useCallback(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const parentItem = root.closest('[data-content-timeline-item="true"]');
    const parentMarker = parentItem?.querySelector<HTMLElement>(
      ':scope > [data-content-timeline-rail="true"] > [data-content-timeline-marker="true"]',
    );
    const list = Array.from(root.children).find(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child.matches('[data-content-timeline-list="true"]'),
    );

    if (!parentMarker || !list) {
      setConnectorPaths((currentPaths) =>
        currentPaths.length > 0 ? [] : currentPaths,
      );
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const parentRect = parentMarker.getBoundingClientRect();
    const parentX = parentRect.left + parentRect.width / 2 - rootRect.left;
    const parentY = parentRect.top + parentRect.height / 2 - rootRect.top;
    const childItems = Array.from(list.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child.matches('[data-content-timeline-item="true"]'),
    );

    const nextPaths = childItems
      .map((childItem) => {
        const childMarker = childItem.querySelector<HTMLElement>(
          ':scope > [data-content-timeline-rail="true"] > [data-content-timeline-marker="true"]',
        );

        if (!childMarker) {
          return null;
        }

        const childRect = childMarker.getBoundingClientRect();
        const childX = childRect.left - rootRect.left;
        const childY = childRect.top + childRect.height / 2 - rootRect.top;
        const turnRadius = Math.min(10, Math.max(0, childY - parentY));
        const turnX = parentX + turnRadius;
        const turnY = childY - turnRadius;

        return `M ${childX.toFixed(2)} ${childY.toFixed(2)} H ${turnX.toFixed(2)} Q ${parentX.toFixed(2)} ${childY.toFixed(2)} ${parentX.toFixed(2)} ${turnY.toFixed(2)} V ${parentY.toFixed(2)}`;
      })
      .filter(Boolean) as string[];

    setConnectorPaths((currentPaths) => {
      if (
        currentPaths.length === nextPaths.length &&
        currentPaths.every((path, index) => path === nextPaths[index])
      ) {
        return currentPaths;
      }

      return nextPaths;
    });
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    let frame = window.requestAnimationFrame(measureConnectors);
    const resizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measureConnectors);
    });
    const parentItem = root.closest('[data-content-timeline-item="true"]');

    resizeObserver.observe(root);
    if (parentItem instanceof HTMLElement) {
      resizeObserver.observe(parentItem);
    }

    root
      .querySelectorAll<HTMLElement>('[data-content-timeline-marker="true"]')
      .forEach((marker) => {
        resizeObserver.observe(marker);
      });
    window.addEventListener("resize", measureConnectors);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureConnectors);
    };
  }, [items, measureConnectors]);

  return (
    <div className={styles.threadItems} ref={rootRef}>
      <svg
        aria-hidden="true"
        className={styles.threadConnectors}
        focusable="false"
      >
        {connectorPaths.map((path, index) => (
          <path d={path} key={`${path}-${index}`} />
        ))}
      </svg>
      <ContentTimeline
        items={items}
        onItemClick={onItemClick}
        onItemDoubleClick={onItemDoubleClick}
      />
    </div>
  );
}

function InlineReplyComposer({
  onAttachClick,
  onChange,
  onEmojiSelect,
  onMentionClick,
  onTagsChange,
  onSubmit,
  selectedTags,
  showAttach,
  showEmoji,
  showMention,
  showTags,
  tagOptions,
  value,
}: InlineReplyComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasTools = showAttach || showEmoji || showMention || showTags;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.focus();
    const cursor = textarea.value.length;
    textarea.setSelectionRange(cursor, cursor);
  }, []);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 160);
    textarea.style.height = `${Math.max(nextHeight, 34)}px`;
  }, [value]);

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${emoji}${value.slice(end)}`;
    onChange(nextValue);
    onEmojiSelect?.(emoji);

    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const removeTag = (tag: NoteTagOption) => {
    const tagKey = tag.id ?? tag.label;
    onTagsChange(
      selectedTags.filter(
        (selectedTag) => (selectedTag.id ?? selectedTag.label) !== tagKey,
      ),
    );
  };

  return (
    <form className={styles.replyComposer} onSubmit={onSubmit}>
      <div
        className={styles.replyInputShell}
        data-has-tools={hasTools ? "true" : undefined}
      >
        {hasTools ? (
          <div className={styles.replyTools} aria-label="Reply tools">
            {showAttach ? (
              <button
                aria-label="Attach file"
                className={styles.replyToolButton}
                onClick={onAttachClick}
                type="button"
              >
                <CatalogIcon iconName="paperclip" />
              </button>
            ) : null}
            {showMention ? (
              <button
                aria-label="Mention someone"
                className={styles.replyToolButton}
                onClick={onMentionClick}
                type="button"
              >
                <CatalogIcon iconName="at" />
              </button>
            ) : null}
            {showEmoji ? (
              <EmojiPicker
                label="Add emoji"
                placement="top"
                trigger={
                  <button
                    aria-label="Add emoji"
                    className={styles.replyToolButton}
                    type="button"
                  >
                    <CatalogIcon iconName="face-smile" />
                  </button>
                }
                onSelect={insertEmoji}
              />
            ) : null}
            {showTags ? (
              <NoteTagPicker
                buttonClassName={styles.replyToolButton}
                label="Add tags"
                onChange={onTagsChange}
                options={tagOptions}
                selectedTags={selectedTags}
              >
                <CatalogIcon iconName="tag" />
              </NoteTagPicker>
            ) : null}
          </div>
        ) : null}
        <textarea
          ref={textareaRef}
          aria-label="Reply to thread"
          className={styles.replyInput}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") {
              return;
            }

            if (event.shiftKey) {
              return;
            }

            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }}
          placeholder="Reply to thread..."
          rows={1}
          value={value}
        />
      </div>
      {showTags && selectedTags.length ? (
        <NoteTagList
          className={styles.replyTags}
          onRemove={removeTag}
          size="sm"
          tags={selectedTags}
        />
      ) : null}
    </form>
  );
}

function commentToItem(
  parent: NotesActivityItem,
  comment: NotesActivityComment,
): NotesActivityItem {
  return {
    author: comment.author,
    avatarSrc: comment.avatarSrc,
    body: comment.body,
    dateGroup: parent.dateGroup,
    id: comment.id,
    kind: "note",
    tags: comment.tags,
    time: comment.time,
  };
}

function toTimelineItems(
  items: NotesActivityItem[],
  {
    activeReplyNoteId,
    commentsByNoteId,
    enableReply,
    onItemClick,
    onItemDoubleClick,
    renderReplyComposer,
  }: {
    activeReplyNoteId: string | null;
    commentsByNoteId: CommentsByNoteId;
    enableReply: boolean;
    onItemClick?: (item: ContentTimelineItem, index: number) => void;
    onItemDoubleClick?: (item: ContentTimelineItem, index: number) => void;
    renderReplyComposer: (item: NotesActivityItem) => ReactNode;
  },
): ContentTimelineItem[] {
  return items.map((item) => {
    const comments = [
      ...(commentsByNoteId[item.id] ?? []),
      ...(item.comments ?? []),
    ];
    const showReply = enableReply && activeReplyNoteId === item.id;

    return {
      avatarName: item.author,
      avatarSrc: item.avatarSrc,
      children: comments.length ? (
        <ThreadedTimeline
          items={toTimelineItems(
            comments.map((comment) => commentToItem(item, comment)),
            {
              activeReplyNoteId,
              commentsByNoteId,
              enableReply,
              onItemClick,
              onItemDoubleClick,
              renderReplyComposer,
            },
          )}
          onItemClick={onItemClick}
          onItemDoubleClick={onItemDoubleClick}
        />
      ) : undefined,
      description: item.body,
      footer: showReply ? (
        <div
          className={styles.replyBlock}
          data-notes-reply="true"
          onClick={(event) => event.stopPropagation()}
        >
          {renderReplyComposer(item)}
        </div>
      ) : undefined,
      id: item.id,
      status: item.kind === "activity" ? (item.status ?? "default") : undefined,
      tags: item.tags,
      time: item.time,
      title: item.author,
    };
  });
}

export function NotesActivity({
  activeTab: controlledActiveTab,
  className,
  composerPlaceholder = "Add a note...",
  defaultTab = "notes",
  density = "comfortable",
  activityFooterHref,
  activityFooterLabel = "View all activities",
  items,
  notesFooterHref,
  notesFooterLabel = "View all notes",
  noteAuthorAvatarSrc,
  noteAuthorName = "You",
  noteTagOptions = DEFAULT_NOTE_TAG_OPTIONS,
  onActivityFooterClick,
  onItemClick,
  onNoteAttachClick,
  onNoteEmojiSelect,
  onNoteMentionClick,
  onNotesFooterClick,
  onNoteSave,
  onOpenTask,
  onTabChange,
  saveButtonLabel = "Save Note",
  showAttach = true,
  showEmoji = true,
  showMention = true,
  showTags = true,
}: NotesActivityProps) {
  const singleClickTimerRef = useRef<number | null>(null);
  const [internalActiveTab, setInternalActiveTab] =
    useState<NotesActivityTab>(defaultTab);
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const [activeReplyNoteId, setActiveReplyNoteId] = useState<string | null>(
    null,
  );
  const [commentsByNoteId, setCommentsByNoteId] = useState<CommentsByNoteId>(
    {},
  );
  const [createdNotes, setCreatedNotes] = useState<NotesActivityItem[]>([]);
  const [draftsByNoteId, setDraftsByNoteId] = useState<Record<string, string>>(
    {},
  );
  const [draftTagsByNoteId, setDraftTagsByNoteId] = useState<
    Record<string, NotesActivityTag[]>
  >({});
  const [topDraft, setTopDraft] = useState("");
  const [topTags, setTopTags] = useState<NotesActivityTag[]>([]);
  const allItems = useMemo(
    () => [...createdNotes, ...items],
    [createdNotes, items],
  );

  const visibleItems = useMemo(
    () =>
      activeTab === "activity"
        ? allItems.filter((item) => item.kind === "activity")
        : allItems,
    [activeTab, allItems],
  );
  const groupedItems = useMemo(
    () => groupItemsByDate(visibleItems),
    [visibleItems],
  );
  const replyTargetsById = useMemo(() => {
    const map = new Map<string, NotesActivityItem>();

    for (const item of allItems) {
      map.set(item.id, item);
      for (const comment of item.comments ?? []) {
        map.set(comment.id, commentToItem(item, comment));
      }
    }

    let progressed = true;
    while (progressed) {
      progressed = false;
      for (const [parentId, comments] of Object.entries(commentsByNoteId)) {
        const parent = map.get(parentId);
        if (!parent) {
          continue;
        }

        for (const comment of comments) {
          if (map.has(comment.id)) {
            continue;
          }

          map.set(comment.id, commentToItem(parent, comment));
          progressed = true;
        }
      }
    }

    return map;
  }, [allItems, commentsByNoteId]);

  const setTab = (tab: NotesActivityTab) => {
    if (singleClickTimerRef.current !== null) {
      window.clearTimeout(singleClickTimerRef.current);
      singleClickTimerRef.current = null;
    }

    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tab);
    }
    setActiveReplyNoteId(null);
    onTabChange?.(tab);
  };

  const handleTopLevelSave = (
    note: string,
    tags: NotesActivityTag[] = topTags,
  ) => {
    const createdAt = new Date();
    const createdNote: NotesActivityItem = {
      author: noteAuthorName,
      avatarSrc: noteAuthorAvatarSrc,
      body: note,
      dateGroup: "Today",
      id: `note-${createdAt.getTime()}`,
      kind: "note",
      tags: tags.length ? tags : undefined,
      time: formatNoteTime(createdAt),
    };

    setCreatedNotes((current) => [createdNote, ...current]);
    onNoteSave?.(note, undefined, tags);
    setTopDraft("");
    setTopTags([]);
  };

  const handleThreadSave = (
    targetId: string,
    note: string,
    tags: NotesActivityTag[] = draftTagsByNoteId[targetId] ?? [],
  ) => {
    const trimmed = note.trim();
    if (!trimmed) {
      return;
    }

    const activeTarget = replyTargetsById.get(targetId);
    if (!activeTarget) {
      return;
    }

    const createdAt = new Date();
    const createdComment: NotesActivityComment = {
      author: noteAuthorName,
      avatarSrc: noteAuthorAvatarSrc,
      body: trimmed,
      id: `${activeTarget.id}-comment-${createdAt.getTime()}`,
      tags: tags.length ? tags : undefined,
      time: formatNoteTime(createdAt),
    };

    setCommentsByNoteId((current) => ({
      ...current,
      [activeTarget.id]: [createdComment, ...(current[activeTarget.id] ?? [])],
    }));
    onNoteSave?.(trimmed, activeTarget, tags);
    setDraftsByNoteId((current) => ({
      ...current,
      [targetId]: "",
    }));
    setDraftTagsByNoteId((current) => ({
      ...current,
      [targetId]: [],
    }));
    setActiveReplyNoteId(null);
  };

  const handleThreadSubmit = (
    targetId: string,
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    handleThreadSave(
      targetId,
      draftsByNoteId[targetId] ?? "",
      draftTagsByNoteId[targetId] ?? [],
    );
  };

  const resolveTimelineSource = (timelineItem: ContentTimelineItem) => {
    if (!timelineItem.id) {
      return null;
    }

    return replyTargetsById.get(timelineItem.id) ?? null;
  };

  const clearSingleClickTimer = () => {
    if (singleClickTimerRef.current === null) {
      return;
    }

    window.clearTimeout(singleClickTimerRef.current);
    singleClickTimerRef.current = null;
  };

  const handleTimelineClick = (timelineItem: ContentTimelineItem) => {
    const source = resolveTimelineSource(timelineItem);
    if (!source) {
      return;
    }

    clearSingleClickTimer();
    singleClickTimerRef.current = window.setTimeout(() => {
      singleClickTimerRef.current = null;
      if (activeTab === "notes") {
        setActiveReplyNoteId(source.id);
      }

      onItemClick?.(source);
    }, 180);
  };

  const handleTimelineDoubleClick = (timelineItem: ContentTimelineItem) => {
    const source = resolveTimelineSource(timelineItem);
    if (!source) {
      return;
    }

    clearSingleClickTimer();
    setActiveReplyNoteId(null);
    onOpenTask?.(source);
  };

  useEffect(() => {
    return () => {
      if (singleClickTimerRef.current !== null) {
        window.clearTimeout(singleClickTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeReplyNoteId) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(`.${styles.replyBlock}`) ||
        target?.closest("[data-opus-emoji-picker='true']") ||
        target?.closest("[data-note-tag-picker='true']")
      ) {
        return;
      }

      const row = target?.closest("[data-clickable='true']");
      if (row) {
        return;
      }

      setActiveReplyNoteId(null);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [activeReplyNoteId]);

  const activeFooterLabel =
    activeTab === "notes" ? notesFooterLabel : activityFooterLabel;
  const activeFooterHref =
    activeTab === "notes" ? notesFooterHref : activityFooterHref;
  const activeFooterClick =
    activeTab === "notes" ? onNotesFooterClick : onActivityFooterClick;

  const footerContent = (
    <>
      <span>{activeFooterLabel}</span>
      <span aria-hidden="true" className={styles.footerIcon}>
        <CatalogIcon iconName="arrow-right" />
      </span>
    </>
  );

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-density={density}>
      <div
        aria-label="Notes and activity"
        className={styles.tabs}
        role="tablist"
      >
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
            <span aria-hidden="true" className={styles.tabIcon}>
              <CatalogIcon
                iconName={tab === "notes" ? "note-sticky" : "clock-rotate-left"}
              />
            </span>
            {tab === "notes" ? "Notes" : "Activity"}
          </button>
        ))}
      </div>

      {activeTab === "notes" ? (
        <NoteComposer
          className={styles.composer}
          onAttachClick={onNoteAttachClick}
          onChange={setTopDraft}
          onEmojiSelect={onNoteEmojiSelect}
          onMentionClick={onNoteMentionClick}
          onSave={handleTopLevelSave}
          onTagsChange={setTopTags}
          placeholder={composerPlaceholder}
          saveButtonLabel={saveButtonLabel}
          selectedTags={topTags}
          showAttach={showAttach}
          showEmoji={showEmoji}
          showMention={showMention}
          showTags={showTags}
          tagOptions={noteTagOptions}
          value={topDraft}
        />
      ) : null}

      <CustomScrollbar
        label="Notes and activity feed"
        className={styles.feed}
        orientation="vertical"
      >
        <ContentTimeline
            groups={groupedItems.map((group) => ({
              items: toTimelineItems(group.items, {
                activeReplyNoteId,
                commentsByNoteId,
                enableReply: activeTab === "notes",
                onItemClick:
                  activeTab === "notes" || onItemClick
                    ? handleTimelineClick
                    : undefined,
                onItemDoubleClick: onOpenTask
                  ? handleTimelineDoubleClick
                  : undefined,
                renderReplyComposer: (item) => (
                  <InlineReplyComposer
                    onAttachClick={onNoteAttachClick}
                    onChange={(value) => {
                      setDraftsByNoteId((current) => ({
                        ...current,
                        [item.id]: value,
                      }));
                    }}
                    onEmojiSelect={onNoteEmojiSelect}
                    onMentionClick={onNoteMentionClick}
                    onSubmit={(event) => handleThreadSubmit(item.id, event)}
                    onTagsChange={(tags) => {
                      setDraftTagsByNoteId((current) => ({
                        ...current,
                        [item.id]: tags,
                      }));
                    }}
                    selectedTags={draftTagsByNoteId[item.id] ?? []}
                    showAttach={showAttach}
                    showEmoji={showEmoji}
                    showMention={showMention}
                    showTags={showTags}
                    tagOptions={noteTagOptions}
                    value={draftsByNoteId[item.id] ?? ""}
                  />
                ),
              }),
              label: group.dateGroup,
            }))}
            onItemClick={
              activeTab === "notes" || onItemClick
                ? handleTimelineClick
                : undefined
            }
            onItemDoubleClick={
              onOpenTask ? handleTimelineDoubleClick : undefined
            }
        />
      </CustomScrollbar>

      <footer className={styles.footer}>
        {activeFooterHref ? (
          <a className={styles.footerAction} href={activeFooterHref}>
            {footerContent}
          </a>
        ) : (
          <button
            className={styles.footerAction}
            onClick={activeFooterClick}
            type="button"
          >
            {footerContent}
          </button>
        )}
      </footer>
    </div>
  );
}
