"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { useFontPreference, type GoogleFontFamily } from "opus-react";
import type { Theme } from "opus-react";
import { OpusThemeProvider } from "opus-react";
import { ToastProvider } from "opus-react";
import { ContextMenuProvider } from "opus-react";
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
  fontFamily: GoogleFontFamily;
  previewTheme: Theme;
  resetAccent: () => void;
  resetTileAccent: () => void;
  setPageHeader: (header: { description?: string; title: string }) => void;
  setAccent: (accent: string) => void;
  setAccentPair: (pairId: string) => void;
  setAccentSecondary: (accent: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setPreviewTheme: (theme: Theme) => void;
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
  const [pageHeader, setPageHeaderState] = useState(defaultPageHeader);
  const {
    accent,
    accentPairId,
    accentSecondary,
    accentStyle,
    resetAccent,
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
    () => ({ ...accentStyle, ...tileAccentStyle }) as CSSProperties | undefined,
    [accentStyle, tileAccentStyle],
  );

  const contextValue = useMemo(
    () => ({
      accent,
      accentPairId,
      accentSecondary,
      accentStyle: combinedStyle,
      fontFamily,
      pageHeader,
      previewTheme,
      resetAccent,
      resetTileAccent,
      setAccent,
      setAccentPair,
      setAccentSecondary,
      setFontFamily,
      setPageHeader,
      setPreviewTheme,
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
      combinedStyle,
      fontFamily,
      pageHeader,
      previewTheme,
      resetAccent,
      resetTileAccent,
      setAccent,
      setAccentPair,
      setAccentSecondary,
      setFontFamily,
      setPageHeader,
      setPreviewTheme,
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
