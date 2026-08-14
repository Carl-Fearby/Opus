"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type UIEvent,
} from "react";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import styles from "./InfiniteSelectableList.module.css";

export type InfiniteSelectableListSelectionReason =
  | "click"
  | "drag"
  | "keyboard"
  | "select-all";

export type InfiniteSelectableListItemState = {
  active: boolean;
  focused: boolean;
  selected: boolean;
};

export type InfiniteSelectableListSelectionIndicator = "none" | "checkbox" | "radio";

export type InfiniteSelectableListSelectionContext<T> = {
  anchorId: string | null;
  focusedId: string | null;
  reason: InfiniteSelectableListSelectionReason;
  selectedItems: T[];
};

export type InfiniteSelectableListProps<T> = {
  items: T[];
  getItemId: (item: T, index: number) => string;
  renderItem: (item: T, state: InfiniteSelectableListItemState, index: number) => ReactNode;
  height: number;
  itemHeight: number;
  ariaLabel?: string;
  overscan?: number;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  focusedId?: string | null;
  defaultFocusedId?: string | null;
  disabledIds?: string[];
  hasMore?: boolean;
  loading?: boolean;
  totalItemCount?: number;
  loadMoreThreshold?: number;
  loadingContent?: ReactNode;
  selectionIndicator?: InfiniteSelectableListSelectionIndicator;
  showScrollbar?: boolean;
  scrollbarAutoHide?: boolean;
  scrollbarThickness?: number;
  onSelectionChange?: (
    selectedIds: string[],
    context: InfiniteSelectableListSelectionContext<T>,
  ) => void;
  onFocusedItemChange?: (focusedId: string | null, item: T | null) => void;
  onItemActivate?: (item: T, index: number) => void;
  onLoadMore?: () => void | Promise<void>;
};

function selectionRange(ids: string[], fromId: string, toId: string) {
  const from = ids.indexOf(fromId);
  const to = ids.indexOf(toId);
  if (from < 0 || to < 0) return [toId];
  return ids.slice(Math.min(from, to), Math.max(from, to) + 1);
}

