"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { DEFAULT_FONT_FAMILY, googleFonts, useFontPreference, type GoogleFontFamily } from "@/components/FontPicker";
import type { Theme } from "@/components/fields";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import type { OpusThemeDefaults } from "@/components/OpusThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ContextMenuProvider } from "@/components/ContextMenu";
import { PersistentVideoPlayerProvider } from "@/components/VideoPlayer";
import {
  createAccentStyle,
  createBaseStyle,
  createTileAccentStyle,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_ACCENT_SECONDARY,
  DEFAULT_TILE_ACCENT,
  DEFAULT_TILE_ACCENT_SECONDARY,
} from "@/lib/theme/accentThemeStorage";
import {
  PREVIEW_THEME_STORAGE_KEY,
  parseTheme,
  writeStoredTheme,
} from "@/lib/theme/componentsThemeStorage";
import { useStoredTheme } from "@/lib/theme/useStoredTheme";

type ComponentsThemeContextValue = {
  pageHeader: {
    description: string;
    title: string;
  };
  accent: string;
  accentPairId: string;
  accentSecondary: string;
  accentStyle: CSSProperties | undefined;
  baseColor: string;
  fontFamily: GoogleFontFamily;
  previewFontFamily: GoogleFontFamily;
  previewAppearanceReady: boolean;
  previewAccent: string;
  previewAccentSecondary: string;
  previewTertiaryAccent: string;
  previewDefaults: OpusThemeDefaults;
  previewAccentStyle: CSSProperties | undefined;
  previewBaseColor: string;
  previewTheme: Theme;
  previewTileAccent: string;
  previewTileAccentSecondary: string;
  resetPreviewAccent: () => void;
  resetPreviewTileAccent: () => void;
  resetAccent: () => void;
  resetTileAccent: () => void;
  setPageHeader: (header: { description?: string; title: string }) => void;
  setAccent: (accent: string) => void;
  setAccentPair: (pairId: string) => void;
  setAccentSecondary: (accent: string) => void;
  setBaseColor: (color: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setPreviewFontFamily: (fontFamily: GoogleFontFamily) => void;
  setPreviewAccent: (accent: string) => void;
  setPreviewAccentSecondary: (accent: string) => void;
  setPreviewTertiaryAccent: (accent: string) => void;
  setPreviewDefaults: (defaults: OpusThemeDefaults) => void;
  setPreviewBaseColor: (color: string) => void;
  setPreviewTheme: (theme: Theme) => void;
  setPreviewTileAccent: (accent: string) => void;
  setPreviewTileAccentSecondary: (accent: string) => void;
  setTheme: (theme: Theme) => void;
  setTileAccent: (accent: string) => void;
  setTileAccentSecondary: (accent: string) => void;
  theme: Theme;
  tileAccent: string;
  tileAccentSecondary: string;
  tileAccentStyle: CSSProperties | undefined;
};

const defaultPageHeader = {
  description: "",
  title: "",
};

const BASE_COLOR_STORAGE_KEY = "opus-components-base-color";
const PREVIEW_ACCENT_STORAGE_KEY = "opus-components-preview-accent";
const PREVIEW_ACCENT_SECONDARY_STORAGE_KEY = "opus-components-preview-accent-secondary";
const PREVIEW_TERTIARY_ACCENT_STORAGE_KEY = "opus-components-preview-tertiary-accent";
const PREVIEW_BASE_COLOR_STORAGE_KEY = "opus-components-preview-base-color";
const PREVIEW_FONT_STORAGE_KEY = "opus-components-preview-font";
const PREVIEW_TILE_ACCENT_STORAGE_KEY = "opus-components-preview-tile-accent";
const PREVIEW_TILE_ACCENT_SECONDARY_STORAGE_KEY = "opus-components-preview-tile-accent-secondary";
const DEFAULT_BASE_COLOR = "#64748b";
const DEFAULT_TERTIARY_ACCENT = "#0ea5e9";
const googleFontSet = new Set<string>(googleFonts);

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function readPreferenceCookie(key: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${encodeURIComponent(key)}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return null;
  }
}

const ComponentsThemeContext = createContext<ComponentsThemeContextValue | null>(null);

export function useComponentsTheme() {
  const context = useContext(ComponentsThemeContext);
  if (!context) {
    throw new Error("useComponentsTheme must be used within ComponentsThemeProvider");
  }
  return context;
}

