"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ControlSettings, ControlSlug } from "@/lib/controls/types";

export const SETTINGS_WIDTH_KEY = "opus-settings-sidebar-width-v2";
export const DEFAULT_SETTINGS_WIDTH = 160;
export const MIN_SETTINGS_WIDTH = 140;
export const MAX_SETTINGS_WIDTH = 360;

export function clampSettingsWidth(width: number) {
  return Math.min(MAX_SETTINGS_WIDTH, Math.max(MIN_SETTINGS_WIDTH, width));
}

type ComponentSettingsContextValue = {
  activeSlug: ControlSlug | null;
  isResizing: boolean;
  register: (slug: ControlSlug, settings: ControlSettings) => void;
  setIsResizing: (value: boolean) => void;
  setSettings: (next: ControlSettings) => void;
  setSettingsWidth: (width: number) => void;
  settings: ControlSettings | null;
  settingsWidth: number;
  unregister: () => void;
};

const ComponentSettingsContext = createContext<ComponentSettingsContextValue | null>(null);

export function useComponentSettingsContext() {
  const context = useContext(ComponentSettingsContext);
  if (!context) {
    throw new Error("useComponentSettingsContext must be used within ComponentSettingsProvider");
  }
  return context;
}

export function useComponentSettings(slug: ControlSlug, defaultSettings: ControlSettings) {
  const { activeSlug, register, settings, setSettings, unregister } = useComponentSettingsContext();

  useEffect(() => {
    register(slug, defaultSettings);
    return unregister;
  }, [defaultSettings, register, slug, unregister]);

  if (activeSlug !== slug || !settings) {
    return {
      settings: defaultSettings,
      setSettings,
    };
  }

  return { settings, setSettings };
}

export function ComponentSettingsProvider({ children }: { children: ReactNode }) {
  const [activeSlug, setActiveSlug] = useState<ControlSlug | null>(null);
  const [settings, setSettingsState] = useState<ControlSettings | null>(null);
  const [settingsWidth, setSettingsWidth] = useState(DEFAULT_SETTINGS_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SETTINGS_WIDTH_KEY);
    if (!stored) {
      return;
    }

    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) {
      setSettingsWidth(clampSettingsWidth(parsed));
    }
  }, []);

  const register = useCallback((slug: ControlSlug, initialSettings: ControlSettings) => {
    setActiveSlug(slug);
    setSettingsState(initialSettings);
  }, []);

  const unregister = useCallback(() => {
    setActiveSlug(null);
    setSettingsState(null);
  }, []);

  const setSettings = useCallback((next: ControlSettings) => {
    setSettingsState(next);
  }, []);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const value = useMemo(
    () => ({
      activeSlug,
      isResizing,
      register,
      setIsResizing,
      setSettings,
      setSettingsWidth,
      settings,
      settingsWidth,
      unregister,
    }),
    [activeSlug, isResizing, register, settings, settingsWidth, unregister],
  );

  return <ComponentSettingsContext.Provider value={value}>{children}</ComponentSettingsContext.Provider>;
}
