"use client";

import { useStoredTheme } from "@/lib/theme/useStoredTheme";

export const PLAYGROUND_THEME_STORAGE_KEY = "opus-playground-preview-theme";

export function usePlaygroundTheme() {
  return useStoredTheme(PLAYGROUND_THEME_STORAGE_KEY);
}
