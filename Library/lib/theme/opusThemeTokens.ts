import type { CSSProperties } from "react";
import type { Theme } from "@/components/fields/types";

const lightThemeTokens = {
  "--opus-control-font-size": "0.86rem",
  "--opus-control-height": "28px",
  "--opus-input-radius": "4px",
  "--opus-input-radius-large": "6px",
  "--opus-input-radius-small": "2px",
  "--opus-input-radius-mark": "1px",
  "--opus-panel": "color-mix(in srgb, var(--opus-accent) 4%, rgba(252, 252, 255, 0.96))",
  "--opus-border": "color-mix(in srgb, var(--opus-accent) 22%, transparent)",
  "--opus-border-strong": "color-mix(in srgb, var(--opus-accent) 34%, transparent)",
  "--opus-text": "#17132f",
  "--opus-muted": "#655f83",
  "--opus-accent": "var(--opus-user-accent, #6b46ff)",
  "--opus-accent-soft": "var(--opus-user-accent-soft, color-mix(in srgb, var(--opus-accent) 12%, transparent))",
  "--opus-accent-secondary": "var(--opus-user-accent-secondary, #0284c7)",
  "--opus-accent-secondary-soft":
    "var(--opus-user-accent-secondary-soft, color-mix(in srgb, var(--opus-accent-secondary) 12%, transparent))",
  "--opus-accent-contrast": "#ffffff",
  "--opus-error": "#eb2434",
  "--opus-input-bg": "color-mix(in srgb, var(--opus-accent) 6%, rgba(255, 255, 255, 0.88))",
  "--opus-input-fill": "color-mix(in srgb, var(--opus-accent) 3%, rgba(255, 255, 255, 0.98))",
  "--opus-date-icon-filter": "none",
  "--opus-shadow": "0 24px 80px rgba(26, 18, 74, 0.08)",
  "--opus-overlay-blur": "4px",
  "--opus-overlay-saturate": "1.08",
  "--opus-overlay-backdrop":
    "linear-gradient(135deg, color-mix(in srgb, #020617 58%, transparent), color-mix(in srgb, #1e3a8a 22%, transparent)), color-mix(in srgb, #020617 42%, transparent)",
  "--opus-overlay-backdrop-solid": "color-mix(in srgb, #020617 72%, #1e3a8a)",
  "--opus-glass-surface": "rgba(252, 253, 255, 0.62)",
  "--opus-glass-border": "color-mix(in srgb, var(--opus-accent) 24%, transparent)",
  "--opus-menu-glass-surface": "rgba(252, 253, 255, 0.88)",
  "--opus-menu-glass-border": "color-mix(in srgb, var(--opus-accent) 30%, transparent)",
} as const satisfies Record<string, string>;

const darkThemeTokens = {
  "--opus-control-font-size": "0.86rem",
  "--opus-control-height": "28px",
  "--opus-input-radius": "4px",
  "--opus-input-radius-large": "6px",
  "--opus-input-radius-small": "2px",
  "--opus-input-radius-mark": "1px",
  "--opus-panel": "color-mix(in srgb, var(--opus-accent) 8%, rgba(10, 10, 16, 0.95))",
  "--opus-border": "color-mix(in srgb, var(--opus-accent) 18%, transparent)",
  "--opus-border-strong": "color-mix(in srgb, var(--opus-accent) 32%, transparent)",
  "--opus-text": "#f5f7ff",
  "--opus-muted": "rgba(223, 226, 255, 0.72)",
  "--opus-accent": "var(--opus-user-accent, #8f6cff)",
  "--opus-accent-soft": "var(--opus-user-accent-soft, color-mix(in srgb, var(--opus-accent) 16%, transparent))",
  "--opus-accent-secondary": "var(--opus-user-accent-secondary, #0284c7)",
  "--opus-accent-secondary-soft":
    "var(--opus-user-accent-secondary-soft, color-mix(in srgb, var(--opus-accent-secondary) 16%, transparent))",
  "--opus-accent-contrast": "#ffffff",
  "--opus-error": "#ff5858",
  "--opus-input-bg": "color-mix(in srgb, var(--opus-accent) 10%, rgba(14, 14, 20, 0.92))",
  "--opus-input-fill": "color-mix(in srgb, var(--opus-accent) 9%, rgba(12, 12, 18, 0.94))",
  "--opus-date-icon-filter": "invert(1)",
  "--opus-shadow": "0 28px 110px rgba(4, 5, 14, 0.48)",
  "--opus-overlay-blur": "4px",
  "--opus-overlay-saturate": "1.08",
  "--opus-overlay-backdrop":
    "linear-gradient(135deg, color-mix(in srgb, #020617 58%, transparent), color-mix(in srgb, #1e3a8a 22%, transparent)), color-mix(in srgb, #020617 42%, transparent)",
  "--opus-overlay-backdrop-solid": "color-mix(in srgb, #020617 72%, #1e3a8a)",
  "--opus-glass-surface": "rgba(14, 16, 36, 0.52)",
  "--opus-glass-border": "color-mix(in srgb, var(--opus-accent) 22%, transparent)",
  "--opus-menu-glass-surface": "rgba(14, 16, 36, 0.82)",
  "--opus-menu-glass-border": "color-mix(in srgb, var(--opus-accent) 28%, transparent)",
} as const satisfies Record<string, string>;

export function opusThemeTokens(theme: Theme): CSSProperties {
  return (theme === "light" ? lightThemeTokens : darkThemeTokens) as CSSProperties;
}
