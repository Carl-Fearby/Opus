"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./ShowMore.module.css";

type ShowMoreProps = {
  children: ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  maxLines?: number;
  onExpandedChange?: (expanded: boolean) => void;
  showLessLabel?: string;
  showMoreLabel?: string;
};

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className={styles.chevron} viewBox="0 0 16 16">
      <path
        d="M4 6.2 8 10.2 12 6.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function ShowMore({
  children,
  defaultExpanded = false,
  expanded,
  maxLines = 3,
  onExpandedChange,
  showLessLabel = "Show less",
  showMoreLabel = "Show more",
}: ShowMoreProps) {
  const contentId = useId();
  const shellRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [canExpand, setCanExpand] = useState(false);
  const [heights, setHeights] = useState<{ collapsed: number; full: number } | null>(null);
  const isExpanded = expanded ?? internalExpanded;
  const clampLines = Math.max(1, maxLines);

  const measureHeights = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) {
      return;
    }

    const lineHeight = Number.parseFloat(getComputedStyle(inner).lineHeight);
    const innerRect = inner.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(inner);
    const contentRect = range.getBoundingClientRect();
    const rangeHeight = Math.max(0, contentRect.bottom - innerRect.top);
    const full = Math.ceil(Math.max(inner.scrollHeight, innerRect.height, rangeHeight));
    const collapsed = Number.isFinite(lineHeight) ? Math.ceil(lineHeight * clampLines) : full;

    setHeights({ collapsed, full });
    setCanExpand(full > collapsed + 1);
  }, [clampLines]);

  useLayoutEffect(() => {
    measureHeights();
  }, [children, measureHeights]);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    const shell = shellRef.current;
    if (!inner || !shell || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureHeights();
    });

    observer.observe(inner);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [measureHeights]);

  useLayoutEffect(() => {
    if (!isExpanded) {
      return;
    }

    const frame = requestAnimationFrame(measureHeights);
    return () => cancelAnimationFrame(frame);
  }, [isExpanded, measureHeights]);

  useLayoutEffect(() => {
    const fonts = document.fonts;
    if (!fonts) {
      return;
    }

    let cancelled = false;
    void fonts.ready.then(() => {
      if (!cancelled) {
        measureHeights();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [measureHeights]);

  const handleToggle = () => {
    const next = !isExpanded;
    if (expanded === undefined) {
      setInternalExpanded(next);
    }
    onExpandedChange?.(next);
  };

  const showToggle = isExpanded || canExpand;
  const shellStyle = {
    "--show-more-lines": clampLines,
    ...(heights
      ? {
          "--show-more-collapsed-height": `${heights.collapsed}px`,
          "--show-more-full-height": `${heights.full}px`,
        }
      : {}),
  } as CSSProperties;

  return (
    <div className={styles.root}>
      <div
        ref={shellRef}
        className={styles.contentShell}
        data-expanded={isExpanded ? "true" : "false"}
        data-measured={heights ? "true" : "false"}
        id={contentId}
        inert={!isExpanded || undefined}
        style={shellStyle}
      >
        <div ref={innerRef} className={styles.inner}>
          {children}
        </div>
      </div>
      {showToggle ? (
        <button
          aria-controls={contentId}
          aria-expanded={isExpanded}
          className={styles.toggle}
          data-expanded={isExpanded ? "true" : "false"}
          onClick={handleToggle}
          type="button"
        >
          <span key={isExpanded ? "less" : "more"} className={styles.toggleLabel}>
            {isExpanded ? showLessLabel : showMoreLabel}
          </span>
          <ChevronIcon />
        </button>
      ) : null}
    </div>
  );
}
