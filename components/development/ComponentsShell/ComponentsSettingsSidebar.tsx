"use client";

import { useCallback, useRef } from "react";
import { ControlSettingsPanel } from "@/components/control-detail/ControlDetail/ControlSettingsPanel";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import {
  clampSettingsWidth,
  SETTINGS_WIDTH_KEY,
  useComponentSettingsContext,
} from "./ComponentSettingsContext";
import styles from "./ComponentsShell.module.css";

export function ComponentsSettingsSidebar() {
  const { accentStyle } = useComponentsTheme();
  const {
    activeSlug,
    isResizing,
    setIsResizing,
    setSettings,
    setSettingsWidth,
    settings,
    settingsWidth,
  } = useComponentSettingsContext();
  const dragRef = useRef<{ startWidth: number; startX: number } | null>(null);
  const widthRef = useRef(settingsWidth);

  widthRef.current = settingsWidth;

  const finishResize = useCallback(() => {
    dragRef.current = null;
    setIsResizing(false);
    window.localStorage.setItem(SETTINGS_WIDTH_KEY, String(widthRef.current));
  }, [setIsResizing]);

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragRef.current = {
        startWidth: widthRef.current,
        startX: event.clientX,
      };
      setIsResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [setIsResizing],
  );

  const handleResizePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) {
        return;
      }

      const delta = dragRef.current.startX - event.clientX;
      setSettingsWidth(clampSettingsWidth(dragRef.current.startWidth + delta));
    },
    [setSettingsWidth],
  );

  const handleResizePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) {
        return;
      }

      event.currentTarget.releasePointerCapture(event.pointerId);
      finishResize();
    },
    [finishResize],
  );

  const handleResizeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step = event.shiftKey ? 48 : 16;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSettingsWidth(clampSettingsWidth(settingsWidth + step));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setSettingsWidth(clampSettingsWidth(settingsWidth - step));
      }
    },
    [setSettingsWidth, settingsWidth],
  );

  if (!activeSlug || !settings) {
    return null;
  }

  return (
    <div className={styles.settingsSidebarWrap}>
      <div
        aria-label="Resize settings sidebar"
        aria-orientation="vertical"
        className={styles.settingsResizeHandle}
        role="separator"
        tabIndex={0}
        onKeyDown={handleResizeKeyDown}
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
      />
      <aside
        aria-label="Component settings"
        className={styles.settingsSidebar}
        data-theme="dark"
        data-resizing={isResizing ? "true" : undefined}
        style={accentStyle}
      >
        <div className={styles.settingsSidebarHeader}>
          <h2 className={styles.settingsSidebarTitle}>Settings</h2>
        </div>
        <div className={styles.settingsSidebarBody}>
          <OpusThemeProvider theme="dark">
            <ControlSettingsPanel slug={activeSlug} settings={settings} onChange={setSettings} />
          </OpusThemeProvider>
        </div>
      </aside>
    </div>
  );
}
