"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getControlsByCategory } from "@/lib/controls/registry";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

export function SystemOverview() {
  const pages = getControlsByCategory("system");
  const { t } = useLocale();

  useSetComponentsPageHeader(t("docs.system.title"), t("docs.system.description"));

  return (
    <div className={styles.page}>
      <section className={styles.hubIntro} aria-label={t("docs.system.aboutAria")}>
        <p>{t("docs.system.intro")}</p>
      </section>
      <section className={styles.demoSection}>
        <div className={styles.demoGrid}>
          {pages.map((control) => (
            <OverviewDemoCard key={control.slug} slug={control.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}
