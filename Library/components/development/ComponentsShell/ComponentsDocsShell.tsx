"use client";

import type { CSSProperties, ReactNode } from "react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { ComponentsPageHeader } from "./ComponentsPageHeader";
import { ComponentsShellHeader } from "./ComponentsShellHeader";
import { ComponentsSidebar } from "./ComponentsSidebar";
import { ComponentSettingsProvider, useComponentSettingsContext } from "./ComponentSettingsContext";
import { ComponentsSettingsSidebar } from "./ComponentsSettingsSidebar";
import { controlHasSettingsPanel } from "@/lib/controls/controlSettingsPanel";
import { CustomScrollbar } from "@/components/CustomScrollbar";
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

  return (
    <div className={styles.shell} style={accentStyle}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <ComponentsShellHeader />
      <ComponentSettingsProvider>
        <ComponentsShellBody>{children}</ComponentsShellBody>
      </ComponentSettingsProvider>
    </div>
  );
}
