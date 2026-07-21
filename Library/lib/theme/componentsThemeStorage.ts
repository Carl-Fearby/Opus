import { COMPONENTS_ACCENT_BOOTSTRAP_SCRIPT } from "./accentThemeStorage";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "opus-components-theme";
export const PREVIEW_THEME_STORAGE_KEY = "opus-components-preview-theme";
export const THEME_COOKIE_KEY = THEME_STORAGE_KEY;
export const PREVIEW_THEME_COOKIE_KEY = PREVIEW_THEME_STORAGE_KEY;
export const THEME_CHANGE_EVENT = "opus-theme-change";

declare global {
  interface Window {
    __OPUS_PREVIEW_THEME__?: Theme;
    __OPUS_THEME__?: Theme;
  }
}

export function parseTheme(value: string | null | undefined, fallback: Theme = "dark"): Theme {
  return value === "light" || value === "dark" ? value : fallback;
}

export function buildThemeCookie(storageKey: string, theme: Theme) {
  return `${storageKey}=${theme};path=/;max-age=31536000;SameSite=Lax`;
}

export function readStoredTheme(storageKey: string, fallback: Theme = "dark"): Theme {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return parseTheme(window.localStorage.getItem(storageKey), fallback);
  } catch {
    return fallback;
  }
}

export function readBootstrappedTheme(storageKey: string, fallback: Theme = "dark"): Theme {
  if (typeof window === "undefined") {
    return fallback;
  }

  if (storageKey === THEME_STORAGE_KEY && window.__OPUS_THEME__) {
    return window.__OPUS_THEME__;
  }

  if (storageKey === PREVIEW_THEME_STORAGE_KEY && window.__OPUS_PREVIEW_THEME__) {
    return window.__OPUS_PREVIEW_THEME__;
  }

  if (typeof document !== "undefined") {
    if (storageKey === THEME_STORAGE_KEY) {
      const shellTheme = document.documentElement.getAttribute("data-shell-theme");
      if (shellTheme === "light" || shellTheme === "dark") {
        return shellTheme;
      }
    }

    if (storageKey === PREVIEW_THEME_STORAGE_KEY) {
      const previewTheme = document.documentElement.getAttribute("data-preview-theme");
      if (previewTheme === "light" || previewTheme === "dark") {
        return previewTheme;
      }
    }
  }

  return readStoredTheme(storageKey, fallback);
}

function writeThemeCookie(storageKey: string, theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = buildThemeCookie(storageKey, theme);
}

export function writeStoredTheme(storageKey: string, theme: Theme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, theme);
  writeThemeCookie(storageKey, theme);

  if (storageKey === THEME_STORAGE_KEY) {
    window.__OPUS_THEME__ = theme;
    applyDocumentTheme(theme);
  }

  if (storageKey === PREVIEW_THEME_STORAGE_KEY) {
    window.__OPUS_PREVIEW_THEME__ = theme;
    document.documentElement.setAttribute("data-preview-theme", theme);
  }

  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function applyDocumentTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  // Shell UI theme only — never write data-theme on <html>, or preview
  // (which owns data-theme on [data-preview-root]) inherits the shell toggle.
  root.setAttribute("data-shell-theme", theme);
  root.style.colorScheme = theme;
}

export const COMPONENTS_THEME_BOOTSTRAP_SCRIPT = `(function(){try{var k="${THEME_STORAGE_KEY}";var pk="${PREVIEW_THEME_STORAGE_KEY}";var r=document.documentElement;var t=localStorage.getItem(k);t=t==="light"||t==="dark"?t:(r.getAttribute("data-shell-theme")==="light"?"light":"dark");var p=localStorage.getItem(pk);p=p==="light"||p==="dark"?p:(r.getAttribute("data-preview-theme")==="light"?"light":"dark");r.setAttribute("data-shell-theme",t);r.setAttribute("data-preview-theme",p);r.style.colorScheme=t;r.classList.add("opus-no-transitions");window.__OPUS_THEME__=t;window.__OPUS_PREVIEW_THEME__=p;document.cookie=k+"="+t+";path=/;max-age=31536000;SameSite=Lax";document.cookie=pk+"="+p+";path=/;max-age=31536000;SameSite=Lax";requestAnimationFrame(function(){requestAnimationFrame(function(){r.classList.remove("opus-no-transitions");});});}catch(e){}})();${COMPONENTS_ACCENT_BOOTSTRAP_SCRIPT}`;
