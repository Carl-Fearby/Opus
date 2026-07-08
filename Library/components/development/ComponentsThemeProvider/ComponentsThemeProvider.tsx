"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useAccentPreference } from "@/components/AccentColorPicker";
import type { Theme } from "@/components/fields";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { ContextMenuProvider } from "@/components/ContextMenu";

const THEME_STORAGE_KEY = "opus-components-theme";

type ComponentsThemeContextValue = {
  pageHeader: {
    description: string;
    title: string;
  };
  accent: string;
  accentStyle: CSSProperties;
  setPageHeader: (header: { description?: string; title: string }) => void;
  setAccent: (accent: string) => void;
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
  const [theme, setThemeState] = useState<Theme>("dark");
  const [pageHeader, setPageHeaderState] = useState(defaultPageHeader);
  const { accent, accentStyle, setAccent } = useAccentPreference();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

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
    () => ({ accent, accentStyle, pageHeader, setAccent, setPageHeader, setTheme, theme }),
    [accent, accentStyle, pageHeader, setAccent, setPageHeader, setTheme, theme],
  );

  return (
    <ComponentsThemeContext.Provider value={contextValue}>
      <OpusThemeProvider theme={theme}>
        <div style={accentStyle}>
          <ToastProvider>
            <ContextMenuProvider>{children}</ContextMenuProvider>
          </ToastProvider>
        </div>
      </OpusThemeProvider>
    </ComponentsThemeContext.Provider>
  );
}
