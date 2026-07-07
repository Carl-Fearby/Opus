"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import { getNavigationGroupIcon } from "@/lib/controls/componentIcons";
import { getControlSectionsByCategory } from "@/lib/controls/registry";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

export function GraphsOverview() {
  const sections = getControlSectionsByCategory("graphs");

  useSetComponentsPageHeader(
    "Graphs",
    "Chart components for comparing categories, tracking trends, showing composition, and exploring metric relationships.",
  );

  return (
    <div className={styles.page}>
      {sections.map((section) => (
        <section className={styles.demoSection} key={section.label ?? "graphs"}>
          {section.label ? (
            <h2 className={styles.demoSectionTitle}>
              <ComponentIcon compact icon={getNavigationGroupIcon(section.label)} />
              <span>{section.label}</span>
            </h2>
          ) : null}
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
