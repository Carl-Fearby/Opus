"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { ComponentsPageHeader } from "./ComponentsPageHeader";
import { ComponentsShellHeader } from "./ComponentsShellHeader";
import { ComponentsSidebar } from "./ComponentsSidebar";
import { ComponentSettingsProvider, useComponentSettingsContext } from "./ComponentSettingsContext";
import { ComponentsSettingsSidebar } from "./ComponentsSettingsSidebar";
import {
  ViewportAtmosphere,
  ViewportAtmosphereProvider,
  type ViewportAtmosphereSettings,
} from "@/components/control-detail/ControlDetail/BodyPortal";
import { controlHasSettingsPanel } from "@/lib/controls/controlSettingsPanel";
import { CustomScrollbar } from "opus-react";
import styles from "./ComponentsShell.module.css";

function ComponentsShellBody({ children }: { children: ReactNode }) {
  const { accentStyle } = useComponentsTheme();
  const { activeSlug, isResizing, settingsCollapsed, settingsWidth } = useComponentSettingsContext();

  const hasSettings = Boolean(activeSlug && controlHasSettingsPanel(activeSlug));
  const settingsColumnWidth = settingsCollapsed ? 44 : settingsWidth;

  return (
    <div
      className={styles.body}
      data-has-settings={hasSettings ? "true" : undefined}
      data-resizing={isResizing ? "true" : undefined}
      data-settings-collapsed={hasSettings && settingsCollapsed ? "true" : undefined}
      style={{ "--settings-sidebar-width": `${settingsColumnWidth}px` } as CSSProperties}
    >
      <ComponentsSidebar />
      <main className={styles.content} id="main-content" style={accentStyle}>
        <ComponentsPageHeader />
        <CustomScrollbar className={styles.contentBody} label="Component documentation" orientation="vertical">
          <div className={styles.contentBodyInner}>{children}</div>
        </CustomScrollbar>
      </main>
      <ComponentsSettingsSidebar />
    </div>
  );
}

export function ComponentsDocsShell({ children }: { children: ReactNode }) {
  const { accentStyle } = useComponentsTheme();
  const [atmosphere, setAtmosphere] = useState<ViewportAtmosphereSettings | null>(null);

  return (
    <ViewportAtmosphereProvider setSettings={setAtmosphere}>
      <div className={styles.shell} data-components-shell="" style={accentStyle}>
        <div aria-hidden="true" className={styles.viewportAtmosphere} data-viewport-atmosphere="">
          <ViewportAtmosphere settings={atmosphere} />
        </div>
        <a className={styles.skipLink} href="#main-content">
          Skip to main content
        </a>
        <ComponentsShellHeader />
        <ComponentSettingsProvider>
          <ComponentsShellBody>{children}</ComponentsShellBody>
        </ComponentSettingsProvider>
      </div>
    </ViewportAtmosphereProvider>
  );
}
