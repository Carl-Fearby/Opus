"use client";

import type { CSSProperties, ReactNode } from "react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { ComponentsPageHeader } from "./ComponentsPageHeader";
import { ComponentsShellHeader } from "./ComponentsShellHeader";
import { ComponentsSidebar } from "./ComponentsSidebar";
import { ComponentSettingsProvider, useComponentSettingsContext } from "./ComponentSettingsContext";
import { ComponentsSettingsSidebar } from "./ComponentsSettingsSidebar";
import styles from "./ComponentsShell.module.css";

function ComponentsShellBody({ children }: { children: ReactNode }) {
  const { accentStyle, theme } = useComponentsTheme();
  const { activeSlug, isResizing, settingsWidth } = useComponentSettingsContext();

  return (
    <div
      className={styles.body}
      data-has-settings={activeSlug ? "true" : undefined}
      data-resizing={isResizing ? "true" : undefined}
      style={{ "--settings-sidebar-width": `${settingsWidth}px` } as CSSProperties}
    >
      <ComponentsSidebar />
      <main className={styles.content} data-theme={theme} id="main-content" style={accentStyle}>
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
    <div className={styles.shell} data-theme="dark" style={accentStyle}>
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
