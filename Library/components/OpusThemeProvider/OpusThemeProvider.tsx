"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import type { Theme } from "@/components/fields/types";

const OpusThemeContext = createContext<Theme | null>(null);

function resolveDocumentTheme(): Theme {
  if (typeof document === "undefined") {
    return "dark";
  }

  const rootTheme = document.documentElement.getAttribute("data-shell-theme");
  if (rootTheme === "light" || rootTheme === "dark") {
    return rootTheme;
  }

  const shellThemed = document.querySelector('[data-shell-theme="light"], [data-shell-theme="dark"]');
  if (shellThemed) {
    return shellThemed.getAttribute("data-shell-theme") === "light" ? "light" : "dark";
  }

  const themed = document.querySelector(
    '[data-theme="light"]:not([data-preview-root]), [data-theme="dark"]:not([data-preview-root])',
  );

  return themed?.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function useOpusTheme(): Theme {
  const theme = useContext(OpusThemeContext);

  if (theme) {
    return theme;
  }

  return resolveDocumentTheme();
}

export type OpusThemeProviderProps = {
  children: ReactNode;
  theme: Theme;
  /**
   * When true (the default), the provider sets `data-theme` on the document
   * root element so themed CSS variables also apply to portalled content
   * (modals, drawers, toasts, dropdowns) that renders outside the React tree.
   * Set to false if you want to manage the `data-theme` attribute yourself.
   */
  applyToDocument?: boolean;
  /** Global font family or complete CSS font stack exposed through the Opus font token. */
  fontFamily?: string;
};

function resolveFontStack(fontFamily: string) {
  return fontFamily.includes(",") || fontFamily.includes("var(")
    ? fontFamily
    : `'${fontFamily.replaceAll("'", "\\'")}', ui-sans-serif, system-ui, sans-serif`;
}

export function OpusThemeProvider({
  children,
  theme,
  applyToDocument = true,
  fontFamily,
}: OpusThemeProviderProps) {
  useEffect(() => {
    if (!applyToDocument || typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    const previousFont = root.style.getPropertyValue("--opus-font-family");
    root.setAttribute("data-theme", theme);
    if (fontFamily) {
      root.style.setProperty("--opus-font-family", resolveFontStack(fontFamily));
    }

    return () => {
      if (previous === null) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", previous);
      }
      if (fontFamily) {
        if (previousFont) {
          root.style.setProperty("--opus-font-family", previousFont);
        } else {
          root.style.removeProperty("--opus-font-family");
        }
      }
    };
  }, [applyToDocument, fontFamily, theme]);

  return <OpusThemeContext.Provider value={theme}>{children}</OpusThemeContext.Provider>;
}
