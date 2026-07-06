"use client";

import { ThemeToggleField } from "@/components/fields";
import { AccentColorPicker } from "@/components/AccentColorPicker";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./ComponentsShell.module.css";

export function ComponentsShellHeader() {
  const { accent, setAccent, theme, setTheme } = useComponentsTheme();

  return (
    <DocumentationTopBar
      current="components"
      trailing={
        <div className={styles.themeControl}>
          <AccentColorPicker
            id="global-accent-picker"
            value={accent}
            onChange={setAccent}
          />
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
