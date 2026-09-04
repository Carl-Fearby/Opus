"use client";

import { createContext, useContext, useEffect, type CSSProperties, type ReactNode } from "react";
import type { ControlRadius, ControlTransparency, Theme } from "@/components/fields/types";

const OpusThemeContext = createContext<Theme | null>(null);

export type OpusThemeDefaults = {
  /** Default control corner treatment. Component `radius` props override this. */
  radius?: ControlRadius;
  /** Default control surface. Component `transparency` props override this. */
  transparency?: ControlTransparency;
  /** Default gradient surface treatment. Component `gradient` props override this. */
  gradient?: boolean;
};

const radiusTokens: Record<ControlRadius, Record<string, string>> = {
  none: { "--opus-input-radius": "0", "--opus-input-radius-large": "0", "--opus-input-radius-small": "0" },
  standard: {},
  medium: { "--opus-input-radius": "12px", "--opus-input-radius-large": "12px", "--opus-input-radius-small": "12px" },
  large: { "--opus-input-radius": "15px", "--opus-input-radius-large": "15px", "--opus-input-radius-small": "15px" },
  full: { "--opus-input-radius": "999px", "--opus-input-radius-large": "20px", "--opus-input-radius-small": "999px" },
};

/** Create CSS variables for a library-wide control surface. */
export function createOpusThemeDefaultsStyle(defaults: OpusThemeDefaults = {}): CSSProperties {
  const style: Record<string, string> = {
    ...(defaults.radius ? radiusTokens[defaults.radius] : {}),
  };

  if (defaults.transparency === "none") {
    style["--opus-input-bg"] = "transparent";
    style["--opus-input-fill"] = "transparent";
  } else if (defaults.transparency === "glass") {
    style["--opus-input-bg"] = "var(--opus-glass-surface, color-mix(in srgb, var(--opus-panel) 42%, transparent))";
    style["--opus-input-fill"] = "var(--opus-glass-surface, color-mix(in srgb, var(--opus-panel) 32%, transparent))";
  }

  if (defaults.gradient) {
    style["--opus-input-bg"] = "linear-gradient(135deg, color-mix(in srgb, var(--opus-accent) 12%, var(--opus-panel)), var(--opus-panel))";
    style["--opus-input-fill"] = "linear-gradient(135deg, color-mix(in srgb, var(--opus-accent) 8%, var(--opus-panel)), var(--opus-panel))";
  }

  return style as CSSProperties;
}

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
  /** Third global accent exposed to every Opus component as `--opus-accent-tertiary`. */
  tertiaryAccent?: string;
  /** Library-wide control defaults; individual component surface props take precedence. */
  defaults?: OpusThemeDefaults;
  /** CSS variables and styles scoped to this provider's theme boundary. */
  style?: CSSProperties;
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
  tertiaryAccent,
  defaults,
  style,
}: OpusThemeProviderProps) {
  useEffect(() => {
    if (!applyToDocument || typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    const previousFont = root.style.getPropertyValue("--opus-font-family");
    const previousTertiaryAccent = root.style.getPropertyValue("--opus-accent-tertiary");
    const previousDefaults = Object.keys(createOpusThemeDefaultsStyle(defaults)).map((key) => [key, root.style.getPropertyValue(key)] as const);
    root.setAttribute("data-theme", theme);
    if (fontFamily) {
      root.style.setProperty("--opus-font-family", resolveFontStack(fontFamily));
    }
    if (tertiaryAccent) {
      root.style.setProperty("--opus-accent-tertiary", tertiaryAccent);
    }
    for (const [key, value] of Object.entries(createOpusThemeDefaultsStyle(defaults))) {
      root.style.setProperty(key, value);
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
      if (tertiaryAccent) {
        if (previousTertiaryAccent) {
          root.style.setProperty("--opus-accent-tertiary", previousTertiaryAccent);
        } else {
          root.style.removeProperty("--opus-accent-tertiary");
        }
      }
      for (const [key, value] of previousDefaults) {
        if (value) root.style.setProperty(key, value);
        else root.style.removeProperty(key);
      }
    };
  }, [applyToDocument, defaults, fontFamily, tertiaryAccent, theme]);

  const boundaryStyle = {
    ...createOpusThemeDefaultsStyle(defaults),
    ...(fontFamily ? { "--opus-font-family": resolveFontStack(fontFamily) } : {}),
    ...(tertiaryAccent ? { "--opus-accent-tertiary": tertiaryAccent } : {}),
    ...style,
  } as CSSProperties;

  return (
    <OpusThemeContext.Provider value={theme}>
      <div data-theme={theme} style={boundaryStyle}>
        {children}
      </div>
    </OpusThemeContext.Provider>
  );
}
