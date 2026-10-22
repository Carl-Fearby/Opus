"use client";

import { createContext, useContext, useEffect, type CSSProperties, type ReactNode } from "react";
import type { ControlRadius, ControlTransparency, Theme } from "@/components/fields/types";

const OpusPortalAppearanceContext = createContext<{ theme: Theme; appearance: NonNullable<OpusThemeDefaults["appearance"]>; style: CSSProperties } | null>(null);

/** Internal context used by menus, tooltips, and other portalled controls. */
export function useOpusPortalAppearance() {
  return useContext(OpusPortalAppearanceContext);
}

const OpusThemeContext = createContext<Theme | null>(null);

export type OpusThemeDefaults = {
  /** Surface styling, independent of light/dark colour mode. */
  appearance?: "standard" | "neumorphism" | "liquid-glass";
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
export function createOpusThemeDefaultsStyle(defaults: OpusThemeDefaults = {}, theme: Theme = "light"): CSSProperties {
  const style: Record<string, string> = {
    ...(defaults.radius ? radiusTokens[defaults.radius] : {}),
  };

  if (defaults.appearance === "liquid-glass") {
    const dark = theme === "dark";
    const surface = dark ? "rgba(38, 39, 44, 0.62)" : "rgba(255, 255, 255, 0.58)";
    const border = dark ? "rgba(255, 255, 255, 0.18)" : "rgba(255, 255, 255, 0.8)";
    const shadow = "inset 0 1px 0 rgba(255,255,255,.25), inset 0 -1px 0 rgba(255,255,255,.04), 0 12px 32px rgba(0,0,0,.24)";
    Object.assign(style, {
      "--opus-panel": dark ? "#25262b" : "#e9edf2",
      "--opus-text": dark ? "#f4f5f7" : "#202630",
      "--opus-muted": dark ? "#b9bdc7" : "#515b6b",
      "--opus-border": border,
      "--opus-border-strong": dark ? "rgba(255,255,255,.3)" : "rgba(75,85,100,.3)",
      "--opus-glass-surface": surface,
      "--opus-glass-border": border,
      "--opus-input-bg": surface,
      "--opus-input-fill": surface,
      "--opus-input-shadow": "inset 0 1px 0 rgba(255,255,255,.18), 0 2px 8px rgba(0,0,0,.12)",
      "--opus-input-backdrop-filter": "blur(16px) saturate(1.4)",
      "--opus-surface-fill": "linear-gradient(145deg, rgba(255,255,255,.12), transparent 48%), " + surface,
      "--opus-surface-border": border,
      "--opus-surface-text": "var(--opus-text)",
      "--opus-surface-shadow": shadow,
      "--opus-shadow": shadow,
      "--opus-control-shadow": shadow,
      "--opus-surface-backdrop-filter": "blur(24px) saturate(1.3)",
      "--opus-menu-glass-surface": dark ? "rgba(35,36,41,.94)" : "rgba(248,250,252,.94)",
      "--opus-menu-surface-token": "var(--opus-menu-glass-surface)",
      "--opus-menu-glass-border": border,
      "--opus-liquid-backdrop": dark ? "#101114" : "#cbd3dd",
    });
    if (!defaults.radius || defaults.radius === "standard") Object.assign(style, radiusTokens.large);
    if (defaults.gradient) {
      const gradient = `linear-gradient(135deg, color-mix(in srgb, var(--opus-accent) 14%, transparent), transparent 65%), ${surface}`;
      style["--opus-input-bg"] = gradient;
      style["--opus-input-fill"] = gradient;
      style["--opus-surface-fill"] = gradient;
    }
    return style as CSSProperties;
  }

  if (defaults.appearance === "neumorphism") {
    const surface = theme === "light"
      ? "color-mix(in srgb, var(--opus-base, #64748b) 12%, #f3f5f8)"
      : "color-mix(in srgb, var(--opus-base, #64748b) 18%, #252932)";
    Object.assign(style, {
      "--opus-panel": surface,
      "--opus-border": "transparent",
      "--opus-border-strong": "transparent",
      "--opus-surface-border": "transparent",
      "--opus-text": theme === "light" ? "#353e4b" : "#e0e5ec",
      "--opus-muted": theme === "light" ? "#566170" : "#aeb8c6",
      "--opus-accent": theme === "light" ? "#465567" : "#c5cfdd",
      "--opus-tile-icon-fill": "currentColor",
      "--opus-tile-icon-filter": "none",
      "--opus-hover-transform": "none",
      "--opus-hover-filter": "none",
      "--opus-progress-padding": "2px",
      "--opus-tile-track-padding": "12px",
      "--opus-tile-track-gap": "20px",
      "--opus-tile-focus-outline": "2px solid var(--opus-accent)",
      "--opus-menu-surface-token": surface,
      "--opus-input-bg": surface,
      "--opus-input-fill": surface,
      "--opus-neu-light": theme === "light" ? "color-mix(in srgb, var(--opus-panel) 20%, white)" : "color-mix(in srgb, var(--opus-panel) 95%, white)",
      "--opus-neu-dark": theme === "light" ? "color-mix(in srgb, var(--opus-panel) 68%, #64748b)" : "color-mix(in srgb, var(--opus-panel) 74%, black)",
      "--opus-shadow": theme === "light"
        ? "6px 6px 14px var(--opus-neu-dark), -6px -6px 14px var(--opus-neu-light)"
        : "4px 4px 12px var(--opus-neu-dark), -4px -4px 12px var(--opus-neu-light)",
      "--opus-control-shadow": theme === "light"
        ? "3px 3px 8px var(--opus-neu-dark), -3px -3px 8px var(--opus-neu-light)"
        : "2px 2px 6px var(--opus-neu-dark), -2px -2px 6px var(--opus-neu-light)",
      "--opus-control-inset-shadow": theme === "light"
        ? "inset 3px 3px 7px var(--opus-neu-dark), inset -3px -3px 7px var(--opus-neu-light)"
        : "inset 2px 2px 5px var(--opus-neu-dark), inset -2px -2px 5px var(--opus-neu-light)",
      "--opus-input-shadow": "var(--opus-control-inset-shadow)",
      "--opus-surface-fill": surface,
      "--opus-surface-text": "var(--opus-text)",
      "--opus-surface-shadow": "var(--opus-shadow)",
      "--opus-surface-background-image": "none",
      "--opus-surface-backdrop-filter": "none",
      "--opus-selection-shadow": "var(--opus-control-inset-shadow)",
      "--opus-mark-color": "var(--opus-text)",
      "--opus-divider-shadow": "0 1px 1px var(--opus-neu-light), inset 0 1px 1px var(--opus-neu-dark)",
    });
    if (!defaults.radius || defaults.radius === "standard") {
      Object.assign(style, radiusTokens.medium);
    }
  }

  if (defaults.appearance === "neumorphism") return style as CSSProperties;

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
  /** Library-wide defaults. Neumorphism keeps a uniform material; explicit radii still apply. */
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
    const previousAppearance = root.getAttribute("data-opus-appearance");
    const previousFont = root.style.getPropertyValue("--opus-font-family");
    const previousTertiaryAccent = root.style.getPropertyValue("--opus-accent-tertiary");
    const previousDefaults = Object.keys(createOpusThemeDefaultsStyle(defaults, theme)).map((key) => [key, root.style.getPropertyValue(key)] as const);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-opus-appearance", defaults?.appearance ?? "standard");
    if (fontFamily) {
      root.style.setProperty("--opus-font-family", resolveFontStack(fontFamily));
    }
    if (tertiaryAccent) {
      root.style.setProperty("--opus-accent-tertiary", tertiaryAccent);
    }
    for (const [key, value] of Object.entries(createOpusThemeDefaultsStyle(defaults, theme))) {
      root.style.setProperty(key, value);
    }

    return () => {
      if (previousAppearance === null) root.removeAttribute("data-opus-appearance");
      else root.setAttribute("data-opus-appearance", previousAppearance);
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
    ...createOpusThemeDefaultsStyle(defaults, theme),
    ...(fontFamily ? { "--opus-font-family": resolveFontStack(fontFamily) } : {}),
    ...(tertiaryAccent ? { "--opus-accent-tertiary": tertiaryAccent } : {}),
    ...style,
  } as CSSProperties;

  return (
    <OpusThemeContext.Provider value={theme}>
      <OpusPortalAppearanceContext.Provider value={{ theme, appearance: defaults?.appearance ?? "standard", style: boundaryStyle }}>
        <div data-theme={theme} data-opus-appearance={defaults?.appearance ?? "standard"} style={boundaryStyle}>
          {children}
        </div>
      </OpusPortalAppearanceContext.Provider>
    </OpusThemeContext.Provider>
  );
}
