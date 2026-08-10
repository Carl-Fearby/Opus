"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type UIEvent } from "react";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import styles from "./VirtualList.module.css";

export type VirtualListProps<T> = {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => string | number;
  overscan?: number;
  ariaLabel?: string;
  onItemClick?: (item: T, index: number) => void;
  showScrollbar?: boolean;
  scrollbarAutoHide?: boolean;
  scrollbarThickness?: number;
  hasMore?: boolean;
  loading?: boolean;
  loadMoreThreshold?: number;
  loadingContent?: ReactNode;
  onLoadMore?: () => void | Promise<void>;
  totalItemCount?: number;
};

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  getKey,
  overscan = 4,
  ariaLabel = "Virtual list",
  onItemClick,
  showScrollbar = true,
  scrollbarAutoHide = false,
  scrollbarThickness = 10,
  hasMore = false,
  loading = false,
  loadMoreThreshold = 5,
  loadingContent = "Loading more…",
  onLoadMore,
  totalItemCount,
}: VirtualListProps<T>) {
  const [top, setTop] = useState(0);
  const requestedItemCount = useRef<number | null>(null);
  const virtualItemCount = Math.max(
    items.length + (hasMore ? 1 : 0),
    totalItemCount ?? 0,
  );
  const range = useMemo(() => {
    const start = Math.max(0, Math.floor(top / itemHeight) - overscan);
    const end = Math.min(virtualItemCount, Math.ceil((top + height) / itemHeight) + overscan);
    return { start, end };
  }, [height, itemHeight, overscan, top, virtualItemCount]);

  useEffect(() => {
    if (
      !hasMore ||
      loading ||
      !onLoadMore ||
      range.end < items.length - loadMoreThreshold ||
      requestedItemCount.current === items.length
    ) {
      return;
    }

    requestedItemCount.current = items.length;
    void onLoadMore();
  }, [hasMore, items.length, loadMoreThreshold, loading, onLoadMore, range.end]);

  const viewport = (
    <div
      aria-label={ariaLabel}
      className={styles.viewport}
      data-opus-virtual-list-viewport=""
      data-custom-scrollbar={showScrollbar ? "true" : undefined}
      role="list"
      style={{ height }}
      onScroll={(event: UIEvent<HTMLDivElement>) => setTop(event.currentTarget.scrollTop)}
    >
      <div style={{ height: virtualItemCount * itemHeight, position: "relative" }}>
        {items.slice(range.start, range.end).map((item, offset) => {
          const index = range.start + offset;
          return (
            <div
              className={styles.row}
              key={getKey?.(item, index) ?? index}
              role="listitem"
              style={{ height: itemHeight, transform: `translateY(${index * itemHeight}px)` }}
              onClick={() => onItemClick?.(item, index)}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
        {hasMore && range.end > items.length ? (
          <div
            aria-live="polite"
            className={`${styles.row} ${styles.loadingRow}`}
            role="status"
            style={{
              height: itemHeight,
              transform: `translateY(${Math.max(items.length, range.start) * itemHeight}px)`,
            }}
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
      viewportSelector="[data-opus-virtual-list-viewport]"
    >
      {viewport}
    </CustomScrollbar>
  );
}
