"use client";

import { Badge, Button, OpusThemeProvider, TextField } from "opus-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./ThemeShowcase.module.css";

type ThemeShowcaseProps = {
  componentCount: number;
};

export function ThemeShowcase({ componentCount }: ThemeShowcaseProps) {
  const { t } = useLocale();
  const themes = [
    { theme: "light" as const, label: t("marketing.theme.lightTheme") },
    { theme: "dark" as const, label: t("marketing.theme.darkTheme") },
  ];

  return (
    <section className={styles.section} aria-labelledby="theme-showcase-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{t("marketing.theme.eyebrow")}</p>
          <h2 id="theme-showcase-title">{t("marketing.theme.title")}</h2>
          <p>{t("marketing.theme.description")}</p>
          <ul className={styles.featureList}>
            <li>{t("marketing.theme.bullet1")}</li>
            <li>{t("marketing.theme.bullet2")}</li>
            <li>{t("marketing.theme.bullet3")}</li>
          </ul>
        </div>

        <div className={styles.snapshots}>
          {themes.map(({ label, theme }) => (
            <OpusThemeProvider applyToDocument={false} key={theme} theme={theme}>
              <article className={styles.snapshot} data-theme={theme}>
                <header className={styles.snapshotHeader}>
                  <span className={styles.windowDots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>{label}</span>
                </header>
                <div className={styles.snapshotBody}>
                  <div className={styles.snapshotTitle}>
                    <div>
                      <p>{t("marketing.theme.shared")}</p>
                      <strong>{t("marketing.theme.refresh")}</strong>
                    </div>
                    <Badge label={t("marketing.theme.readyForReview")} tone="success" />
                  </div>
                  <div className={styles.metrics}>
                    <div><span>{t("marketing.theme.coverage")}</span><strong>94%</strong></div>
                    <div><span>{t("docs.components")}</span><strong>{componentCount}</strong></div>
                  </div>
                  <TextField
                    id={`theme-preview-${theme}`}
                    label={t("marketing.theme.projectName")}
                    onChange={() => undefined}
                    type="text"
                    value={t("marketing.theme.workspace")}
                  />
                  <div className={styles.actions}>
                    <Button size="sm" type="button">{t("marketing.theme.saveChanges")}</Button>
                    <Button size="sm" type="button" variant="secondary">{t("marketing.theme.preview")}</Button>
                  </div>
                </div>
              </article>
            </OpusThemeProvider>
          ))}
        </div>
      </div>
    </section>
  );
}
