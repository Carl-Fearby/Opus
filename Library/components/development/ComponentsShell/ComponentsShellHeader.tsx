"use client";

import { ThemeToggleField } from "@/components/fields";
import { FontPicker } from "@/components/FontPicker";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./ComponentsShell.module.css";

export function ComponentsShellHeader() {
  const {
    accent,
    accentSecondary,
    fontFamily,
    previewTheme,
    resetAccent,
    resetTileAccent,
    setAccent,
    setAccentSecondary,
    setFontFamily,
    setPreviewTheme,
    setTheme,
    setTileAccent,
    setTileAccentSecondary,
    theme,
    tileAccent,
    tileAccentSecondary,
  } = useComponentsTheme();

  return (
    <DocumentationTopBar
      current="components"
      trailing={
        <div className={styles.themeControl}>
          <FontPicker compact id="global-font-picker" value={fontFamily} onChange={setFontFamily} />
          <ThemeToggleField
            id="global-theme-toggle"
            label="Theme"
            labelPosition="left"
            labelVisuallyHidden
            mode="flagged"
            value={theme}
            onChange={setTheme}
          />
          <ThemeSettingsButton
            accent={accent}
            accentSecondary={accentSecondary}
            compact
            fontFamily={fontFamily}
            idPrefix="global"
            theme={previewTheme}
            themeLabel="Preview theme"
            tileAccent={tileAccent}
            tileAccentSecondary={tileAccentSecondary}
            onAccentChange={setAccent}
            onAccentSecondaryChange={setAccentSecondary}
            onFontFamilyChange={setFontFamily}
            onResetAccent={resetAccent}
            onResetTileAccent={resetTileAccent}
            onThemeChange={setPreviewTheme}
            onTileAccentChange={setTileAccent}
            onTileAccentSecondaryChange={setTileAccentSecondary}
          />
        </div>
      }
    />
  );
}
