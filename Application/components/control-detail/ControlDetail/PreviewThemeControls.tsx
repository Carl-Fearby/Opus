"use client";

import { ThemeToggleField } from "opus-react";
import { FontPicker } from "opus-react";
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

export function PreviewPlatformSelector() {
  const { previewPlatform, setPreviewPlatform } = useComponentsTheme();

  return (
    <div aria-label="Preview platform" className={styles.previewPlatformSelector} role="group">
      <button aria-pressed={previewPlatform === "desktop"} onClick={() => setPreviewPlatform("desktop")} type="button">Desktop</button>
      <button aria-pressed={previewPlatform === "mobile"} onClick={() => setPreviewPlatform("mobile")} type="button">Mobile</button>
    </div>
  );
}

export function PreviewThemeControls({
  id = "preview-theme-toggle",
  onThemeChange,
  theme: controlledTheme,
  variant = "panel",
}: PreviewThemeControlsProps) {
  const {
    previewAccent,
    previewAccentSecondary,
    previewTertiaryAccent,
    previewDefaults,
    previewBaseColor,
    previewFontFamily,
    previewTheme,
    previewTileAccent,
    previewTileAccentSecondary,
    resetPreviewAccent,
    resetPreviewTileAccent,
    setPreviewAccent,
    setPreviewAccentSecondary,
    setPreviewTertiaryAccent,
    setPreviewDefaults,
    setPreviewBaseColor,
    setPreviewFontFamily,
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
      data-opus-tour="preview-appearance"
    >
      <ThemeSettingsButton
        base={previewBaseColor}
        accent={previewAccent}
        accentSecondary={previewAccentSecondary}
        tertiaryAccent={previewTertiaryAccent}
        defaults={previewDefaults}
        compact
        fontFamily={previewFontFamily}
        idPrefix={`${id}-preview`}
        theme={theme}
        themeLabel="Preview theme"
        tileAccent={previewTileAccent}
        tileAccentSecondary={previewTileAccentSecondary}
        onAccentChange={setPreviewAccent}
        onAccentSecondaryChange={setPreviewAccentSecondary}
        onTertiaryAccentChange={setPreviewTertiaryAccent}
        onDefaultsChange={setPreviewDefaults}
        onBaseChange={setPreviewBaseColor}
        onResetAccent={resetPreviewAccent}
        onResetTileAccent={resetPreviewTileAccent}
        onThemeChange={handleThemeChange}
        onTileAccentChange={setPreviewTileAccent}
        onTileAccentSecondaryChange={setPreviewTileAccentSecondary}
      />
      <FontPicker
        compact
        id={`${id}-font`}
        value={previewFontFamily}
        onChange={setPreviewFontFamily}
      />
      <PreviewPlatformSelector />
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
