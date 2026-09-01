"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ControlSettings, ControlSlug } from "@/lib/controls/types";

export const SETTINGS_WIDTH_KEY = "opus-settings-sidebar-width-v2";
export const SETTINGS_COLLAPSED_KEY = "opus-settings-sidebar-collapsed-v1";
export const DEFAULT_SETTINGS_WIDTH = 160;
export const MIN_SETTINGS_WIDTH = 140;
export const MAX_SETTINGS_WIDTH = 360;
export const COLLAPSED_SETTINGS_WIDTH = 44;

export function clampSettingsWidth(width: number) {
  return Math.min(MAX_SETTINGS_WIDTH, Math.max(MIN_SETTINGS_WIDTH, width));
}

type ComponentSettingsContextValue = {
  activeSlug: ControlSlug | null;
  isResizing: boolean;
  register: (slug: ControlSlug, settings: ControlSettings) => void;
  setIsResizing: (value: boolean) => void;
  setSettings: (next: ControlSettings) => void;
  setSettingsCollapsed: (value: boolean) => void;
  setSettingsWidth: (width: number) => void;
  settings: ControlSettings | null;
  settingsCollapsed: boolean;
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
  const defaultSettingsRef = useRef(defaultSettings);

  defaultSettingsRef.current = defaultSettings;

  useEffect(() => {
    register(slug, defaultSettingsRef.current);
    return unregister;
  }, [register, slug, unregister]);

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
  const [settingsCollapsed, setSettingsCollapsedState] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const storedWidth = window.localStorage.getItem(SETTINGS_WIDTH_KEY);
    if (storedWidth) {
      const parsed = Number(storedWidth);
      if (!Number.isNaN(parsed)) {
        setSettingsWidth(clampSettingsWidth(parsed));
      }
    }

    const storedCollapsed = window.localStorage.getItem(SETTINGS_COLLAPSED_KEY);
    if (storedCollapsed === "true" || storedCollapsed === "false") {
      setSettingsCollapsedState(storedCollapsed === "true");
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

  const setSettingsCollapsed = useCallback((value: boolean) => {
    setSettingsCollapsedState(value);
    window.localStorage.setItem(SETTINGS_COLLAPSED_KEY, String(value));
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
      setSettingsCollapsed,
      setSettingsWidth,
      settings,
      settingsCollapsed,
      settingsWidth,
      unregister,
    }),
    [
      activeSlug,
      isResizing,
      register,
      settings,
      settingsCollapsed,
      settingsWidth,
      setSettings,
      setSettingsCollapsed,
      unregister,
    ],
  );

  return <ComponentSettingsContext.Provider value={value}>{children}</ComponentSettingsContext.Provider>;
}
