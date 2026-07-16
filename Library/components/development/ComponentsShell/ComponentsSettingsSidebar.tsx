"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import {
  CompositionPartsList,
  CompositionUsageList,
} from "@/components/control-detail/ControlDetail/CompositionPartsList";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { getCompositionParentsForControl } from "@/lib/controls/compositionGraph";
import { controlHasSettingsPanel } from "@/lib/controls/controlSettingsPanel";
import { getControl } from "@/lib/controls/registry";
import {
  clampSettingsWidth,
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
  const { accentStyle, theme } = useComponentsTheme();
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

  useEffect(() => {
    widthRef.current = settingsWidth;
  }, [settingsWidth]);

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

  if (!activeSlug || !settings || !controlHasSettingsPanel(activeSlug)) {
    return null;
  }

  const control = getControl(activeSlug);
  const compositionParents = control ? getCompositionParentsForControl(control) : [];
  const hasCompositionLinks = Boolean(control?.compositionParts?.length || compositionParents.length);

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
        data-resizing={isResizing ? "true" : undefined}
        style={accentStyle}
      >
        <div className={styles.settingsSidebarHeader}>
          <h2 className={styles.settingsSidebarTitle}>Settings</h2>
        </div>
        <div className={styles.settingsSidebarBody}>
          <OpusThemeProvider theme={theme}>
            <ControlSettingsPanel slug={activeSlug} settings={settings} onChange={setSettings} />
            {hasCompositionLinks ? (
              <div className={styles.settingsCompositionLinks}>
                {control?.compositionParts?.length ? (
                  <CompositionPartsList control={control} parts={control.compositionParts} />
                ) : null}
                {compositionParents.length ? (
                  <CompositionUsageList controls={compositionParents} parents={compositionParents.map((entry) => entry.slug)} />
                ) : null}
              </div>
            ) : null}
          </OpusThemeProvider>
        </div>
      </aside>
    </div>
  );
}
