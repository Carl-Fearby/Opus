"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CatalogIcon } from "@/components/CatalogIcon";
import { useOpusTheme } from "@/components/OpusThemeProvider";
import {
  emojiCategories,
  filterEmojiCatalog,
  RECENT_EMOJI_CATEGORY,
  type EmojiCategoryId,
} from "@/lib/emojiCatalog";
import { addRecentEmoji, readRecentEmojis } from "@/lib/emojiRecentStorage";
import { opusThemeTokens } from "@/lib/theme/opusThemeTokens";
import {
  resolveEmojiPickerPortalStyle,
  type EmojiPickerPlacement,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import styles from "./EmojiPicker.module.css";

export type { EmojiPickerPlacement };

export type EmojiPickerProps = {
  className?: string;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  defaultOpen?: boolean;
  label?: string;
  onOpenChange?: (open: boolean) => void;
  onSelect: (emoji: string) => void;
  open?: boolean;
  placement?: EmojiPickerPlacement;
  searchPlaceholder?: string;
  trigger: ReactNode;
  triggerClassName?: string;
};

const DEFAULT_CATEGORY: EmojiCategoryId = "smileys";

function resolveDefaultCategory(recentEmojis: readonly string[]): EmojiCategoryId {
  return recentEmojis.length ? "recent" : DEFAULT_CATEGORY;
}

function mergeTrigger(
  trigger: ReactNode,
  triggerProps: {
    "aria-controls"?: string;
    "aria-expanded": boolean;
    "aria-haspopup": "dialog";
    onClick: () => void;
  },
  triggerClassName?: string,
) {
  if (isValidElement(trigger)) {
    const element = trigger as ReactElement<{ className?: string; onClick?: () => void }>;
    return cloneElement(element, {
      ...triggerProps,
      className: [element.props.className, triggerClassName].filter(Boolean).join(" ") || undefined,
      onClick: () => {
        element.props.onClick?.();
        triggerProps.onClick();
      },
    });
  }

  return (
    <button className={triggerClassName} type="button" {...triggerProps}>
      {trigger}
    </button>
  );
}

export function EmojiPicker({
  className,
  closeOnEscape = true,
  closeOnOutside = true,
  defaultOpen = false,
  label = "Open emoji picker",
  onOpenChange,
  onSelect,
  open,
  placement = "top",
  searchPlaceholder = "Search emojis",
  trigger,
  triggerClassName,
}: EmojiPickerProps) {
  const theme = useOpusTheme();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<EmojiCategoryId>(DEFAULT_CATEGORY);
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const controlled = open !== undefined;
  const visible = controlled ? open : internalOpen;
  const hasRecentEmojis = recentEmojis.length > 0;
  const searching = query.trim().length > 0;
  const filteredEmojis = useMemo(
    () => filterEmojiCatalog(query, activeCategory, recentEmojis),
    [activeCategory, query, recentEmojis],
  );
  const categoryTabs = useMemo(
    () =>
      hasRecentEmojis
        ? [
            {
              iconName: RECENT_EMOJI_CATEGORY.iconName,
              id: RECENT_EMOJI_CATEGORY.id,
              label: RECENT_EMOJI_CATEGORY.label,
            },
            ...emojiCategories.map((category) => ({
              iconName: category.iconName,
              id: category.id,
              label: category.label,
            })),
          ]
        : emojiCategories.map((category) => ({
            iconName: category.iconName,
            id: category.id,
            label: category.label,
          })),
    [hasRecentEmojis],
  );

  const setVisible = (nextOpen: boolean) => {
    if (!controlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      setQuery("");
    }
  };

  const openPicker = () => {
    const nextRecentEmojis = readRecentEmojis();
    setRecentEmojis(nextRecentEmojis);
    setActiveCategory(resolveDefaultCategory(nextRecentEmojis));
    setQuery("");
    setVisible(true);
  };

  const togglePicker = () => {
    if (visible) {
      setVisible(false);
      return;
    }

    openPicker();
  };

  const handleSelect = (emoji: string) => {
    setRecentEmojis(addRecentEmoji(emoji));
    onSelect(emoji);
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    const nextRecentEmojis = readRecentEmojis();
    setRecentEmojis(nextRecentEmojis);
    setActiveCategory(resolveDefaultCategory(nextRecentEmojis));
  }, [visible]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !rootRef.current) {
      setPortalStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = rootRef.current;
      if (!anchor) {
        return;
      }

      setPortalStyle(
        resolveEmojiPickerPortalStyle(
          anchor.getBoundingClientRect(),
          panelRef.current?.getBoundingClientRect() ?? null,
          placement,
        ),
      );
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [placement, visible, query, activeCategory, searching, recentEmojis.length, categoryTabs.length]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timeout = window.setTimeout(() => searchRef.current?.focus(), 0);

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        closeOnOutside &&
        !rootRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setVisible(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        setVisible(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, closeOnOutside, visible]);

  const panelStyle: CSSProperties = portalStyle
    ? {
        ...opusThemeTokens(theme),
        left: portalStyle.left,
        top: portalStyle.top,
        ...(portalStyle.width ? { width: portalStyle.width } : {}),
        visibility: "visible",
      }
    : { left: 0, top: 0, visibility: "hidden" };

  const panel = visible ? (
    <div
      aria-label="Emoji picker"
      className={styles.panel}
      data-opus-emoji-picker="true"
      data-placement={placement}
      data-portaled="true"
      data-theme={theme}
      id={panelId}
      ref={panelRef}
      role="dialog"
      style={panelStyle}
    >
      <div
        aria-label="Emoji categories"
        className={styles.categories}
        data-count={categoryTabs.length}
        role="tablist"
      >
        {categoryTabs.map((category) => (
          <button
            aria-label={category.label}
            aria-selected={activeCategory === category.id}
            className={styles.categoryButton}
            data-active={activeCategory === category.id ? "true" : undefined}
            key={category.id}
            role="tab"
            title={category.label}
            type="button"
            onClick={() => {
              setActiveCategory(category.id);
              setQuery("");
            }}
          >
            <CatalogIcon iconName={category.iconName} />
          </button>
        ))}
      </div>
      <input
        aria-label={searchPlaceholder}
        className={styles.search}
        placeholder={searchPlaceholder}
        ref={searchRef}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {searching ? (
        <p className={styles.searchHint}>Showing results from all categories.</p>
      ) : null}
      <div className={styles.grid} role="listbox">
        {filteredEmojis.length ? (
          filteredEmojis.map((entry, index) => (
            <button
              aria-label={entry.keywords[0] ?? entry.emoji}
              aria-selected="false"
              className={styles.emojiButton}
              key={`${entry.emoji}-${index}`}
              role="option"
              title={entry.keywords.join(", ")}
              type="button"
              onClick={() => handleSelect(entry.emoji)}
            >
              {entry.emoji}
            </button>
          ))
        ) : (
          <p className={styles.empty}>
            {activeCategory === "recent" ? "No recently used emojis yet." : "No emojis match your search."}
          </p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-opus-emoji-picker="true"
      data-placement={placement}
      ref={rootRef}
    >
      {mergeTrigger(
        trigger,
        {
          "aria-controls": visible ? panelId : undefined,
          "aria-expanded": visible,
          "aria-haspopup": "dialog",
          onClick: togglePicker,
        },
        triggerClassName,
      )}
      {portalReady && panel ? createPortal(panel, document.body) : null}
      <span className={styles.srOnly}>{label}</span>
    </div>
  );
}
