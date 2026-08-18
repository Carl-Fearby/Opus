"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getControlSectionsByCategory } from "@/lib/controls/registry";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

export function GamesOverview() {
  const sections = getControlSectionsByCategory("games");

  useSetComponentsPageHeader(
    "Games",
    "Playable browser components and interactive game experiments.",
  );

  return (
    <div className={styles.page}>
      {sections.map((section) => (
        <section className={styles.demoSection} key={section.label ?? "games"}>
          {section.label ? <h2 className={styles.demoSectionTitle}>{section.label}</h2> : null}
          <div className={styles.demoGrid}>
            {section.controls.map((control) => (
              <OverviewDemoCard key={control.slug} slug={control.slug} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
