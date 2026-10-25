"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import { CustomScrollbar } from "opus-react";
import { ResizeHandle } from "opus-react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { controlHasSettingsPanel } from "@/lib/controls/controlSettingsPanel";
import { useOpusI18n } from "@/components/OpusI18n";
import {
  clampSettingsWidth,
  MAX_SETTINGS_WIDTH,
  MIN_SETTINGS_WIDTH,
  SETTINGS_WIDTH_KEY,
  useComponentSettingsContext,
} from "./ComponentSettingsContext";
import styles from "./ComponentsShell.module.css";

function SettingsSidebarLoading() {
  const { t } = useOpusI18n();
  return <p className={styles.settingsLoading}>{t("settings.loading", "Loading settings…")}</p>;
}

const ControlSettingsPanel = dynamic(
  () =>
    import("@/components/control-detail/ControlDetail/ControlSettingsPanel").then(
      (module) => module.ControlSettingsPanel,
    ),
  { loading: () => <SettingsSidebarLoading /> },
);

export function ComponentsSettingsSidebar({
  compact = false,
  mobileOpen = false,
  onRequestClose,
}: {
  compact?: boolean;
  mobileOpen?: boolean;
  onRequestClose?: () => void;
} = {}) {
  const { t } = useOpusI18n();
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

  const collapsed = compact ? !mobileOpen : settingsCollapsed;

  if (collapsed) {
    return (
      <div className={styles.settingsSidebarWrap} data-collapsed="true">
        <aside
          aria-label={t("settings.componentAria", "Component settings")}
          className={`${styles.sidebar} ${styles.settingsSidebar}`}
          data-opus-tour="component-settings"
          data-collapsed="true"
        >
          <button
            aria-expanded={false}
            aria-label={t("settings.expand", "Expand settings")}
            className={styles.settingsCollapseButton}
            type="button"
            onClick={() => setSettingsCollapsed(false)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            <span className={styles.settingsCollapsedLabel}>{t("settings.title", "Settings")}</span>
          </button>
        </aside>
      </div>
    );
  }

  return (
    <div className={styles.settingsSidebarWrap}>
      <ResizeHandle
        aria-label={t("settings.resize", "Resize settings sidebar")}
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
        aria-label={t("settings.componentAria", "Component settings")}
        className={`${styles.sidebar} ${styles.settingsSidebar}`}
        data-opus-tour="component-settings"
        data-resizing={isResizing ? "true" : undefined}
        id="components-settings-drawer"
      >
        <div className={styles.settingsSidebarHeader}>
          <h2 className={styles.settingsSidebarTitle}>{t("settings.title", "Settings")}</h2>
          <button
            aria-expanded={true}
            aria-label={compact ? t("settings.close", "Close settings") : t("settings.collapse", "Collapse settings")}
            className={styles.settingsCollapseButton}
            type="button"
            onClick={() => {
              if (compact) {
                onRequestClose?.();
                return;
              }

              setSettingsCollapsed(true);
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
        <CustomScrollbar className={styles.settingsSidebarBody} label={t("settings.componentAria", "Component settings")} orientation="vertical">
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
