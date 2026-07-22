"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import type { TabsOrientation, TabsPanelMode, TabsVariant } from "@/components/fields/types";
import { CatalogIcon } from "@/components/CatalogIcon";
import { TabActiveLine } from "@/components/TabActiveLine";
import styles from "./Tabs.module.css";

export type TabItem = {
  content: ReactNode;
  disabled?: boolean;
  label: string;
  value: string;
};

const CARD_TAB_SHAPE_PATH =
  "M 0 43 L 16 43 C 26 43 30 39 30 33 V 10 C 30 6 34 3 41 3 H 152 C 161 3 167 6 171 12 L 184 30 C 189 37 200 43 220 43 Z";

type TabsProps = {
  "aria-label"?: string;
  className?: string;
  /** Card variant only: inset padding on the panel body (active mode). Prefer wrapping panel content instead. */
  cardPanelPadding?: boolean;
  defaultValue?: string;
  fitted?: boolean;
  items: TabItem[];
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  panelClassName?: string;
  panelContentClassName?: string;
  /** How tab panels are rendered. Card variant defaults to crossfade. */
  panelMode?: TabsPanelMode;
  /** Content aligned to the end of the tab row (e.g. context actions). */
  trailing?: ReactNode;
  value?: string;
  variant?: TabsVariant;
};

