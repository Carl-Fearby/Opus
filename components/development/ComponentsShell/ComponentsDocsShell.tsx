"use client";

import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { ComponentsPageHeader } from "./ComponentsPageHeader";
import { ComponentsShellHeader } from "./ComponentsShellHeader";
import { ComponentsSidebar } from "./ComponentsSidebar";
import styles from "./ComponentsShell.module.css";

export function ComponentsDocsShell({ children }: { children: React.ReactNode }) {
  const { accentStyle, theme } = useComponentsTheme();

  return (
    <div className={styles.shell} data-theme="dark" style={accentStyle}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <ComponentsShellHeader />
      <div className={styles.body}>
        <ComponentsSidebar />
        <main className={styles.content} data-theme={theme} id="main-content" style={accentStyle}>
          <ComponentsPageHeader />
          {children}
        </main>
      </div>
    </div>
  );
}