export function useSetComponentsPageHeader(title: string, description?: string) {
  const { setPageHeader } = useComponentsTheme();

  useEffect(() => {
    setPageHeader({ title, description: description ?? "" });
    return () => setPageHeader(defaultPageHeader);
  }, [description, setPageHeader, title]);
}

export function ComponentsThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useStoredTheme();
  const [previewTheme, setPreviewThemeState] = useState<Theme>("dark");
  const [baseColor, setBaseColorState] = useState(DEFAULT_BASE_COLOR);
  const [previewAccent, setPreviewAccentState] = useState(DEFAULT_ACCENT_COLOR);
  const [previewAccentSecondary, setPreviewAccentSecondaryState] = useState(DEFAULT_ACCENT_SECONDARY);
  const [previewTertiaryAccent, setPreviewTertiaryAccentState] = useState(DEFAULT_TERTIARY_ACCENT);
  const [previewDefaults, setPreviewDefaults] = useState<OpusThemeDefaults>({ radius: "standard", transparency: "standard", gradient: false });
  const [previewBaseColor, setPreviewBaseColorState] = useState(DEFAULT_BASE_COLOR);
  const [previewFontFamily, setPreviewFontFamilyState] = useState<GoogleFontFamily>(DEFAULT_FONT_FAMILY);
  const [previewTileAccent, setPreviewTileAccentState] = useState(DEFAULT_TILE_ACCENT);
  const [previewTileAccentSecondary, setPreviewTileAccentSecondaryState] = useState(
    DEFAULT_TILE_ACCENT_SECONDARY,
  );
  const [previewAppearanceReady, setPreviewAppearanceReady] = useState(false);
  const [pageHeader, setPageHeaderState] = useState(defaultPageHeader);
  const {
    accent,
    accentPairId,
    accentSecondary,
    accentStyle,
    resetAccent: resetAccentPreference,
    setAccent,
    setAccentPair,
    setAccentSecondary,
  } = useAccentPreference();
  const {
    resetTileAccent,
    setTileAccent,
    setTileAccentSecondary,
    tileAccent,
    tileAccentSecondary,
    tileAccentStyle,
  } = useTileAccentPreference();
  const { fontFamily, setFontFamily } = useFontPreference();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(BASE_COLOR_STORAGE_KEY);
      if (stored && isHexColor(stored)) {
        setBaseColorState(stored);
      }
    } catch {
      // Use the neutral default when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      const storedAccent = window.localStorage.getItem(PREVIEW_ACCENT_STORAGE_KEY)
        ?? readPreferenceCookie(PREVIEW_ACCENT_STORAGE_KEY);
      const storedAccentSecondary = window.localStorage.getItem(PREVIEW_ACCENT_SECONDARY_STORAGE_KEY)
        ?? readPreferenceCookie(PREVIEW_ACCENT_SECONDARY_STORAGE_KEY);
      const storedBase = window.localStorage.getItem(PREVIEW_BASE_COLOR_STORAGE_KEY)
        ?? readPreferenceCookie(PREVIEW_BASE_COLOR_STORAGE_KEY);
      const storedTertiaryAccent = window.localStorage.getItem(PREVIEW_TERTIARY_ACCENT_STORAGE_KEY)
        ?? readPreferenceCookie(PREVIEW_TERTIARY_ACCENT_STORAGE_KEY);
      const storedFont = window.localStorage.getItem(PREVIEW_FONT_STORAGE_KEY)
        ?? readPreferenceCookie(PREVIEW_FONT_STORAGE_KEY);
      const storedTileAccent = window.localStorage.getItem(PREVIEW_TILE_ACCENT_STORAGE_KEY)
        ?? readPreferenceCookie(PREVIEW_TILE_ACCENT_STORAGE_KEY);
      const storedTileAccentSecondary = window.localStorage.getItem(PREVIEW_TILE_ACCENT_SECONDARY_STORAGE_KEY)
        ?? readPreferenceCookie(PREVIEW_TILE_ACCENT_SECONDARY_STORAGE_KEY);
      const storedTheme = window.localStorage.getItem(PREVIEW_THEME_STORAGE_KEY)
        ?? readPreferenceCookie(PREVIEW_THEME_STORAGE_KEY)
        ?? document.documentElement.getAttribute("data-preview-theme");

      if (isHexColor(storedAccent ?? "")) setPreviewAccentState(storedAccent!);
      if (isHexColor(storedAccentSecondary ?? "")) setPreviewAccentSecondaryState(storedAccentSecondary!);
      if (isHexColor(storedBase ?? "")) setPreviewBaseColorState(storedBase!);
      if (isHexColor(storedTertiaryAccent ?? "")) setPreviewTertiaryAccentState(storedTertiaryAccent!);
      if (storedFont && googleFontSet.has(storedFont)) {
        setPreviewFontFamilyState(storedFont as GoogleFontFamily);
      }
      if (isHexColor(storedTileAccent ?? "")) setPreviewTileAccentState(storedTileAccent!);
      if (isHexColor(storedTileAccentSecondary ?? "")) {
        setPreviewTileAccentSecondaryState(storedTileAccentSecondary!);
      }
      setPreviewThemeState(parseTheme(storedTheme));
    } catch {
      // Keep the preview defaults when storage is unavailable.
    } finally {
      setPreviewAppearanceReady(true);
    }
  }, []);

  const persistPreviewValue = useCallback((key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Keep the in-memory selection when storage is unavailable.
    }
    try {
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`;
    } catch {
      // Keep the in-memory selection when cookies are unavailable.
    }
  }, []);

  const setPreviewAccent = useCallback((color: string) => {
    if (!isHexColor(color)) return;
    setPreviewAccentState(color);
    persistPreviewValue(PREVIEW_ACCENT_STORAGE_KEY, color);
  }, [persistPreviewValue]);

  const setPreviewAccentSecondary = useCallback((color: string) => {
    if (!isHexColor(color)) return;
    setPreviewAccentSecondaryState(color);
    persistPreviewValue(PREVIEW_ACCENT_SECONDARY_STORAGE_KEY, color);
  }, [persistPreviewValue]);

  const setPreviewBaseColor = useCallback((color: string) => {
    if (!isHexColor(color)) return;
    setPreviewBaseColorState(color);
    persistPreviewValue(PREVIEW_BASE_COLOR_STORAGE_KEY, color);
  }, [persistPreviewValue]);

  const setPreviewTertiaryAccent = useCallback((color: string) => {
    if (!isHexColor(color)) return;
    setPreviewTertiaryAccentState(color);
    persistPreviewValue(PREVIEW_TERTIARY_ACCENT_STORAGE_KEY, color);
  }, [persistPreviewValue]);

  const setPreviewFontFamily = useCallback((font: GoogleFontFamily) => {
    if (!googleFontSet.has(font)) return;
    setPreviewFontFamilyState(font);
    persistPreviewValue(PREVIEW_FONT_STORAGE_KEY, font);
  }, [persistPreviewValue]);

  const setPreviewTileAccent = useCallback((color: string) => {
    if (!isHexColor(color)) return;
    setPreviewTileAccentState(color);
    persistPreviewValue(PREVIEW_TILE_ACCENT_STORAGE_KEY, color);
  }, [persistPreviewValue]);

  const setPreviewTileAccentSecondary = useCallback((color: string) => {
    if (!isHexColor(color)) return;
    setPreviewTileAccentSecondaryState(color);
    persistPreviewValue(PREVIEW_TILE_ACCENT_SECONDARY_STORAGE_KEY, color);
  }, [persistPreviewValue]);

  const setPreviewTheme = useCallback((nextTheme: Theme) => {
    setPreviewThemeState(nextTheme);
    persistPreviewValue(PREVIEW_THEME_STORAGE_KEY, nextTheme);
    writeStoredTheme(PREVIEW_THEME_STORAGE_KEY, nextTheme);
  }, [persistPreviewValue]);

  const setBaseColor = useCallback((color: string) => {
    if (!isHexColor(color)) {
      return;
    }
    setBaseColorState(color);
    try {
      window.localStorage.setItem(BASE_COLOR_STORAGE_KEY, color);
    } catch {
      // Keep the in-memory selection when storage is unavailable.
    }
  }, []);

  const resetAccent = useCallback(() => {
    resetAccentPreference();
    setBaseColor(DEFAULT_BASE_COLOR);
  }, [resetAccentPreference, setBaseColor]);

  const setPageHeader = useCallback((header: { description?: string; title: string }) => {
    const nextDescription = header.description ?? "";

    setPageHeaderState((current) => {
      if (current.title === header.title && current.description === nextDescription) {
        return current;
      }

      return {
        title: header.title,
        description: nextDescription,
      };
    });
  }, []);

  const combinedStyle = useMemo(
    () => ({ ...accentStyle, ...tileAccentStyle, ...createBaseStyle(baseColor) }) as CSSProperties,
    [accentStyle, baseColor, tileAccentStyle],
  );

  const previewAccentStyle = useMemo(
    () => ({
      ...createAccentStyle(previewAccent, previewAccentSecondary),
      ...createTileAccentStyle(previewTileAccent, previewTileAccentSecondary),
      ...createBaseStyle(previewBaseColor),
      "--opus-accent-tertiary": previewTertiaryAccent,
    }) as CSSProperties,
    [previewAccent, previewAccentSecondary, previewBaseColor, previewTertiaryAccent, previewTileAccent, previewTileAccentSecondary],
  );

  const resetPreviewAccent = useCallback(() => {
    setPreviewAccent(DEFAULT_ACCENT_COLOR);
    setPreviewAccentSecondary(DEFAULT_ACCENT_SECONDARY);
    setPreviewBaseColor(DEFAULT_BASE_COLOR);
    setPreviewTertiaryAccent(DEFAULT_TERTIARY_ACCENT);
  }, [setPreviewAccent, setPreviewAccentSecondary, setPreviewBaseColor, setPreviewTertiaryAccent]);

  const resetPreviewTileAccent = useCallback(() => {
    setPreviewTileAccent(DEFAULT_TILE_ACCENT);
    setPreviewTileAccentSecondary(DEFAULT_TILE_ACCENT_SECONDARY);
  }, [setPreviewTileAccent, setPreviewTileAccentSecondary]);

  const contextValue = useMemo(
    () => ({
      accent,
      accentPairId,
      accentSecondary,
      accentStyle: combinedStyle,
      baseColor,
      fontFamily,
      pageHeader,
      previewAccent,
      previewAccentSecondary,
      previewTertiaryAccent,
      previewDefaults,
      previewAppearanceReady,
      previewAccentStyle,
      previewBaseColor,
      previewFontFamily,
      previewTheme,
      previewTileAccent,
      previewTileAccentSecondary,
      resetAccent,
      resetPreviewAccent,
      resetPreviewTileAccent,
      resetTileAccent,
      setAccent,
      setAccentPair,
      setAccentSecondary,
      setBaseColor,
      setFontFamily,
      setPageHeader,
      setPreviewAccent,
      setPreviewAccentSecondary,
      setPreviewTertiaryAccent,
      setPreviewDefaults,
      setPreviewBaseColor,
      setPreviewFontFamily,
      setPreviewTheme,
      setPreviewTileAccent,
      setPreviewTileAccentSecondary,
      setTheme,
      setTileAccent,
      setTileAccentSecondary,
      theme,
      tileAccent,
      tileAccentSecondary,
      tileAccentStyle,
    }),
    [
      accent,
      accentPairId,
      accentSecondary,
      baseColor,
      combinedStyle,
      fontFamily,
      pageHeader,
      previewAccent,
      previewAccentSecondary,
      previewTertiaryAccent,
      previewDefaults,
      previewAppearanceReady,
      previewAccentStyle,
      previewBaseColor,
      previewFontFamily,
      previewTheme,
      previewTileAccent,
      previewTileAccentSecondary,
      resetAccent,
      resetPreviewAccent,
      resetPreviewTileAccent,
      resetTileAccent,
      setAccent,
      setAccentPair,
      setAccentSecondary,
      setBaseColor,
      setFontFamily,
      setPageHeader,
      setPreviewAccent,
      setPreviewAccentSecondary,
      setPreviewTertiaryAccent,
      setPreviewDefaults,
      setPreviewBaseColor,
      setPreviewFontFamily,
      setPreviewTheme,
      setPreviewTileAccent,
      setPreviewTileAccentSecondary,
      setTheme,
      setTileAccent,
      setTileAccentSecondary,
      theme,
      tileAccent,
      tileAccentSecondary,
      tileAccentStyle,
    ],
  );

  return (
    <ComponentsThemeContext.Provider value={contextValue}>
      <OpusThemeProvider applyToDocument={false} theme={theme}>
        <DocsShellThemeIsolation />
        <div style={combinedStyle}>
          <ToastProvider>
            <ContextMenuProvider>
              <PersistentVideoPlayerProvider>{children}</PersistentVideoPlayerProvider>
            </ContextMenuProvider>
          </ToastProvider>
        </div>
      </OpusThemeProvider>
    </ComponentsThemeContext.Provider>
  );
}

/** Keep catalogue shell on data-shell-theme only — never leave data-theme on <html>. */
function DocsShellThemeIsolation() {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.removeAttribute("data-theme");
  }, []);

  return null;
}
