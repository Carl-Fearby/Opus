"use client";

import { createContext, useContext, type ReactNode } from "react";
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
};

export function OpusThemeProvider({ children, theme }: OpusThemeProviderProps) {
  return <OpusThemeContext.Provider value={theme}>{children}</OpusThemeContext.Provider>;
}
