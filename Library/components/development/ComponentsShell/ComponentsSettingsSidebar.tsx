"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import { ResizeHandle } from "@/components/ResizeHandle";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { controlHasSettingsPanel } from "@/lib/controls/controlSettingsPanel";
import {
  clampSettingsWidth,
  MAX_SETTINGS_WIDTH,
  MIN_SETTINGS_WIDTH,
  SETTINGS_WIDTH_KEY,
  useComponentSettingsContext,
} from "./ComponentSettingsContext";
import styles from "./ComponentsShell.module.css";

const ControlSettingsPanel = dynamic(
  () =>
    import("@/components/control-detail/ControlDetail/ControlSettingsPanel").then(
      (module) => module.ControlSettingsPanel,
    ),
  { loading: () => <p className={styles.settingsLoading}>Loading settings…</p> },
);

export function ComponentsSettingsSidebar() {
  const { theme } = useComponentsTheme();
  const {
    activeSlug,
    isResizing,
    setIsResizing,
    setSettings,
    setSettingsCollapsed,
    setSettingsWidth,
    settings,
    settingsCollapsed,
    settingsWidth,
  } = useComponentSettingsContext();
  const dragRef = useRef<{ startWidth: number; startX: number } | null>(null);
  const widthRef = useRef(settingsWidth);

  useEffect(() => {
    widthRef.current = settingsWidth;
  }, [settingsWidth]);

  const finishResize = useCallback(() => {
    dragRef.current = null;
    setIsResizing(false);
    window.localStorage.setItem(SETTINGS_WIDTH_KEY, String(widthRef.current));
  }, [setIsResizing]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current) {
        return;
      }

      const delta = dragRef.current.startX - event.clientX;
      setSettingsWidth(clampSettingsWidth(dragRef.current.startWidth + delta));
    };

    const handlePointerUp = () => {
      if (!dragRef.current) {
        return;
      }
      finishResize();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [finishResize, isResizing, setSettingsWidth]);

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      dragRef.current = {
        startWidth: widthRef.current,
        startX: event.clientX,
      };
      setIsResizing(true);
    },
    [setIsResizing],
  );

  const handleResizeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const step = event.shiftKey ? 48 : 16;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSettingsWidth(clampSettingsWidth(settingsWidth + step));
        window.localStorage.setItem(
          SETTINGS_WIDTH_KEY,
          String(clampSettingsWidth(settingsWidth + step)),
        );
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setSettingsWidth(clampSettingsWidth(settingsWidth - step));
        window.localStorage.setItem(
          SETTINGS_WIDTH_KEY,
          String(clampSettingsWidth(settingsWidth - step)),
        );
      }
    },
    [setSettingsWidth, settingsWidth],
  );

  if (!activeSlug || !settings || !controlHasSettingsPanel(activeSlug)) {
    return null;
  }

  if (settingsCollapsed) {
    return (
      <div className={styles.settingsSidebarWrap} data-collapsed="true">
        <aside
          aria-label="Component settings"
          className={`${styles.sidebar} ${styles.settingsSidebar}`}
          data-opus-tour="component-settings"
          data-collapsed="true"
        >
          <button
            aria-expanded={false}
            aria-label="Expand settings"
            className={styles.settingsCollapseButton}
            type="button"
            onClick={() => setSettingsCollapsed(false)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            <span className={styles.settingsCollapsedLabel}>Settings</span>
          </button>
        </aside>
      </div>
    );
  }

  return (
    <div className={styles.settingsSidebarWrap}>
      <ResizeHandle
        aria-label="Resize settings sidebar"
        aria-orientation="vertical"
        aria-valuemax={MAX_SETTINGS_WIDTH}
        aria-valuemin={MIN_SETTINGS_WIDTH}
        aria-valuenow={settingsWidth}
        background="subtle"
        className={styles.settingsResizeHandle}
        data-opus-tour="settings-resize"
        height="full"
        orientation="vertical"
        onKeyDown={handleResizeKeyDown}
        onPointerDown={handleResizePointerDown}
      />
      <aside
        aria-label="Component settings"
        className={`${styles.sidebar} ${styles.settingsSidebar}`}
        data-opus-tour="component-settings"
        data-resizing={isResizing ? "true" : undefined}
      >
        <div className={styles.settingsSidebarHeader}>
          <h2 className={styles.settingsSidebarTitle}>Settings</h2>
          <button
            aria-expanded={true}
            aria-label="Collapse settings"
            className={styles.settingsCollapseButton}
            type="button"
            onClick={() => setSettingsCollapsed(true)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <CustomScrollbar className={styles.settingsSidebarBody} label="Component settings" orientation="vertical">
          <div className={styles.settingsSidebarBodyInner}>
            <OpusThemeProvider applyToDocument={false} theme={theme}>
              <ControlSettingsPanel slug={activeSlug} settings={settings} onChange={setSettings} />
            </OpusThemeProvider>
          </div>
        </CustomScrollbar>
      </aside>
    </div>
  );
}
