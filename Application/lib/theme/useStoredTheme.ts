"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Theme } from "opus-react";
import {
  PREVIEW_THEME_STORAGE_KEY,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  readBootstrappedTheme,
  writeStoredTheme,
} from "./componentsThemeStorage";

function subscribeThemeStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

export function useStoredTheme(storageKey: string = THEME_STORAGE_KEY) {
  const getSnapshot = useCallback(() => readBootstrappedTheme(storageKey), [storageKey]);
  const theme = useSyncExternalStore(subscribeThemeStorage, getSnapshot, getServerThemeSnapshot);

  const setTheme = useCallback(
    (next: Theme) => {
      writeStoredTheme(storageKey, next);
    },
    [storageKey],
  );

  return [theme, setTheme] as const;
}

export function useStoredPreviewTheme() {
  return useStoredTheme(PREVIEW_THEME_STORAGE_KEY);
}