export function InfiniteSelectableList<T>({
  items,
  getItemId,
  renderItem,
  height,
  itemHeight,
  ariaLabel = "Selectable items",
  overscan = 4,
  selectedIds,
  defaultSelectedIds = [],
  focusedId,
  defaultFocusedId = null,
  disabledIds = [],
  hasMore = false,
  loading = false,
  totalItemCount,
  loadMoreThreshold = 5,
  loadingContent = "Loading more…",
  selectionIndicator = "none",
  showScrollbar = true,
  scrollbarAutoHide = false,
  scrollbarThickness = 10,
  onSelectionChange,
  onFocusedItemChange,
  onItemActivate,
  onLoadMore,
}: InfiniteSelectableListProps<T>) {
  const listId = useId().replace(/:/g, "");
  const [scrollTop, setScrollTop] = useState(0);
  const [internalSelectedIds, setInternalSelectedIds] = useState(defaultSelectedIds);
  const [internalFocusedId, setInternalFocusedId] = useState<string | null>(defaultFocusedId);
  const viewportRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<string | null>(defaultFocusedId);
  const dragRef = useRef<{
    additive: boolean;
    anchorId: string;
    base: Set<string>;
  } | null>(null);
  const requestedItemCount = useRef<number | null>(null);
  const isSelectionControlled = selectedIds !== undefined;
  const isFocusControlled = focusedId !== undefined;
  const selection = selectedIds ?? internalSelectedIds;
  const selectionRef = useRef(selection);
  const currentFocusedId = focusedId ?? internalFocusedId;
  const itemIds = useMemo(
    () => items.map((item, index) => getItemId(item, index)),
    [getItemId, items],
  );
  const disabledSet = useMemo(() => new Set(disabledIds), [disabledIds]);
  const enabledIds = useMemo(
    () => itemIds.filter((id) => !disabledSet.has(id)),
    [disabledSet, itemIds],
  );
  const virtualItemCount = Math.max(items.length + (hasMore ? 1 : 0), totalItemCount ?? 0);
  const range = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      virtualItemCount,
      Math.ceil((scrollTop + height) / itemHeight) + overscan,
    );
    return { start, end };
  }, [height, itemHeight, overscan, scrollTop, virtualItemCount]);

  const setFocus = useCallback(
    (id: string | null) => {
      if (!isFocusControlled) setInternalFocusedId(id);
      const index = id === null ? -1 : itemIds.indexOf(id);
      onFocusedItemChange?.(id, index >= 0 ? items[index] : null);
    },
    [isFocusControlled, itemIds, items, onFocusedItemChange],
  );

  const commitSelection = useCallback(
    (ids: Iterable<string>, reason: InfiniteSelectableListSelectionReason, nextFocusedId: string | null) => {
      const available = [...new Set(ids)].filter((id) => itemIds.includes(id) && !disabledSet.has(id));
      const unique = available;
      // Controlled consumers may not commit the callback value until a later render.
      // Keep an optimistic snapshot so rapid, non-contiguous choices build on the
      // latest interaction instead of the last rendered prop.
      selectionRef.current = unique;
      if (!isSelectionControlled) setInternalSelectedIds(unique);
      onSelectionChange?.(unique, {
        anchorId: anchorRef.current,
        focusedId: nextFocusedId,
        reason,
        selectedItems: unique
          .map((id) => items[itemIds.indexOf(id)])
          .filter((item): item is T => item !== undefined),
      });
    },
    [disabledSet, isSelectionControlled, itemIds, items, onSelectionChange],
  );

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const viewport = viewportRef.current;
      if (!viewport || index < 0) return;
      const rowTop = index * itemHeight;
      const rowBottom = rowTop + itemHeight;
      if (rowTop < viewport.scrollTop) viewport.scrollTop = rowTop;
      else if (rowBottom > viewport.scrollTop + height) viewport.scrollTop = rowBottom - height;
    },
    [height, itemHeight],
  );

  const selectAt = useCallback(
    (
      id: string,
      options: {
        additive: boolean;
        extend: boolean;
        forceAdd?: boolean;
        reason: InfiniteSelectableListSelectionReason;
      },
    ) => {
      if (disabledSet.has(id)) return;
      const currentSelection = selectionRef.current;
      const anchor = anchorRef.current && itemIds.includes(anchorRef.current)
        ? anchorRef.current
        : id;
      let next: string[];
      if (options.extend) {
        const rangeIds = selectionRange(enabledIds, anchor, id);
        next = options.additive ? [...currentSelection, ...rangeIds] : rangeIds;
      } else if (options.additive) {
        next = options.forceAdd
          ? currentSelection.includes(id)
            ? currentSelection
            : [...currentSelection, id]
          : currentSelection.includes(id)
            ? currentSelection.filter((selectedId) => selectedId !== id)
            : [...currentSelection, id];
        anchorRef.current = id;
      } else {
        next = [id];
        anchorRef.current = id;
      }
      setFocus(id);
      commitSelection(next, options.reason, id);
    },
    [commitSelection, disabledSet, enabledIds, itemIds, setFocus],
  );

  useEffect(() => {
    if (
      !hasMore ||
      loading ||
      !onLoadMore ||
      range.end < items.length - loadMoreThreshold ||
      requestedItemCount.current === items.length
    ) return;
    requestedItemCount.current = items.length;
    void onLoadMore();
  }, [hasMore, items.length, loadMoreThreshold, loading, onLoadMore, range.end]);

  useEffect(() => {
    const finishDrag = () => { dragRef.current = null; };
    window.addEventListener("mouseup", finishDrag);
    return () => {
      window.removeEventListener("mouseup", finishDrag);
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!enabledIds.length) return;
    const locatedIndex = enabledIds.indexOf(currentFocusedId ?? "");
    const currentIndex = locatedIndex < 0 ? 0 : locatedIndex;
    let nextIndex = currentIndex;
    if (event.key === "ArrowDown") nextIndex = locatedIndex < 0 ? 0 : Math.min(enabledIds.length - 1, currentIndex + 1);
    else if (event.key === "ArrowUp") nextIndex = locatedIndex < 0 ? enabledIds.length - 1 : Math.max(0, currentIndex - 1);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = enabledIds.length - 1;
    else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      commitSelection(enabledIds, "select-all", currentFocusedId);
      return;
    } else if ((event.ctrlKey || event.metaKey) && event.key === " ") {
      event.preventDefault();
      selectAt(enabledIds[currentIndex], {
        additive: true,
        extend: false,
        forceAdd: true,
        reason: "keyboard",
      });
      return;
    } else if (event.key === "Enter" && currentFocusedId) {
      const index = itemIds.indexOf(currentFocusedId);
      if (index >= 0) onItemActivate?.(items[index], index);
      return;
    } else return;

    event.preventDefault();
    const nextId = enabledIds[nextIndex];
    const itemIndex = itemIds.indexOf(nextId);
    scrollToIndex(itemIndex);
    if (event.ctrlKey || event.metaKey) setFocus(nextId);
    else selectAt(nextId, { additive: false, extend: event.shiftKey, reason: "keyboard" });
  };

  const viewport = (
    <div
      ref={viewportRef}
      aria-activedescendant={currentFocusedId ? `${listId}-option-${itemIds.indexOf(currentFocusedId)}` : undefined}
      aria-label={ariaLabel}
      aria-multiselectable="true"
      className={styles.viewport}
      data-opus-infinite-selectable-list-viewport=""
      data-custom-scrollbar={showScrollbar ? "true" : undefined}
      role="listbox"
      style={{ height }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onScroll={(event: UIEvent<HTMLDivElement>) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: virtualItemCount * itemHeight, position: "relative" }}>
        {items.slice(range.start, range.end).map((item, offset) => {
          const index = range.start + offset;
          const id = itemIds[index];
          const selected = selection.includes(id);
          const focused = currentFocusedId === id;
          const disabled = disabledSet.has(id);
          return (
            <div
              aria-disabled={disabled || undefined}
              aria-selected={selected}
              className={styles.row}
              data-item-id={id}
              data-focused={focused || undefined}
              data-selected={selected || undefined}
              id={`${listId}-option-${index}`}
              key={id}
              role="option"
              style={{ height: itemHeight, transform: `translateY(${index * itemHeight}px)` }}
              onDoubleClick={() => !disabled && onItemActivate?.(item, index)}
              onMouseDown={(event: MouseEvent<HTMLDivElement>) => {
                if (event.button !== 0 || disabled) return;
                const interactive = (event.target as HTMLElement).closest("button, a, input, select, textarea");
                if (interactive) return;
                event.preventDefault();
                viewportRef.current?.focus();
                const selectorClick = Boolean(
                  (event.target as HTMLElement).closest("[data-selection-control]"),
                );
                const modifierAdd = event.ctrlKey || event.metaKey;
                const additive =
                  selectionIndicator !== "none" || selectorClick || modifierAdd;
                dragRef.current = {
                  additive,
                  anchorId: id,
                  base: new Set(additive ? selectionRef.current : []),
                };
                selectAt(id, {
                  additive,
                  extend: event.shiftKey,
                  forceAdd: modifierAdd,
                  reason: "click",
                });
              }}
              onMouseEnter={(event) => {
                const drag = dragRef.current;
                if (!drag || event.buttons !== 1 || disabled) return;
                const ids = selectionRange(enabledIds, drag.anchorId, id);
                setFocus(id);
                commitSelection(drag.additive ? [...drag.base, ...ids] : ids, "drag", id);
              }}
            >
              <div
                className={selectionIndicator === "none" ? styles.rowContent : styles.rowWithIndicator}
              >
                {selectionIndicator !== "none" ? (
                  <span
                    className={styles.selectionControl}
                    data-kind={selectionIndicator}
                    data-selection-control=""
                  >
                    <input
                      aria-hidden="true"
                      checked={selected}
                      className={styles.selectionInput}
                      readOnly
                      tabIndex={-1}
                      type={selectionIndicator}
                    />
                    <span aria-hidden="true" className={styles.selectionVisual} />
                  </span>
                ) : null}
                <div className={styles.rowContent}>
                  {renderItem(item, { active: focused, focused, selected }, index)}
                </div>
              </div>
            </div>
          );
        })}
        {hasMore && range.end > items.length ? (
          <div
            aria-live="polite"
            className={`${styles.row} ${styles.loadingRow}`}
            role="status"
            style={{ height: itemHeight, transform: `translateY(${items.length * itemHeight}px)` }}
          >
            {loadingContent}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (!showScrollbar) return viewport;
  return (
    <CustomScrollbar
      autoHide={scrollbarAutoHide}
      label={ariaLabel}
      maxHeight={height}
      orientation="vertical"
      style={{ height }}
      thickness={scrollbarThickness}
      viewportSelector="[data-opus-infinite-selectable-list-viewport]"
    >
      {viewport}
    </CustomScrollbar>
  );
}
