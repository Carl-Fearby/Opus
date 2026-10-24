"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getControlsByCategory } from "@/lib/controls/registry";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

export function LabOverview() {
  const compositions = getControlsByCategory("labs");
  const { t } = useLocale();

  useSetComponentsPageHeader(t("docs.labs.title"), t("docs.labs.description"));

  return (
    <div className={styles.page}>
      <section className={styles.hubIntro} aria-label={t("docs.labs.aboutAria")}>
        <p>{t("docs.labs.intro")}</p>
      </section>
      <section className={styles.demoSection}>
        <div className={styles.demoGrid}>
          {compositions.map((control) => (
            <OverviewDemoCard key={control.slug} slug={control.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}
