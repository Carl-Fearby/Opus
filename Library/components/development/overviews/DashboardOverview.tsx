"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import { getNavigationGroupIcon } from "@/lib/controls/componentIcons";
import { getControlSectionsByCategory } from "@/lib/controls/registry";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

export function DashboardOverview() {
  const sections = getControlSectionsByCategory("dashboard");

  useSetComponentsPageHeader(
    "Dashboard",
    "Dashboard widgets, metric cards, progress components, profile panels, and data-rich summary blocks.",
  );

  return (
    <div className={styles.page}>
      {sections.map((section) => (
        <section className={styles.demoSection} key={section.label ?? "dashboard"}>
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
