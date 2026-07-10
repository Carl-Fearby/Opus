"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Portal } from "@/components/Portal";
import { useOverlayAccessibility } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./CommandPalette.module.css";

export type CommandPaletteItem = {
  description?: string;
  disabled?: boolean;
  group?: string;
  id: string;
  label: string;
  shortcut?: string;
};

type CommandPalettePhase = "closing" | "opening";

const EXIT_ANIMATION_MS = 180;

type CommandPaletteProps = {
  closeOnSelect?: boolean;
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  emptyMessage?: string;
  items: CommandPaletteItem[];
  onClose: () => void;
  onSelect: (item: CommandPaletteItem) => void;
  open: boolean;
  placeholder?: string;
  query?: string;
  onQueryChange?: (query: string) => void;
  showDescriptions?: boolean;
  showGroups?: boolean;
  showShortcuts?: boolean;
};

function normalise(value: string) {
  return value.trim().toLowerCase();
}

function matchesItem(item: CommandPaletteItem, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [item.label, item.description, item.group]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function CommandPalette({
  closeOnSelect = true,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  emptyMessage = "No commands found.",
  items,
  onClose,
  onSelect,
  open,
  placeholder = "Search commands…",
  query,
  onQueryChange,
  showDescriptions = true,
  showGroups = true,
  showShortcuts = true,
}: CommandPaletteProps) {
  const titleId = useId();
  const inputId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(open);
  const [phase, setPhase] = useState<CommandPalettePhase>("opening");

  useOverlayAccessibility(open && rendered, panelRef, {
    initialFocusRef: inputRef,
  });
  const [internalQuery, setInternalQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const currentQuery = query ?? internalQuery;

  const filteredItems = useMemo(() => {
    const nextQuery = normalise(currentQuery);
    return items.filter((item) => !item.disabled && matchesItem(item, nextQuery));
  }, [currentQuery, items]);

  const groupedItems = useMemo(() => {
    if (!showGroups) {
      return [{ group: null as string | null, items: filteredItems }];
    }

    const groups = new Map<string | null, CommandPaletteItem[]>();

    for (const item of filteredItems) {
      const key = item.group ?? null;
      const bucket = groups.get(key) ?? [];
      bucket.push(item);
      groups.set(key, bucket);
    }

    return Array.from(groups.entries()).map(([group, groupItems]) => ({
      group,
      items: groupItems,
    }));
  }, [filteredItems, showGroups]);

  const flatItems = useMemo(
    () => groupedItems.flatMap((group) => group.items),
    [groupedItems],
  );

  useEffect(() => {
    let timeout: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (open) {
        setRendered(true);
        setPhase("opening");
        return;
      }

      setPhase("closing");
      timeout = window.setTimeout(() => setRendered(false), EXIT_ANIMATION_MS);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setActiveIndex(0);
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (activeIndex >= flatItems.length) {
      setActiveIndex(Math.max(0, flatItems.length - 1));
    }
  }, [activeIndex, flatItems.length]);

  useEffect(() => {
    if (!open || flatItems.length === 0) {
      return;
    }

    const activeItem = flatItems[activeIndex];
    if (!activeItem) {
      return;
    }

    const element = resultsRef.current?.querySelector<HTMLElement>(
      `#${CSS.escape(`${listboxId}-${activeItem.id}`)}`,
    );

    element?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, flatItems, listboxId, open]);

  useEffect(() => {
    if (!open || !dismissOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissOnEscape, onClose, open]);

  const setQuery = (next: string) => {
    if (onQueryChange) {
      onQueryChange(next);
    } else {
      setInternalQuery(next);
    }

    setActiveIndex(0);
  };

  const handleSelect = (item: CommandPaletteItem) => {
    if (item.disabled) {
      return;
    }

    onSelect(item);
    if (closeOnSelect) {
      onClose();
    }
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(flatItems.length - 1, 0)));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter" && flatItems[activeIndex]) {
      event.preventDefault();
      handleSelect(flatItems[activeIndex]);
    }
  };

  if (!rendered) {
    return null;
  }

  return (
    <Portal>
      <div
        className={styles.backdrop}
        data-dismissible={dismissOnBackdrop}
        data-phase={phase}
        onMouseDown={(event) => {
          if (event.currentTarget === event.target && dismissOnBackdrop) {
            onClose();
          }
        }}
      >
        <div
          ref={panelRef}
          aria-labelledby={titleId}
          aria-modal="true"
          className={styles.panel}
          data-phase={phase}
          role="dialog"
        >
        <h2 className={styles.visuallyHidden} id={titleId}>
          Command palette
        </h2>
        <label className={styles.searchWrap} htmlFor={inputId}>
          <span aria-hidden="true" className={styles.searchIcon}>
            <FontAwesomeIcon className={styles.searchIconSvg} icon={faMagnifyingGlass} />
          </span>
          <input
            ref={inputRef}
            aria-activedescendant={
              flatItems[activeIndex] ? `${listboxId}-${flatItems[activeIndex].id}` : undefined
            }
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={open}
            aria-label="Search commands"
            className={styles.searchInput}
            id={inputId}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
            role="combobox"
            type="search"
            value={currentQuery}
          />
        </label>

        <div
          ref={resultsRef}
          aria-label="Command results"
          className={styles.results}
          id={listboxId}
          role="listbox"
        >
          {flatItems.length === 0 ? (
            <p className={styles.empty} role="status">
              {emptyMessage}
            </p>
          ) : (
            groupedItems.map(({ group, items: groupItems }) => (
              <div key={group ?? "default"} className={styles.group}>
                {showGroups && group ? <p className={styles.groupLabel}>{group}</p> : null}
                {groupItems.map((item) => {
                  const index = flatItems.findIndex((entry) => entry.id === item.id);
                  const active = index === activeIndex;

                  return (
                    <button
                      key={item.id}
                      aria-selected={active}
                      className={styles.item}
                      data-active={active ? "true" : "false"}
                      id={`${listboxId}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      role="option"
                      type="button"
                    >
                      <span className={styles.itemMain}>
                        <span className={styles.itemLabel}>{item.label}</span>
                        {showDescriptions && item.description ? (
                          <span className={styles.itemDescription}>{item.description}</span>
                        ) : null}
                      </span>
                      {showShortcuts && item.shortcut ? (
                        <span aria-hidden="true" className={styles.shortcut}>
                          {item.shortcut}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <footer className={styles.footer}>
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </footer>
      </div>
    </div>
    </Portal>
  );
}
