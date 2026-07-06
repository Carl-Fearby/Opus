"use client";

import { useId, useState, type ReactNode, type KeyboardEvent } from "react";
import type { TabsOrientation, TabsVariant } from "@/components/fields/types";
import styles from "./Tabs.module.css";

export type TabItem = {
  content: ReactNode;
  disabled?: boolean;
  label: string;
  value: string;
};

type TabsProps = {
  "aria-label"?: string;
  defaultValue?: string;
  fitted?: boolean;
  items: TabItem[];
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  value?: string;
  variant?: TabsVariant;
};

export function Tabs({
  "aria-label": ariaLabel = "Tabs",
  defaultValue,
  fitted = false,
  items,
  onValueChange,
  orientation = "horizontal",
  value,
  variant = "line",
}: TabsProps) {
  const generatedId = useId();
  const firstEnabledValue = items.find((item) => !item.disabled)?.value ?? items[0]?.value ?? "";
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabledValue);
  const activeValue = value ?? internalValue;
  const activeItem = items.find((item) => item.value === activeValue) ?? items[0];

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

  return (
    <div
      className={styles.root}
      data-fitted={fitted}
      data-orientation={orientation}
      data-variant={variant}
    >
      <div
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className={styles.list}
        onKeyDown={handleKeyDown}
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
              {item.label}
            </button>
          );
        })}
      </div>
      {activeItem ? (
        <div
          aria-labelledby={`${generatedId}-${activeItem.value}-tab`}
          className={styles.panel}
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
