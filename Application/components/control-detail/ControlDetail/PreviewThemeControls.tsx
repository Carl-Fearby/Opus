"use client";

import { ThemeToggleField } from "opus-react";
import type { Theme } from "opus-react";
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
    fontFamily,
    previewAccent,
    previewAccentSecondary,
    previewBaseColor,
    previewTheme,
    previewTileAccent,
    previewTileAccentSecondary,
    resetPreviewAccent,
    resetPreviewTileAccent,
    setFontFamily,
    setPreviewAccent,
    setPreviewAccentSecondary,
    setPreviewBaseColor,
    setPreviewTheme,
    setPreviewTileAccent,
    setPreviewTileAccentSecondary,
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
        base={previewBaseColor}
        accent={previewAccent}
        accentSecondary={previewAccentSecondary}
        compact
        fontFamily={fontFamily}
        idPrefix={`${id}-preview`}
        theme={theme}
        themeLabel="Preview theme"
        tileAccent={previewTileAccent}
        tileAccentSecondary={previewTileAccentSecondary}
        onAccentChange={setPreviewAccent}
        onAccentSecondaryChange={setPreviewAccentSecondary}
        onBaseChange={setPreviewBaseColor}
        onFontFamilyChange={setFontFamily}
        onResetAccent={resetPreviewAccent}
        onResetTileAccent={resetPreviewTileAccent}
        onThemeChange={handleThemeChange}
        onTileAccentChange={setPreviewTileAccent}
        onTileAccentSecondaryChange={setPreviewTileAccentSecondary}
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
