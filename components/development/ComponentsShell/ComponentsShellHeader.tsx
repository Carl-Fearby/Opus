"use client";

import { ThemeToggleField } from "@/components/fields";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./ComponentsShell.module.css";

export function ComponentsShellHeader() {
  const { theme, setTheme } = useComponentsTheme();

  return (
    <DocumentationTopBar
      current="components"
      trailing={
        <div className={styles.themeControl}>
          <ThemeToggleField
            id="global-theme-toggle"
            label="Theme"
            labelPosition="left"
            mode="flagged"
            value={theme}
            onChange={setTheme}
          />
        </div>
      }
    />
  );
}
