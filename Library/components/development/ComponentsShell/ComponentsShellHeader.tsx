"use client";

import { AccentColorPicker } from "@/components/AccentColorPicker";
import { ThemeToggleField } from "@/components/fields";
import { FontPicker } from "@/components/FontPicker";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./ComponentsShell.module.css";

export function ComponentsShellHeader() {
  const { accent, fontFamily, setAccent, setFontFamily, setTheme, theme } = useComponentsTheme();

  return (
    <DocumentationTopBar
      current="components"
      trailing={
        <div className={styles.themeControl}>
          <FontPicker id="global-font-picker" value={fontFamily} onChange={setFontFamily} />
          <AccentColorPicker id="global-accent-picker" value={accent} onChange={setAccent} />
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
