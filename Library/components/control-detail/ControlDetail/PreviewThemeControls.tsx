"use client";

import { ThemeToggleField } from "@/components/fields";
import type { Theme } from "@/components/fields/types";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import styles from "./ControlDetail.module.css";

type PreviewThemeControlsProps = {
  id?: string;
  onThemeChange?: (theme: Theme) => void;
  theme?: Theme;
  variant?: "panel" | "toolbar";
};

export function PreviewThemeControls({
  id = "preview-theme-toggle",
  onThemeChange,
  theme: controlledTheme,
  variant = "panel",
}: PreviewThemeControlsProps) {
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
    setTileAccent,
    setTileAccentSecondary,
    tileAccent,
    tileAccentSecondary,
  } = useComponentsTheme();
  const theme = controlledTheme ?? previewTheme;
  const handleThemeChange = onThemeChange ?? setPreviewTheme;

  return (
    <div
      className={
        variant === "toolbar"
          ? `${styles.previewThemeControls} ${styles.previewThemeControlsToolbar}`
          : styles.previewThemeControls
      }
    >
      <ThemeSettingsButton
        accent={accent}
        accentSecondary={accentSecondary}
        compact
        fontFamily={fontFamily}
        idPrefix={`${id}-preview`}
        theme={theme}
        themeLabel="Preview theme"
        tileAccent={tileAccent}
        tileAccentSecondary={tileAccentSecondary}
        onAccentChange={setAccent}
        onAccentSecondaryChange={setAccentSecondary}
        onFontFamilyChange={setFontFamily}
        onResetAccent={resetAccent}
        onResetTileAccent={resetTileAccent}
        onThemeChange={handleThemeChange}
        onTileAccentChange={setTileAccent}
        onTileAccentSecondaryChange={setTileAccentSecondary}
      />
      <span className={styles.previewThemeLabel} id={`${id}-label`}>
        Preview theme
      </span>
      <ThemeToggleField
        className={styles.previewThemeField}
        id={id}
        label="Preview theme"
        labelVisuallyHidden
        labelPosition="left"
        mode="flagged"
        value={theme}
        onChange={handleThemeChange}
      />
    </div>
  );
}
