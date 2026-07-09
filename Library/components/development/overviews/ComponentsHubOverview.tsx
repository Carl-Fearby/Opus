"use client";

import Link from "next/link";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getCategoryIcon, getComponentIcon, getNavigationGroupIcon } from "@/lib/controls/componentIcons";
import { categoryDescriptions, componentCategories, getControlSectionsByCategory, getControlsByCategory } from "@/lib/controls/registry";
import { categoryPath, componentPath } from "@/lib/controls/routes";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import styles from "./overview.module.css";

export function ComponentsHubOverview() {
  useSetComponentsPageHeader(
    "Overview",
    "Browse components by category in the sidebar. Expand grouped sections under Content, or search the menu to jump straight to any component.",
  );

  return (
    <div className={styles.hubPage}>
      <section className={styles.hubIntro} aria-label="How to browse">
        <p>
          Use the sidebar to explore <strong>Content</strong>, <strong>Forms</strong>,{" "}
          <strong>Graphs</strong>, <strong>Labs</strong>, <strong>System</strong>, and{" "}
          <strong>Overlays</strong>. Under Content, open groups such as Accordion, Data, Images, and
          Navigation. Labs holds combined compositions built from multiple components. System holds
          route-level pages such as 404 and 403. The search field above the menu lists matching
          components in a flat list without the tree.
        </p>
      </section>

      {componentCategories.map((category) => {
        const controls = getControlsByCategory(category.id);
        const sections = getControlSectionsByCategory(category.id);

        return (
          <section key={category.id} className={styles.hubSection}>
            <header className={styles.hubSectionHeader}>
              <div className={styles.hubSectionHeadingRow}>
                <Link className={styles.hubSectionTitleLink} href={categoryPath(category.id)}>
                  <ComponentIcon icon={getCategoryIcon(category.id)} />
                  <h2 className={styles.hubSectionTitle}>{category.label}</h2>
                  <span className={styles.hubSectionCount}>{controls.length}</span>
                </Link>
                <Link className={styles.hubSectionViewAll} href={categoryPath(category.id)}>
                  View all
                </Link>
              </div>
              <p className={styles.hubSectionDescription}>{categoryDescriptions[category.id]}</p>
            </header>

            {sections.map((section) => (
              <div className={styles.hubSubsection} key={section.label ?? "ungrouped"}>
                {section.label ? (
                  <h3 className={styles.hubSubsectionTitle}>
                    <ComponentIcon compact icon={getNavigationGroupIcon(section.label)} />
                    <span>{section.label}</span>
                  </h3>
                ) : null}
                <div className={styles.hubGrid}>
                  {section.controls.map((control) => (
                    <Link
                      key={control.slug}
                      className={styles.hubComponentLink}
                      href={componentPath(control.slug)}
                    >
                      <span className={styles.hubComponentLinkHeading}>
                        <ComponentIcon icon={getComponentIcon(control.slug)} />
                        <span className={styles.hubComponentLinkTitle}>{control.title}</span>
                      </span>
                      <span className={styles.hubComponentLinkDescription}>{control.description}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
