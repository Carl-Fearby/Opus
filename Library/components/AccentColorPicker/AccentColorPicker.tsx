"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FieldShell } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import {
  ACCENT_PAIR_STORAGE_KEY,
  ACCENT_SECONDARY_STORAGE_KEY,
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_ACCENT_PAIR_ID,
  DEFAULT_ACCENT_SECONDARY,
  DEFAULT_TILE_ACCENT,
  DEFAULT_TILE_ACCENT_SECONDARY,
  applyDocumentAccent,
  applyDocumentTileAccent,
  createAccentStyle,
  createTileAccentStyle,
  persistAccentState,
  persistTileAccentState,
  readStoredAccentState,
  readStoredTileAccentState,
} from "@/lib/theme/accentThemeStorage";
import styles from "./AccentColorPicker.module.css";

export {
  ACCENT_PAIR_STORAGE_KEY,
  ACCENT_SECONDARY_STORAGE_KEY,
  ACCENT_STORAGE_KEY,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_ACCENT_PAIR_ID,
  DEFAULT_ACCENT_SECONDARY,
  DEFAULT_TILE_ACCENT,
  DEFAULT_TILE_ACCENT_SECONDARY,
  createAccentStyle,
  createTileAccentStyle,
};

export type AccentColor = {
  label: string;
  value: string;
};

export type AccentPair = {
  id: string;
  label: string;
  primary: string;
  secondary: string;
};

/** Exact stops from Tile icon gradients (`TileGradientDefs`). */
export const TILE_PINK = "#ec4899";
export const TILE_TURQUOISE = "#0ea5e9";
export const TILE_MAGENTA = "#d946ef";
export const TILE_SKY = "#38bdf8";

/** Curated primary → secondary transitions used across Opus chrome. */
export const accentPairs: AccentPair[] = [
  { id: "violet-cyan", label: "Violet / Cyan", primary: "#8f6cff", secondary: "#0284c7" },
  { id: "pink-turquoise", label: "Pink / Turquoise", primary: TILE_PINK, secondary: TILE_TURQUOISE },
  { id: "turquoise-pink", label: "Turquoise / Pink", primary: TILE_TURQUOISE, secondary: TILE_PINK },
  { id: "blue-sky", label: "Blue / Sky", primary: "#3b82f6", secondary: "#38bdf8" },
  { id: "cyan-indigo", label: "Cyan / Indigo", primary: "#06b6d4", secondary: "#6366f1" },
  { id: "green-teal", label: "Green / Teal", primary: "#22c55e", secondary: "#14b8a6" },
  { id: "amber-orange", label: "Amber / Orange", primary: "#f59e0b", secondary: "#f97316" },
  { id: "rose-fuchsia", label: "Rose / Fuchsia", primary: "#f43f5e", secondary: "#e879f9" },
];

