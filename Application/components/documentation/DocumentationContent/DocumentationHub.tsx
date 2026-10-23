"use client";

import Link from "next/link";
import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import { COMPONENTS_BASE_PATH, GUIDE_BASE_PATH, VERSION_BASE_PATH } from "@/lib/documentation/routes";
import { libraryVersion } from "@/lib/documentation/libraryVersion";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import { useStoredTheme } from "@/lib/theme/useStoredTheme";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./documentation.module.css";

type DocumentationHubProps = {
  catalogueCount: number;
};

export function DocumentationHub({ catalogueCount }: DocumentationHubProps) {
  const { t } = useLocale();
  const [theme, setTheme] = useStoredTheme();
  const { accent, accentSecondary, accentStyle, resetAccent, setAccent, setAccentSecondary } =
    useAccentPreference();
  const {
    resetTileAccent,
    setTileAccent,
    setTileAccentSecondary,
    tileAccent,
    tileAccentSecondary,
    tileAccentStyle,
  } = useTileAccentPreference();

  return (
    <OpusThemeProvider applyToDocument={false} theme={theme}>
      <div className={styles.shell} style={{ ...accentStyle, ...tileAccentStyle }}>
        <DocumentationTopBar
          current="home"
          trailing={
            <ThemeSettingsButton
              accent={accent}
              accentSecondary={accentSecondary}
              idPrefix="documentation"
              theme={theme}
              themeLabel="Page theme"
              tileAccent={tileAccent}
              tileAccentSecondary={tileAccentSecondary}
              onAccentChange={setAccent}
              onAccentSecondaryChange={setAccentSecondary}
              onResetAccent={resetAccent}
              onResetTileAccent={resetTileAccent}
              onThemeChange={setTheme}
              onTileAccentChange={setTileAccent}
              onTileAccentSecondaryChange={setTileAccentSecondary}
            />
          }
        />
        <div className={styles.hub}>
          <DocumentationBreadcrumbs currentLabel={t("docs.nav.home")} />
          <p className={styles.hubDescription}>{t("docs.hub.description")}</p>
          <div className={styles.hubGrid}>
            <Link className={styles.hubCard} href={GUIDE_BASE_PATH}>
              <h3 className={styles.hubCardTitle}>{t("docs.hub.guide")}</h3>
              <p className={styles.hubCardDescription}>{t("docs.hub.guideDescription")}</p>
            </Link>
            <Link className={styles.hubCard} href={COMPONENTS_BASE_PATH}>
              <h3 className={styles.hubCardTitle}>{t("docs.hub.components")}</h3>
              <p className={styles.hubCardDescription}>
                {t("docs.hub.componentsDescription", { count: catalogueCount })}
              </p>
            </Link>
            <Link className={styles.hubCard} href={VERSION_BASE_PATH}>
              <h3 className={styles.hubCardTitle}>
                {t("docs.hub.version", { version: libraryVersion })}
              </h3>
              <p className={styles.hubCardDescription}>{t("docs.hub.versionDescription")}</p>
            </Link>
          </div>
        </div>
      </div>
    </OpusThemeProvider>
  );
}
