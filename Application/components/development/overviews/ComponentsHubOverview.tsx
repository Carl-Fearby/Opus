"use client";

import Link from "next/link";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getCategoryIcon, getComponentIcon, getNavigationGroupIcon } from "@/lib/controls/componentIcons";
import { componentCategories, getControlSectionsByCategory, getControlsByCategory } from "@/lib/controls/registry";
import { categoryPath, componentPath, COMPONENTS_BASE_PATH } from "@/lib/controls/routes";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import { useComponentDescription } from "@/lib/i18n/useComponentDescription";
import { useComponentTitle } from "@/lib/i18n/useComponentTitle";
import { categoryDescriptionMessageKey, categoryMessageKey } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./overview.module.css";

export function ComponentsHubOverview() {
  const describe = useComponentDescription();
  const titleFor = useComponentTitle();
  const { t } = useLocale();
  useSetComponentsPageHeader(
    t("docs.overview.title"),
    t("docs.overview.description"),
  );

  return (
    <div className={styles.hubPage}>
      <section className={styles.hubIntro} aria-label={t("docs.overview.howToBrowse")}>
        <p>{t("docs.overview.intro")}</p>
        <div className={styles.hubIntroActions}>
          <Link className={styles.hubIntroLink} href={`${COMPONENTS_BASE_PATH}/relationships`}>
            {t("docs.overview.relationships")}
          </Link>
        </div>
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
                  <h2 className={styles.hubSectionTitle}>{t(categoryMessageKey(category.id))}</h2>
                  <span className={styles.hubSectionCount}>{controls.length}</span>
                </Link>
                <Link className={styles.hubSectionViewAll} href={categoryPath(category.id)}>
                  {t("docs.overview.viewAll")}
                </Link>
              </div>
              <p className={styles.hubSectionDescription}>{t(categoryDescriptionMessageKey(category.id))}</p>
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
                        <span className={styles.hubComponentLinkTitle}>{titleFor(control.slug, control.title)}</span>
                      </span>
                      <span className={styles.hubComponentLinkDescription}>{describe(control.slug, control.description)}</span>
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
