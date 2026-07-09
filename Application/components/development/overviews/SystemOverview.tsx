"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getControlsByCategory } from "@/lib/controls/registry";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

export function SystemOverview() {
  const pages = getControlsByCategory("system");

  useSetComponentsPageHeader(
    "System",
    "Application-level pages such as error and access-denied states. Use these as reference when wiring routes and shells.",
  );

  return (
    <div className={styles.page}>
      <section className={styles.hubIntro} aria-label="About System">
        <p>
          System entries are <strong>full-page patterns</strong> — route-level screens that sit outside
          individual component categories. Preview them here before wiring into your app shell.
        </p>
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
