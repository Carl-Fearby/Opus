"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { useFontPreference, type GoogleFontFamily } from "opus-react";
import type { Theme } from "opus-react";
import { OpusThemeProvider } from "opus-react";
import { ToastProvider } from "opus-react";
import { ContextMenuProvider } from "opus-react";
import {
  createAccentStyle,
  createTileAccentStyle,
  DEFAULT_ACCENT_COLOR,
  DEFAULT_ACCENT_SECONDARY,
  DEFAULT_TILE_ACCENT,
  DEFAULT_TILE_ACCENT_SECONDARY,
} from "@/lib/theme/accentThemeStorage";
import { useStoredPreviewTheme, useStoredTheme } from "@/lib/theme/useStoredTheme";

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
  previewAccent: string;
  previewAccentSecondary: string;
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
  setPreviewAccent: (accent: string) => void;
  setPreviewAccentSecondary: (accent: string) => void;
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
const DEFAULT_BASE_COLOR = "#64748b";

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
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
  const [previewTheme, setPreviewTheme] = useStoredPreviewTheme();
  const [baseColor, setBaseColorState] = useState(DEFAULT_BASE_COLOR);
  const [previewAccent, setPreviewAccent] = useState(DEFAULT_ACCENT_COLOR);
  const [previewAccentSecondary, setPreviewAccentSecondary] = useState(DEFAULT_ACCENT_SECONDARY);
  const [previewBaseColor, setPreviewBaseColor] = useState(DEFAULT_BASE_COLOR);
  const [previewTileAccent, setPreviewTileAccent] = useState(DEFAULT_TILE_ACCENT);
  const [previewTileAccentSecondary, setPreviewTileAccentSecondary] = useState(
    DEFAULT_TILE_ACCENT_SECONDARY,
  );
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
      if (stored && isHexColor(stored)) setBaseColorState(stored);
    } catch {
      // Use the neutral default when storage is unavailable.
    }
  }, []);

  const setBaseColor = useCallback((color: string) => {
    if (!isHexColor(color)) return;
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
    () => ({ ...accentStyle, ...tileAccentStyle, "--opus-base": baseColor }) as CSSProperties,
    [accentStyle, baseColor, tileAccentStyle],
  );

  const previewAccentStyle = useMemo(
    () => ({
      ...createAccentStyle(previewAccent, previewAccentSecondary),
      ...createTileAccentStyle(previewTileAccent, previewTileAccentSecondary),
      "--opus-base": previewBaseColor,
    }) as CSSProperties,
    [previewAccent, previewAccentSecondary, previewBaseColor, previewTileAccent, previewTileAccentSecondary],
  );

  const resetPreviewAccent = useCallback(() => {
    setPreviewAccent(DEFAULT_ACCENT_COLOR);
    setPreviewAccentSecondary(DEFAULT_ACCENT_SECONDARY);
    setPreviewBaseColor(DEFAULT_BASE_COLOR);
  }, []);

  const resetPreviewTileAccent = useCallback(() => {
    setPreviewTileAccent(DEFAULT_TILE_ACCENT);
    setPreviewTileAccentSecondary(DEFAULT_TILE_ACCENT_SECONDARY);
  }, []);

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
      previewAccentStyle,
      previewBaseColor,
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
      setPreviewBaseColor,
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
      previewAccentStyle,
      previewBaseColor,
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
      setPreviewBaseColor,
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
            <ContextMenuProvider>{children}</ContextMenuProvider>
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
