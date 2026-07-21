"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { googleFonts, type GoogleFontFamily } from "./googleFonts";
import styles from "./FontPicker.module.css";

export const FONT_STORAGE_KEY = "opus-components-font";
export const DEFAULT_FONT_FAMILY: GoogleFontFamily = "Space Grotesk";

const fontSet = new Set<string>(googleFonts);
const previewLinkPrefix = "opus-google-font-preview-";

function isGoogleFont(value: string | null): value is GoogleFontFamily {
  return Boolean(value && fontSet.has(value));
}

function fontStack(family: string) {
  return `'${family.replaceAll("'", "\\'")}', ui-sans-serif, system-ui, sans-serif`;
}

function googleFontsUrl(fonts: readonly string[]) {
  const families = fonts
    .map((family) => `family=${encodeURIComponent(family).replaceAll("%20", "+")}`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function loadFontLinks(fonts: readonly string[]) {
  if (typeof document === "undefined") return;

  for (let index = 0; index < fonts.length; index += 20) {
    const chunkIndex = Math.floor(index / 20);
    const id = `${previewLinkPrefix}${chunkIndex}`;
    if (document.getElementById(id)) continue;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = googleFontsUrl(fonts.slice(index, index + 20));
    document.head.appendChild(link);
  }
}

function loadSelectedFont(family: string) {
  if (typeof document === "undefined") return;
  const id = "opus-google-font-selected";
  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing) {
    existing.href = googleFontsUrl([family]);
    return;
  }

  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = googleFontsUrl([family]);
  document.head.appendChild(link);
}

function applyDocumentFont(family: GoogleFontFamily) {
  if (typeof document === "undefined") return;
  document.documentElement.style.setProperty("--opus-font-family", fontStack(family));
  loadSelectedFont(family);
}

export function useFontPreference() {
  const [fontFamily, setFontFamilyState] = useState<GoogleFontFamily>(DEFAULT_FONT_FAMILY);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(FONT_STORAGE_KEY);
      const initial = isGoogleFont(stored) ? stored : DEFAULT_FONT_FAMILY;
      applyDocumentFont(initial);
      setFontFamilyState(initial);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const setFontFamily = useCallback((next: string) => {
    if (!isGoogleFont(next)) return;
    setFontFamilyState(next);
    applyDocumentFont(next);
    window.localStorage.setItem(FONT_STORAGE_KEY, next);
  }, []);

  return { fontFamily, setFontFamily };
}

type FontPickerProps = {
  compact?: boolean;
  id: string;
  value: GoogleFontFamily;
  onChange: (value: GoogleFontFamily) => void;
};

export function FontPicker({ compact = false, id, onChange, value }: FontPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const filteredFonts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return normalized
      ? googleFonts.filter((font) => font.toLocaleLowerCase().includes(normalized))
      : googleFonts;
  }, [query]);

  useEffect(() => {
    if (!open) return;
    loadFontLinks(googleFonts);
    searchRef.current?.focus();

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className={compact ? `${styles.field} ${styles.fieldCompact}` : styles.field} ref={rootRef}>
      {compact ? null : <span className={styles.label}>Font</span>}
      <div className={styles.picker}>
        <button
          aria-controls={`${id}-options`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={compact ? `Font, ${value}` : undefined}
          className={styles.trigger}
          id={id}
          style={{ fontFamily: fontStack(value) }}
          type="button"
          onClick={() => setOpen((current) => !current)}
        >
          <span className={styles.triggerText}>{value}</span>
          <span aria-hidden="true" className={styles.chevron} />
        </button>

        {open ? (
          <div className={styles.dropdown}>
            <div className={styles.searchWrap}>
              <input
                aria-label="Search Google Fonts"
                className={styles.search}
                placeholder="Search 100+ fonts…"
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {value !== DEFAULT_FONT_FAMILY ? (
                <button
                  aria-label="Reset font"
                  className={styles.reset}
                  title="Reset font"
                  type="button"
                  onClick={() => {
                    onChange(DEFAULT_FONT_FAMILY);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <FontAwesomeIcon icon={faRotateLeft} />
                </button>
              ) : null}
            </div>
            <div aria-label="Google Fonts" className={styles.options} id={`${id}-options`} role="listbox">
              {filteredFonts.map((font) => {
                const selected = font === value;
                return (
                  <button
                    aria-selected={selected}
                    className={styles.option}
                    data-selected={selected ? "true" : undefined}
                    key={font}
                    role="option"
                    style={{ "--font-preview": fontStack(font) } as CSSProperties}
                    type="button"
                    onClick={() => {
                      onChange(font);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className={styles.optionName}>{font}</span>
                    <span className={styles.optionPreview}>The quick brown fox</span>
                  </button>
                );
              })}
              {filteredFonts.length === 0 ? <p className={styles.empty}>No matching fonts</p> : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