export function Tabs({
  "aria-label": ariaLabel = "Tabs",
  cardPanelPadding = false,
  className,
  defaultValue,
  fitted = false,
  items,
  onValueChange,
  orientation = "horizontal",
  panelClassName,
  panelContentClassName,
  panelMode,
  trailing,
  value,
  variant = "line",
}: TabsProps) {
  const generatedId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const firstEnabledValue = items.find((item) => !item.disabled)?.value ?? items[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabledValue);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const activeValue = value ?? internalValue;
  const activeItem = items.find((item) => item.value === activeValue) ?? items[0];
  const resolvedPanelMode = panelMode ?? (variant === "card" ? "crossfade" : "active");
  const isCardVariant = variant === "card";
  const canScrollTabs = orientation === "horizontal";

  const updateOverflow = useCallback(() => {
    const list = listRef.current;
    if (!list || !canScrollTabs) {
      setHasPrevious(false);
      setHasMore(false);
      return;
    }

    setHasPrevious(list.scrollLeft > 2);
    setHasMore(list.scrollWidth - list.scrollLeft - list.clientWidth > 2);
  }, [canScrollTabs]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !canScrollTabs) {
      return;
    }

    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(list);
    Array.from(list.children).forEach((child) => observer.observe(child));
    list.addEventListener("scroll", updateOverflow, { passive: true });

    return () => {
      observer.disconnect();
      list.removeEventListener("scroll", updateOverflow);
    };
  }, [canScrollTabs, items, updateOverflow, variant]);

  useEffect(() => {
    if (!canScrollTabs) {
      return;
    }

    const list = listRef.current;
    const activeTab = document.getElementById(`${generatedId}-${activeValue}-tab`);
    if (!list || !activeTab) {
      return;
    }

    const listRect = list.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const overflowLeft = tabRect.left < listRect.left + 8;
    const overflowRight = tabRect.right > listRect.right - 8;

    if (overflowLeft || overflowRight) {
      activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [activeValue, canScrollTabs, generatedId, items]);

  const scrollTabs = (direction: -1 | 1) => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    list.scrollBy({ left: direction * Math.max(list.clientWidth * 0.65, 140), behavior: "smooth" });
  };

  const setValue = (nextValue: string, focusTab = false) => {
    const item = items.find((candidate) => candidate.value === nextValue);
    if (!item || item.disabled) {
      return;
    }

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);

    if (focusTab) {
      window.requestAnimationFrame(() => {
        document.getElementById(`${generatedId}-${nextValue}-tab`)?.focus();
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabledItems = items.filter((item) => !item.disabled);
    const currentIndex = enabledItems.findIndex((item) => item.value === activeValue);
    const previousKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

    if (event.key !== previousKey && event.key !== nextKey && event.key !== "Home" && event.key !== "End") {
      return;
    }

    event.preventDefault();

    if (event.key === "Home") {
      setValue(enabledItems[0]?.value ?? activeValue, true);
      return;
    }

    if (event.key === "End") {
      setValue(enabledItems.at(-1)?.value ?? activeValue, true);
      return;
    }

    const offset = event.key === nextKey ? 1 : -1;
    const nextIndex = (currentIndex + offset + enabledItems.length) % enabledItems.length;
    setValue(enabledItems[nextIndex]?.value ?? activeValue, true);
  };

  const rootClassName = [styles.root, className].filter(Boolean).join(" ");
  const panelClassNames = [styles.panel, panelClassName].filter(Boolean).join(" ");
  const panelContentClassNames = [styles.panelContent, panelContentClassName].filter(Boolean).join(" ");

  return (
    <div
      className={rootClassName}
      data-card-panel-padding={isCardVariant && cardPanelPadding ? "true" : "false"}
      data-fitted={fitted}
      data-orientation={orientation}
      data-panel-mode={resolvedPanelMode}
      data-variant={variant}
    >
      <div className={styles.header}>
        <div
          className={styles.listViewport}
          data-has-more={hasMore ? "true" : "false"}
          data-has-previous={hasPrevious ? "true" : "false"}
        >
          <div
            aria-label={ariaLabel}
            aria-orientation={orientation}
            className={styles.list}
            onKeyDown={handleKeyDown}
            ref={listRef}
            role="tablist"
          >
            {items.map((item) => {
              const selected = item.value === activeValue;
              const tabId = `${generatedId}-${item.value}-tab`;
              const panelId = `${generatedId}-${item.value}-panel`;

              return (
                <button
                  aria-controls={panelId}
                  aria-selected={selected}
                  className={styles.tab}
                  disabled={item.disabled}
                  id={tabId}
                  key={item.value}
                  onClick={() => setValue(item.value)}
                  role="tab"
                  tabIndex={selected ? 0 : -1}
                  type="button"
                >
                  {isCardVariant ? (
                    <>
                      <span aria-hidden="true" className={styles.tabShape}>
                        <svg preserveAspectRatio="none" viewBox="0 0 220 43">
                          <path d={CARD_TAB_SHAPE_PATH} />
                        </svg>
                      </span>
                      <span className={styles.tabLabel}>{item.label}</span>
                      <TabActiveLine className={styles.cardTabLine} />
                    </>
                  ) : (
                    item.label
                  )}
                  {!isCardVariant && selected && variant === "line" ? (
                    <TabActiveLine orientation={orientation} />
                  ) : null}
                </button>
              );
            })}
          </div>
          {hasPrevious ? (
            <button
              aria-label="Show previous tabs"
              className={[styles.scrollButton, styles.previousButton].join(" ")}
              onClick={() => scrollTabs(-1)}
              type="button"
            >
              <CatalogIcon iconName="chevron-left" />
            </button>
          ) : null}
          {hasMore ? (
            <button
              aria-label="Show more tabs"
              className={[styles.scrollButton, styles.nextButton].join(" ")}
              onClick={() => scrollTabs(1)}
              type="button"
            >
              <CatalogIcon iconName="chevron-right" />
            </button>
          ) : null}
        </div>
        {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
      </div>
      {resolvedPanelMode === "crossfade" ? (
        <div className={panelClassNames}>
          {items.map((item) => {
            const selected = item.value === activeValue;
            const tabId = `${generatedId}-${item.value}-tab`;
            const panelId = `${generatedId}-${item.value}-panel`;

            return (
              <div
                aria-hidden={!selected}
                aria-labelledby={tabId}
                className={panelContentClassNames}
                data-active={selected ? "true" : "false"}
                id={panelId}
                inert={!selected ? true : undefined}
                key={item.value}
                role="tabpanel"
                tabIndex={selected ? -1 : undefined}
              >
                {item.content}
              </div>
            );
          })}
        </div>
      ) : activeItem ? (
        <div
          aria-labelledby={`${generatedId}-${activeItem.value}-tab`}
          className={panelClassNames}
          id={`${generatedId}-${activeItem.value}-panel`}
          role="tabpanel"
          tabIndex={-1}
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}
