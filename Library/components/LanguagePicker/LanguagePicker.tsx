"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  normalizeLocaleOptions,
  useOpusI18n,
  type OpusLocale,
  type OpusLocaleInput,
  type OpusLocaleOption,
} from "@/components/OpusI18n";
import {
  FieldShell,
  fieldInputAriaProps,
  useFieldShellAria,
} from "@/components/fields/FieldShell";
import { inputControlSizeClassName } from "@/components/fields/shared/inputControlSizes";
import shared from "@/components/fields/shared/fieldControl.module.css";
import type {
  FieldMode,
  InputControlSize,
  LabelPosition,
} from "@/components/fields/types";
import { createThemedPortal } from "@/lib/theme/createThemedPortal";
import styles from "./LanguagePicker.module.css";

/** Number of choices above which the list gains a search field. */
const SEARCH_THRESHOLD = 8;

function languageName(locale: OpusLocale, id: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(id) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Language name in the language the picker is currently showing. */
function displayLabel(option: OpusLocaleOption, locale: OpusLocale) {
  if (option.label) return option.label;

  const name = languageName(locale, option.id) ?? option.id;
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/** Case and diacritic insensitive, so "francais" finds "Français". */
function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * What a search may match: the name shown in the active language, the language's
 * own name (so "Français" and "اردو" are findable), its English exonym, and its
 * code. Someone browsing in Urdu can therefore still find a language by typing
 * "English", and someone in English can find it by typing "Français".
 */
function searchText(option: OpusLocaleOption, locale: OpusLocale) {
  return fold(
    [
      displayLabel(option, locale),
      option.label ?? "",
      languageName(option.id, option.id) ?? "",
      languageName("en", option.id) ?? "",
      option.id,
    ].join(" "),
  );
}

function compareNames(left: string, right: string, locale: OpusLocale) {
  try {
    return new Intl.Collator(locale, { sensitivity: "base" }).compare(left, right);
  } catch {
    return left.localeCompare(right);
  }
}

function LocaleFlag({ option }: { option: OpusLocaleOption }) {
  if (option.country) {
    return (
      <span
        aria-hidden="true"
        className={`fi fi-${option.country.toLowerCase()} ${styles.flag}`}
      />
    );
  }

  if (option.flag) {
    return (
      <span aria-hidden="true" className={styles.flagEmoji}>
        {option.flag}
      </span>
    );
  }

  return null;
}

export type LanguagePickerProps = {
  /** Renders the small top-bar pill instead of the labelled field. */
  compact?: boolean;
  /** Locales to offer. Defaults to the provider's `availableLocales`. */
  availableLocales?: readonly OpusLocaleInput[];
  /** Controlled value. Defaults to the provider's locale. */
  locale?: OpusLocale;
  /** Called with the chosen locale. Defaults to the provider's `onLocaleChange`. */
  onLocaleChange?: (locale: OpusLocale) => void;
  /** Field label. Defaults to the `language.label` message, then "Language". */
  label?: string;
  id?: string;
  /** Show the search field. Defaults to on when more than eight locales are offered. */
  searchable?: boolean;
  help?: string;
  error?: string;
  required?: boolean;
  mode?: FieldMode;
  labelPosition?: LabelPosition;
  size?: InputControlSize;
};

export function LanguagePicker({
  compact = false,
  availableLocales,
  locale: localeProp,
  onLocaleChange,
  label: labelProp,
  id: idProp,
  searchable,
  help,
  error,
  required,
  mode = "stacked",
  labelPosition,
  size = "md",
}: LanguagePickerProps) {
  const {
    availableLocales: providerLocales,
    locale: providerLocale,
    onLocaleChange: providerOnLocaleChange,
    t,
  } = useOpusI18n();
  const shellAria = useFieldShellAria();
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const listId = `${id}-list`;

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const locale = localeProp ?? providerLocale;
  const options = useMemo(() => {
    const normalized = normalizeLocaleOptions(availableLocales ?? providerLocales);
    // Keep the control usable when neither the host nor a provider offers a list.
    return normalized.length ? normalized : [{ id: locale }];
  }, [availableLocales, providerLocales, locale]);

  const label = labelProp ?? t("language.label", "Language");
  const searchLabel = t("language.search", "Search languages");
  const showSearch = searchable ?? options.length > SEARCH_THRESHOLD;

  const entries = useMemo(
    () =>
      options
        .map((option) => ({
          option,
          name: displayLabel(option, locale),
          haystack: searchText(option, locale),
        }))
        .sort((left, right) => compareNames(left.name, right.name, locale)),
    [locale, options],
  );

  const visibleEntries = useMemo(() => {
    const needle = fold(query.trim());
    if (!needle) return entries;
    return entries.filter((entry) => entry.haystack.includes(needle));
  }, [entries, query]);

  const current = entries.find((entry) => entry.option.id === locale);
  const currentName = current?.name ?? locale;
  const currentOption = current?.option ?? { id: locale };
  const changeLocale = onLocaleChange ?? providerOnLocaleChange;

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    setQuery("");
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const select = useCallback(
    (nextId: OpusLocale) => {
      changeLocale?.(nextId);
      close(true);
    },
    [changeLocale, close],
  );

  // Anchor the portalled panel to the trigger and keep it on screen.
  useLayoutEffect(() => {
    if (!open || !compact) return;

    const place = () => {
      const trigger = triggerRef.current;
      const panel = panelRef.current;
      if (!trigger || !panel) return;

      const anchor = trigger.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const viewportPadding = 12;
      const gap = 6;

      let top = anchor.bottom + gap;
      if (
        panelRect.height > 0 &&
        top + panelRect.height > window.innerHeight - viewportPadding &&
        anchor.top - gap - panelRect.height >= viewportPadding
      ) {
        top = anchor.top - gap - panelRect.height;
      }

      const width = panelRect.width || 260;
      const left = Math.min(
        Math.max(anchor.right - width, viewportPadding),
        Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
      );

      setPanelStyle({ position: "fixed", top, left, width });
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [compact, open, visibleEntries.length]);

  // Move focus into the panel so keyboard and screen-reader users land in it.
  useEffect(() => {
    if (!open) return;

    if (showSearch) {
      searchRef.current?.focus();
      return;
    }

    const panel = panelRef.current;
    const selected = panel?.querySelector<HTMLElement>('[aria-selected="true"]');
    (selected ?? panel?.querySelector<HTMLElement>('[role="option"]'))?.focus();
  }, [open, showSearch]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target) ||
        rootRef.current?.contains(target)
      ) {
        return;
      }
      close(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [close, open]);

  const handlePanelKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close(true);
        return;
      }

      const items = panelRef.current?.querySelectorAll<HTMLElement>('[role="option"]');
      if (!items?.length) return;

      const index = Array.prototype.indexOf.call(items, document.activeElement);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        items[index < 0 ? 0 : Math.min(index + 1, items.length - 1)].focus();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (index <= 0) {
          searchRef.current?.focus();
          return;
        }
        items[index - 1].focus();
      } else if (event.key === "Home" && index >= 0) {
        event.preventDefault();
        items[0].focus();
      } else if (event.key === "End" && index >= 0) {
        event.preventDefault();
        items[items.length - 1].focus();
      }
    },
    [close],
  );

  const searchField = showSearch ? (
    <input
      aria-label={searchLabel}
      className={compact ? styles.search : shared.search}
      placeholder={t("language.searchPlaceholder", "Search languages…")}
      ref={searchRef}
      type="search"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
    />
  ) : null;

  const optionRow = (entry: (typeof entries)[number]) => {
    const isCurrent = entry.option.id === locale;
    return (
      <button
        aria-selected={isCurrent}
        className={[
          compact ? styles.option : shared.option,
          isCurrent && compact ? styles.optionCurrent : "",
        ]
          .filter(Boolean)
          .join(" ")}
        key={entry.option.id}
        role="option"
        type="button"
        onClick={() => select(entry.option.id)}
      >
        <LocaleFlag option={entry.option} />
        <span className={compact ? styles.optionLabel : styles.fieldOptionLabel}>
          {entry.name}
        </span>
        {isCurrent ? (
          <span aria-hidden="true" className={styles.check}>
            ✓
          </span>
        ) : null}
      </button>
    );
  };

  const emptyState = (
    <p className={compact ? styles.empty : styles.fieldEmpty}>
      {t("language.noResults", "No languages match.")}
    </p>
  );

  const panel = open ? (
    compact ? (
      mounted
        ? createThemedPortal(
            <div
              className={styles.panel}
              onKeyDown={handlePanelKeyDown}
              ref={panelRef}
              style={panelStyle}
            >
              {searchField}
              <div aria-label={label} className={styles.list} id={listId} role="listbox">
                {visibleEntries.map(optionRow)}
                {visibleEntries.length === 0 ? emptyState : null}
              </div>
            </div>,
            document.body,
          )
        : null
    ) : (
      <div className={shared.panel} onKeyDown={handlePanelKeyDown} ref={panelRef}>
        {searchField}
        <div aria-label={label} className={shared.list} id={listId} role="listbox">
          {visibleEntries.map(optionRow)}
          {visibleEntries.length === 0 ? emptyState : null}
        </div>
      </div>
    )
  ) : null;

  const trigger = compact ? (
    <button
      aria-controls={open ? listId : undefined}
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={`${label}: ${currentName}`}
      className={styles.control}
      id={id}
      ref={triggerRef}
      type="button"
      onClick={() => (open ? close(false) : setOpen(true))}
    >
      {currentOption.country || currentOption.flag ? null : (
        <FontAwesomeIcon aria-hidden="true" className={styles.globe} icon={faGlobe} />
      )}
      <LocaleFlag option={currentOption} />
      <span className={styles.controlLabel}>{currentName}</span>
      <span aria-hidden="true" className={styles.chevron} />
    </button>
  ) : (
    <button
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={`${label}: ${currentName}`}
      className={[
        inputControlSizeClassName[size],
        shared.trigger,
        open ? shared.triggerOpen : "",
        error ? shared.triggerError : "",
      ]
        .filter(Boolean)
        .join(" ")}
      id={id}
      ref={triggerRef}
      type="button"
      onClick={() => (open ? close(false) : setOpen(true))}
      {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
    >
      <span className={styles.triggerValue}>
        <LocaleFlag option={currentOption} />
        <span>{currentName}</span>
      </span>
      <span aria-hidden="true" className={shared.chevron} />
    </button>
  );

  if (compact) {
    return (
      <>
        {trigger}
        {panel}
      </>
    );
  }

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div className={styles.root} ref={rootRef}>
        {trigger}
        {panel}
      </div>
    </FieldShell>
  );
}
