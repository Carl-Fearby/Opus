"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getControlsByCategory } from "@/lib/controls/registry";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

export function LabOverview() {
  const compositions = getControlsByCategory("labs");

  useSetComponentsPageHeader(
    "Labs",
    "Combined compositions built from multiple library components. Use these as reference patterns, not standalone primitives.",
  );

  return (
    <div className={styles.page}>
      <section className={styles.hubIntro} aria-label="About Labs">
        <p>
          Labs entries are <strong>compositions</strong> — pre-wired examples that combine layout,
          containers, and widgets. Individual building blocks stay in Content, Forms, Graphs, and
          Overlays.
        </p>
      </section>
      <section className={styles.demoSection}>
        <div className={styles.demoGrid}>
          {compositions.map((control) => (
            <OverviewDemoCard key={control.slug} previewCategory="labs" slug={control.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}
