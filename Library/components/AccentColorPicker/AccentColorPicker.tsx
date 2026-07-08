"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { FieldShell } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import styles from "./AccentColorPicker.module.css";

export const ACCENT_STORAGE_KEY = "opus-components-accent";
export const DEFAULT_ACCENT_COLOR = "#8f6cff";

export type AccentColor = {
  label: string;
  value: string;
};

export const accentColors: AccentColor[] = [
  { label: "Purple", value: "#8f6cff" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Green", value: "#22c55e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
];

function isAccentColor(value: string | null): value is string {
  return Boolean(value && accentColors.some((option) => option.value === value));
}

export function createAccentStyle(accent: string): CSSProperties {
  return {
    "--opus-user-accent": accent,
    "--opus-user-accent-soft": `color-mix(in srgb, ${accent} 16%, transparent)`,
    "--opus-accent": accent,
    "--opus-accent-soft": `color-mix(in srgb, ${accent} 16%, transparent)`,
    "--opus-accent-contrast": "#ffffff",
  } as CSSProperties;
}

function applyDocumentAccent(accent: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.style.setProperty("--opus-user-accent", accent);
  document.documentElement.style.setProperty(
    "--opus-user-accent-soft",
    `color-mix(in srgb, ${accent} 16%, transparent)`,
  );
}

export function useAccentPreference() {
  const [accent, setAccentState] = useState(DEFAULT_ACCENT_COLOR);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(ACCENT_STORAGE_KEY);
      if (isAccentColor(stored)) {
        applyDocumentAccent(stored);
        setAccentState(stored);
        return;
      }

      applyDocumentAccent(DEFAULT_ACCENT_COLOR);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const setAccent = useCallback((next: string) => {
    if (!isAccentColor(next)) {
      return;
    }

    setAccentState(next);
    applyDocumentAccent(next);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
  }, []);

  const accentStyle = useMemo(() => createAccentStyle(accent), [accent]);

  return { accent, accentStyle, setAccent };
}

type AccentColorPickerProps = {
  help?: string;
  id: string;
  label?: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  value: string;
  onChange: (value: string) => void;
};

export function AccentColorPicker({
  help,
  id,
  label = "Accent",
  labelPosition = "left",
  mode = "flagged",
  onChange,
  value,
}: AccentColorPickerProps) {
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
      <div aria-labelledby={`${id}-label`} className={styles.swatches} role="radiogroup">
        {accentColors.map((option) => {
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
    </FieldShell>
  );
}
