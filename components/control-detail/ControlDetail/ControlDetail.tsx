"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { componentRawPath } from "@/lib/controls/routes";
import type { ControlDefinition, ControlSettings } from "@/lib/controls/types";
import { ControlPreview } from "./ControlPreview";
import { ControlSettingsPanel } from "./ControlSettingsPanel";
import styles from "./ControlDetail.module.css";
import { UsageCodeViewer } from "./UsageCodeViewer";
import { ComponentDocumentation } from "@/components/control-detail/ComponentDocumentation/ComponentDocumentation";

const SETTINGS_WIDTH_KEY = "opus-settings-sidebar-width";
const DEFAULT_SETTINGS_WIDTH = 380;
const MIN_SETTINGS_WIDTH = 280;
const MAX_SETTINGS_WIDTH = 720;

function clampWidth(width: number) {
  return Math.min(MAX_SETTINGS_WIDTH, Math.max(MIN_SETTINGS_WIDTH, width));
}

type ControlDetailProps = {
  control: ControlDefinition;
  defaultSettings: ControlSettings;
  documentation?: string;
};

export function ControlDetail({ control, defaultSettings, documentation }: ControlDetailProps) {
  useSetComponentsPageHeader(control.title, control.description);
  const [settings, setSettings] = useState<ControlSettings>(() => defaultSettings);
  const [settingsWidth, setSettingsWidth] = useState(DEFAULT_SETTINGS_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef<{ startWidth: number; startX: number } | null>(null);
  const widthRef = useRef(settingsWidth);

  widthRef.current = settingsWidth;

  useEffect(() => {
    const stored = window.localStorage.getItem(SETTINGS_WIDTH_KEY);
    if (!stored) {
      return;
    }

    const parsed = Number(stored);
    if (!Number.isNaN(parsed)) {
      setSettingsWidth(clampWidth(parsed));
    }
  }, []);

  const finishResize = useCallback(() => {
    dragRef.current = null;
    setIsResizing(false);
    window.localStorage.setItem(SETTINGS_WIDTH_KEY, String(widthRef.current));
  }, []);

  const handleResizePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragRef.current = {
      startWidth: widthRef.current,
      startX: event.clientX,
    };
    setIsResizing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handleResizePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return;
    }

    const delta = dragRef.current.startX - event.clientX;
    setSettingsWidth(clampWidth(dragRef.current.startWidth + delta));
  }, []);

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

  const handleResizeKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 16;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSettingsWidth((current) => clampWidth(current + step));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setSettingsWidth((current) => clampWidth(current - step));
    } else if (event.key === "Home") {
      event.preventDefault();
      setSettingsWidth(MIN_SETTINGS_WIDTH);
    } else if (event.key === "End") {
      event.preventDefault();
      setSettingsWidth(MAX_SETTINGS_WIDTH);
    }
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

  return (
    <div className={styles.page} data-resizing={isResizing ? "true" : undefined}>
      <div className={styles.workspace}>
        <div className={styles.mainColumn}>
          <section className={styles.panel}>
            <div className="opus-panel-heading">
              <h2 className="opus-panel-title">Preview</h2>
              <Link
                className={styles.panelActionButton}
                href={componentRawPath(control.slug, settings)}
                rel="noopener noreferrer"
                target="_blank"
              >
                Raw
              </Link>
            </div>
            <div className={styles.previewBody}>
              <ControlPreview slug={control.slug} settings={settings} onSettingsChange={setSettings} />
            </div>
          </section>

          {documentation ? <ComponentDocumentation content={documentation} /> : null}

          <UsageCodeViewer slug={control.slug} settings={settings} />
        </div>

        <div
          aria-label="Resize settings panel"
          aria-orientation="vertical"
          aria-valuemax={MAX_SETTINGS_WIDTH}
          aria-valuemin={MIN_SETTINGS_WIDTH}
          aria-valuenow={settingsWidth}
          className={styles.resizeHandle}
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
          style={{ width: `${settingsWidth}px` }}
        >
          <section className={styles.panel}>
            <h2 className="opus-panel-title">Settings</h2>
            <ControlSettingsPanel slug={control.slug} settings={settings} onChange={setSettings} />
          </section>
        </aside>
      </div>
    </div>
  );
}
