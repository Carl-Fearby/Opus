"use client";

import { ThemeToggleField } from "@/components/fields";
import { FontPicker } from "@/components/FontPicker";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./ComponentsShell.module.css";

export function ComponentsShellHeader() {
  const { t } = useOpusI18n();
  const {
    accent,
    accentSecondary,
    baseColor,
    fontFamily,
    previewTheme,
    resetAccent,
    resetTileAccent,
    setAccent,
    setAccentSecondary,
    setBaseColor,
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
          <span className={styles.tourControl} data-opus-tour="ui-font">
            <FontPicker compact id="global-font-picker" value={fontFamily} onChange={setFontFamily} />
          </span>
          <span className={styles.tourControl} data-opus-tour="ui-theme">
            <ThemeToggleField
              id="global-theme-toggle"
              label={t("common.theme", "Theme")}
              labelPosition="left"
              labelVisuallyHidden
              mode="flagged"
              value={theme}
              onChange={setTheme}
            />
          </span>
          <span className={styles.tourControl} data-opus-tour="ui-colours">
            <ThemeSettingsButton
              base={baseColor}
              accent={accent}
              accentSecondary={accentSecondary}
              compact
              fontFamily={fontFamily}
              idPrefix="global"
              theme={previewTheme}
              themeLabel={t("preview.theme", "Preview theme")}
              tileAccent={tileAccent}
              tileAccentSecondary={tileAccentSecondary}
              onAccentChange={setAccent}
              onAccentSecondaryChange={setAccentSecondary}
              onBaseChange={setBaseColor}
              onFontFamilyChange={setFontFamily}
              onResetAccent={resetAccent}
              onResetTileAccent={resetTileAccent}
              onThemeChange={setPreviewTheme}
              onTileAccentChange={setTileAccent}
              onTileAccentSecondaryChange={setTileAccentSecondary}
            />
          </span>
        </div>
      }
    />
  );
}
