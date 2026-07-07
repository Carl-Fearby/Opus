"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Theme } from "@/components/fields/types";

const OpusThemeContext = createContext<Theme | null>(null);

function resolveDocumentTheme(): Theme {
  if (typeof document === "undefined") {
    return "dark";
  }

  const themed = document.querySelector('[data-theme="light"], [data-theme="dark"]');

  return themed?.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function useOpusTheme(): Theme {
  const theme = useContext(OpusThemeContext);

  if (theme) {
    return theme;
  }

  return resolveDocumentTheme();
}

type OpusThemeProviderProps = {
  children: ReactNode;
  theme: Theme;
  /**
   * When true (the default), the provider sets `data-theme` on the document
   * root element so themed CSS variables also apply to portalled content
   * (modals, drawers, toasts, dropdowns) that renders outside the React tree.
   * Set to false if you want to manage the `data-theme` attribute yourself.
   */
  applyToDocument?: boolean;
};

export function OpusThemeProvider({
  children,
  theme,
  applyToDocument = true,
}: OpusThemeProviderProps) {
  useEffect(() => {
    if (!applyToDocument || typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", theme);

    return () => {
      if (previous === null) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", previous);
      }
    };
  }, [applyToDocument, theme]);

  return <OpusThemeContext.Provider value={theme}>{children}</OpusThemeContext.Provider>;
}
