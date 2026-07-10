"use client";

import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getControlsForNavigationGroup } from "@/lib/controls/registry";
import type { ComponentCategory } from "@/lib/controls/types";
import { OverviewDemoCard } from "./OverviewDemoCard";
import styles from "./overview.module.css";

type CategorySubgroupOverviewProps = {
  category: ComponentCategory;
  navigationGroup: string;
};

export function CategorySubgroupOverview({ category, navigationGroup }: CategorySubgroupOverviewProps) {
  const controls = getControlsForNavigationGroup(category, navigationGroup);

  useSetComponentsPageHeader(
    navigationGroup,
    controls.length === 1
      ? "One component in this section."
      : `${controls.length} components in this section.`,
  );

  return (
    <div className={styles.page}>
      <div className={styles.demoGrid}>
        {controls.map((control) => (
          <OverviewDemoCard key={control.slug} slug={control.slug} />
        ))}
      </div>
    </div>
  );
}
