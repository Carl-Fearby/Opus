"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getControlsByCategory } from "@/lib/controls/registry";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

export function OverlaysOverview() {
  const controls = getControlsByCategory("overlays");

  useSetComponentsPageHeader(
    "Overlays",
    "Tooltips, command palettes, and toast notifications for contextual help and feedback.",
  );

  return (
    <div className={styles.page}>
      <section className={styles.demoGrid}>
        {controls.map((control) => (
          <OverviewDemoCard key={control.slug} slug={control.slug} />
        ))}
      </section>
    </div>
  );
}
