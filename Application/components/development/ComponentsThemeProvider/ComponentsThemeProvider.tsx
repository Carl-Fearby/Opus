"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useAccentPreference } from "opus-react";
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
  accentStyle: CSSProperties;
  fontFamily: GoogleFontFamily;
  previewTheme: Theme;
  setPageHeader: (header: { description?: string; title: string }) => void;
  setAccent: (accent: string) => void;
  setFontFamily: (fontFamily: string) => void;
  setPreviewTheme: (theme: Theme) => void;
  setTheme: (theme: Theme) => void;
  theme: Theme;
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
  const { accent, accentStyle, setAccent } = useAccentPreference();
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

  const contextValue = useMemo(
    () => ({
      accent,
      accentStyle,
      fontFamily,
      pageHeader,
      previewTheme,
      setAccent,
      setFontFamily,
      setPageHeader,
      setPreviewTheme,
      setTheme,
      theme,
    }),
    [accent, accentStyle, fontFamily, pageHeader, previewTheme, setAccent, setFontFamily, setPageHeader, setPreviewTheme, setTheme, theme],
  );

  return (
    <ComponentsThemeContext.Provider value={contextValue}>
      <OpusThemeProvider applyToDocument={false} theme={theme}>
        <div style={accentStyle}>
          <ToastProvider>
            <ContextMenuProvider>{children}</ContextMenuProvider>
          </ToastProvider>
        </div>
      </OpusThemeProvider>
    </ComponentsThemeContext.Provider>
  );
}