/** Always-visible top-bar swatches (optional). */
export const accentQuickColors: AccentColor[] = [
  { label: "Violet", value: "#8f6cff" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Green", value: "#22c55e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Pink", value: TILE_PINK },
  { label: "Turquoise", value: TILE_TURQUOISE },
];

/** Shared swatch palette for accent and second-accent menus. */
export const accentPalette: AccentColor[] = [
  { label: "Crimson", value: "#dc2626" },
  { label: "Red", value: "#ef4444" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Coral", value: "#fb7185" },
  { label: "Burnt orange", value: "#ea580c" },
  { label: "Orange", value: "#f97316" },
  { label: "Tangerine", value: "#fb923c" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Gold", value: "#eab308" },
  { label: "Yellow", value: "#facc15" },
  { label: "Lime", value: "#a3e635" },
  { label: "Chartreuse", value: "#84cc16" },
  { label: "Green", value: "#22c55e" },
  { label: "Emerald", value: "#10b981" },
  { label: "Forest", value: "#16a34a" },
  { label: "Mint", value: "#34d399" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Aqua", value: "#2dd4bf" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Deep cyan", value: "#0284c7" },
  { label: "Sky", value: TILE_SKY },
  { label: "Turquoise", value: TILE_TURQUOISE },
  { label: "Blue", value: "#3b82f6" },
  { label: "Royal", value: "#2563eb" },
  { label: "Cobalt", value: "#1d4ed8" },
  { label: "Navy", value: "#1e40af" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Iris", value: "#818cf8" },
  { label: "Violet", value: "#8f6cff" },
  { label: "Purple", value: "#a855f7" },
  { label: "Grape", value: "#7c3aed" },
  { label: "Amethyst", value: "#c084fc" },
  { label: "Fuchsia", value: "#e879f9" },
  { label: "Magenta", value: TILE_MAGENTA },
  { label: "Pink", value: TILE_PINK },
  { label: "Hot pink", value: "#f472b6" },
  { label: "Slate", value: "#64748b" },
  { label: "Steel", value: "#94a3b8" },
  { label: "Silver", value: "#cbd5e1" },
  { label: "Stone", value: "#78716c" },
  { label: "Bronze", value: "#b45309" },
  { label: "Copper", value: "#c2410c" },
];

/** @deprecated Prefer `accentQuickColors` / `accentPalette`. */
export const accentColors: AccentColor[] = accentQuickColors;

/** @deprecated Prefer `accentPalette`. */
export const accentPrimaryColors: AccentColor[] = accentPalette;

/** @deprecated Prefer `accentPalette`. */
export const accentSecondaryColors: AccentColor[] = accentPalette;

function isHexColor(value: string | null | undefined): value is string {
  return Boolean(value && /^#[0-9a-fA-F]{6}$/.test(value));
}

function findPairById(id: string | null | undefined) {
  return accentPairs.find((pair) => pair.id === id) ?? null;
}

function findPairByPrimary(primary: string | null | undefined) {
  return accentPairs.find((pair) => pair.primary === primary) ?? null;
}

function companionForPrimary(primary: string) {
  return findPairByPrimary(primary)?.secondary ?? DEFAULT_ACCENT_SECONDARY;
}

function colorLabel(value: string) {
  return (
    accentQuickColors.find((option) => option.value === value)?.label ??
    accentPalette.find((option) => option.value === value)?.label ??
    value
  );
}

function pairLabel(primary: string, secondary: string) {
  const matched = accentPairs.find(
    (pair) => pair.primary === primary && pair.secondary === secondary,
  );
  if (matched) {
    return matched.label;
  }

  return `${colorLabel(primary)} / ${colorLabel(secondary)}`;
}

export function useAccentPreference() {
  const [accent, setAccentState] = useState(DEFAULT_ACCENT_COLOR);
  const [accentSecondary, setAccentSecondaryState] = useState(DEFAULT_ACCENT_SECONDARY);
  const [accentPairId, setAccentPairIdState] = useState(DEFAULT_ACCENT_PAIR_ID);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const stored = readStoredAccentState();
    setAccentState(stored.accent);
    setAccentSecondaryState(stored.accentSecondary);
    setAccentPairIdState(stored.accentPairId);
    applyDocumentAccent(stored.accent, stored.accentSecondary);
    const matchedPair = accentPairs.find(
      (pair) => pair.primary === stored.accent && pair.secondary === stored.accentSecondary,
    );
    persistAccentState(stored.accent, stored.accentSecondary, matchedPair?.id ?? null);
    setReady(true);
  }, []);

  const applyPair = useCallback((pair: AccentPair) => {
    setAccentState(pair.primary);
    setAccentSecondaryState(pair.secondary);
    setAccentPairIdState(pair.id);
    applyDocumentAccent(pair.primary, pair.secondary);
    persistAccentState(pair.primary, pair.secondary, pair.id);
    setReady(true);
  }, []);

  const setAccent = useCallback(
    (next: string) => {
      if (!isHexColor(next)) {
        return;
      }

      const matched = accentPairs.find(
        (pair) => pair.primary === next && pair.secondary === accentSecondary,
      );
      setAccentState(next);
      setAccentPairIdState(matched?.id ?? accentPairId);
      applyDocumentAccent(next, accentSecondary);
      persistAccentState(next, accentSecondary, matched?.id ?? null);
      setReady(true);
    },
    [accentPairId, accentSecondary],
  );

  const setAccentSecondary = useCallback(
    (next: string) => {
      if (!isHexColor(next)) {
        return;
      }

      setAccentSecondaryState(next);
      const matched = accentPairs.find(
        (pair) => pair.primary === accent && pair.secondary === next,
      );
      setAccentPairIdState(matched?.id ?? accentPairId);
      applyDocumentAccent(accent, next);
      persistAccentState(accent, next, matched?.id ?? null);
      setReady(true);
    },
    [accent, accentPairId],
  );

  const setAccentPair = useCallback(
    (pairId: string) => {
      const pair = findPairById(pairId);
      if (!pair) {
        return;
      }
      applyPair(pair);
    },
    [applyPair],
  );

  const resetAccent = useCallback(() => {
    const pair = findPairById(DEFAULT_ACCENT_PAIR_ID);
    if (!pair) {
      return;
    }
    applyPair(pair);
  }, [applyPair]);

  const accentStyle = useMemo(
    () => (ready ? createAccentStyle(accent, accentSecondary) : undefined),
    [accent, accentSecondary, ready],
  );

  return {
    accent,
    accentPairId,
    accentSecondary,
    accentStyle,
    resetAccent,
    setAccent,
    setAccentPair,
    setAccentSecondary,
  };
}

export function useTileAccentPreference() {
  const [tileAccent, setTileAccentState] = useState(DEFAULT_TILE_ACCENT);
  const [tileAccentSecondary, setTileAccentSecondaryState] = useState(DEFAULT_TILE_ACCENT_SECONDARY);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const stored = readStoredTileAccentState();
    setTileAccentState(stored.tileAccent);
    setTileAccentSecondaryState(stored.tileAccentSecondary);
    applyDocumentTileAccent(stored.tileAccent, stored.tileAccentSecondary);
    persistTileAccentState(stored.tileAccent, stored.tileAccentSecondary);
    setReady(true);
  }, []);

  const setTileAccent = useCallback(
    (next: string) => {
      if (!isHexColor(next)) {
        return;
      }

      setTileAccentState(next);
      applyDocumentTileAccent(next, tileAccentSecondary);
      persistTileAccentState(next, tileAccentSecondary);
      setReady(true);
    },
    [tileAccentSecondary],
  );

  const setTileAccentSecondary = useCallback(
    (next: string) => {
      if (!isHexColor(next)) {
        return;
      }

      setTileAccentSecondaryState(next);
      applyDocumentTileAccent(tileAccent, next);
      persistTileAccentState(tileAccent, next);
      setReady(true);
    },
    [tileAccent],
  );

  const resetTileAccent = useCallback(() => {
    setTileAccentState(DEFAULT_TILE_ACCENT);
    setTileAccentSecondaryState(DEFAULT_TILE_ACCENT_SECONDARY);
    applyDocumentTileAccent(DEFAULT_TILE_ACCENT, DEFAULT_TILE_ACCENT_SECONDARY);
    persistTileAccentState(DEFAULT_TILE_ACCENT, DEFAULT_TILE_ACCENT_SECONDARY);
    setReady(true);
  }, []);

  const tileAccentStyle = useMemo(
    () => (ready ? createTileAccentStyle(tileAccent, tileAccentSecondary) : undefined),
    [ready, tileAccent, tileAccentSecondary],
  );

  return {
    resetTileAccent,
    setTileAccent,
    setTileAccentSecondary,
    tileAccent,
    tileAccentSecondary,
    tileAccentStyle,
  };
}

type AccentColorPickerProps = {
  help?: string;
  id: string;
  label?: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  /** Primary accent hex. */
  value: string;
  /** Secondary accent hex. Defaults to the curated companion for `value`. */
  secondaryValue?: string;
  /** Label for the primary swatch grid inside the menu. */
  primarySectionLabel?: string;
  /** Label for the secondary swatch grid inside the menu. */
  secondarySectionLabel?: string;
  /** Default primary used by reset. */
  defaultValue?: string;
  /** Default secondary used by reset. */
  defaultSecondaryValue?: string;
  /** When true, also show the compact quick-swatch row. */
  showQuickSwatches?: boolean;
  /**
   * `compact` — top-bar blob + dropdown.
   * `panel` — always-visible Accent / Second accent grids (modal).
   */
  variant?: "compact" | "panel";
  onChange: (value: string) => void;
  onSecondaryChange?: (value: string) => void;
  onReset?: () => void;
};

function AccentSwatchGrid({
  label,
  onSelect,
  selectedValue,
}: {
  label: string;
  onSelect: (value: string) => void;
  selectedValue: string;
}) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>{label}</p>
      <div aria-label={label} className={styles.swatches} role="radiogroup">
        {accentPalette.map((option) => {
          const selected = selectedValue === option.value;

          return (
            <button
              aria-checked={selected}
              aria-label={`${option.label} ${label.toLowerCase()}`}
              className={styles.swatch}
              data-selected={selected ? "true" : undefined}
              key={`${label}-${option.value}`}
              role="radio"
              style={{ "--accent-option": option.value } as CSSProperties}
              title={`${option.label} (${label.toLowerCase()})`}
              type="button"
              onClick={() => onSelect(option.value)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function AccentColorPicker({
  help,
  id,
  label = "Accent",
  labelPosition = "left",
  mode = "flagged",
  onChange,
  onSecondaryChange,
  onReset,
  primarySectionLabel = "Accent",
  secondarySectionLabel = "Second accent",
  defaultValue = DEFAULT_ACCENT_COLOR,
  defaultSecondaryValue = DEFAULT_ACCENT_SECONDARY,
  secondaryValue,
  showQuickSwatches = false,
  variant = "compact",
  value,
}: AccentColorPickerProps) {
  const resolvedSecondary = secondaryValue ?? companionForPrimary(value);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selectedLabel = pairLabel(value, resolvedSecondary);
  const isDefault = value === defaultValue && resolvedSecondary === defaultSecondaryValue;

  useEffect(() => {
    if (!open || variant !== "compact") {
      return;
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, variant]);

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange(defaultValue);
      onSecondaryChange?.(defaultSecondaryValue);
    }
    setOpen(false);
  };

  const paletteBody = (
    <>
      <AccentSwatchGrid label={primarySectionLabel} selectedValue={value} onSelect={onChange} />
      <AccentSwatchGrid
        label={secondarySectionLabel}
        selectedValue={resolvedSecondary}
        onSelect={(next) => onSecondaryChange?.(next)}
      />
    </>
  );

  if (variant === "panel") {
    return (
      <div className={styles.panel} id={id}>
        <div className={styles.panelHeader}>
          <span
            aria-hidden="true"
            className={styles.blob}
            style={
              {
                "--accent-option": value,
                "--accent-option-secondary": resolvedSecondary,
              } as CSSProperties
            }
          />
          <p className={styles.summary}>{selectedLabel}</p>
          <button
            aria-label={`Reset ${label.toLowerCase()} colours`}
            className={styles.reset}
            disabled={isDefault}
            title={`Reset ${label.toLowerCase()}`}
            type="button"
            onClick={handleReset}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
        </div>
        {paletteBody}
      </div>
    );
  }

  return (
    <FieldShell
      fitContent
      flaggedAlign="center"
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="div"
      mode={mode}
    >
      <div className={styles.picker} ref={rootRef}>
        {showQuickSwatches ? (
          <div
            aria-labelledby={`${id}-label`}
            className={styles.quickSwatches}
            role="radiogroup"
          >
            {accentQuickColors.map((option) => {
              const selected = value === option.value;

              return (
                <button
                  aria-checked={selected}
                  aria-label={option.label}
                  className={styles.swatch}
                  data-selected={selected ? "true" : undefined}
                  key={option.value}
                  role="radio"
                  style={{ "--accent-option": option.value } as CSSProperties}
                  title={option.label}
                  type="button"
                  onClick={() => onChange(option.value)}
                />
              );
            })}
          </div>
        ) : null}

        <button
          aria-controls={menuId}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`${label}, ${selectedLabel}`}
          className={styles.trigger}
          style={
            {
              "--accent-option": value,
              "--accent-option-secondary": resolvedSecondary,
            } as CSSProperties
          }
          title={`${label} · ${selectedLabel}`}
          type="button"
          onClick={() => setOpen((current) => !current)}
        >
          <span aria-hidden="true" className={styles.blob} />
          <span aria-hidden="true" className={styles.chevron} />
        </button>

        {!isDefault ? (
          <button
            aria-label={`Reset ${label.toLowerCase()} colours`}
            className={styles.reset}
            title={`Reset ${label.toLowerCase()}`}
            type="button"
            onClick={handleReset}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </button>
        ) : null}

        {open ? (
          <div
            aria-label={`${label} colours`}
            className={styles.dropdown}
            id={menuId}
            role="dialog"
          >
            {paletteBody}
            <div className={styles.footer}>
              <p className={styles.summary}>{selectedLabel}</p>
              {!isDefault ? (
                <button className={styles.resetText} type="button" onClick={handleReset}>
                  Reset
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
