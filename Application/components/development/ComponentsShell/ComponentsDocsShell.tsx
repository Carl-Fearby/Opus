"use client";

import type { CSSProperties, ReactNode } from "react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { ComponentsPageHeader } from "./ComponentsPageHeader";
import { ComponentsShellHeader } from "./ComponentsShellHeader";
import { ComponentsSidebar } from "./ComponentsSidebar";
import { ComponentSettingsProvider, useComponentSettingsContext } from "./ComponentSettingsContext";
import { ComponentsSettingsSidebar } from "./ComponentsSettingsSidebar";
import { controlHasSettingsPanel } from "@/lib/controls/controlSettingsPanel";
import styles from "./ComponentsShell.module.css";

function ComponentsShellBody({ children }: { children: ReactNode }) {
  const { accentStyle } = useComponentsTheme();
  const { activeSlug, isResizing, settingsWidth } = useComponentSettingsContext();

  const hasSettings = Boolean(activeSlug && controlHasSettingsPanel(activeSlug));

  return (
    <div
      className={styles.body}
      data-has-settings={hasSettings ? "true" : undefined}
      data-resizing={isResizing ? "true" : undefined}
      style={{ "--settings-sidebar-width": `${settingsWidth}px` } as CSSProperties}
    >
      <ComponentsSidebar />
      <main className={styles.content} id="main-content" style={accentStyle}>
        <ComponentsPageHeader />
        <div className={styles.contentBody}>{children}</div>
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
