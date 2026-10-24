import Link from "next/link";
import {
  componentCategories,
  controls,
  getControlSectionsByCategory,
  getControlsByCategory,
} from "@/lib/controls/registry";
import { categoryPath, componentPath, COMPONENTS_BASE_PATH } from "@/lib/controls/routes";
import {
  categoryDescriptionMessageKey,
  categoryMessageKey,
  translate,
} from "@/lib/i18n";
import { localizeComponentTitle } from "@/lib/i18n/componentTitles";
import { localizeNavigationGroup } from "@/lib/i18n/navigationGroupLabels";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./ComponentCategories.module.css";

export async function ComponentCategories() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
    translate(locale, key, params);

  return (
    <section className={styles.section} id="components">
      <div className={styles.inner}>
        <div className={styles.directory}>
          <div className={styles.introRow}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}>{t("marketing.categories.eyebrow")}</p>
              <h2>{t("marketing.categories.title")}</h2>
              <p>{t("marketing.categories.description", { count: controls.length })}</p>
            </div>
            <Link className={styles.catalogueLink} href={COMPONENTS_BASE_PATH}>
              {t("marketing.categories.open")} <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.categoryList}>
          {componentCategories.map((category) => {
            const categoryControls = getControlsByCategory(category.id);
            const sections = getControlSectionsByCategory(category.id);
            const ungroupedSections = sections.filter((section) => !section.label);
            const groupedSections = sections.filter((section) => section.label);
            const categoryLabel = t(categoryMessageKey(category.id));

            return (
              <article key={category.id} className={styles.categoryRow}>
                <div className={styles.categorySummary}>
                  <div className={styles.categoryTitle}>
                    <h3>{categoryLabel}</h3>
                    <span>{categoryControls.length}</span>
                  </div>
                  <p>{t(categoryDescriptionMessageKey(category.id))}</p>
                  <Link className={styles.categoryLink} href={categoryPath(category.id)}>
                    {t("marketing.categories.browse", { category: categoryLabel.toLowerCase() })}{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className={styles.groups}>
                  {ungroupedSections.map((section) => (
                    <div className={`${styles.group} ${styles.ungrouped}`} key={`${category.id}-components`}>
                      <h4>{t("docs.components")}</h4>
                      <ul>
                        {section.controls.map((control) => (
                          <li key={control.slug}>
                            <Link href={componentPath(control.slug)}>
                              {localizeComponentTitle(locale, control.slug, control.title)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {groupedSections.length ? (
                    <div className={styles.groupColumns}>
                      {groupedSections.map((section) => (
                        <div className={styles.group} key={section.label}>
                          <h4>{localizeNavigationGroup(locale, section.label ?? "")}</h4>
                          <ul>
                            {section.controls.map((control) => (
                              <li key={control.slug}>
                                <Link href={componentPath(control.slug)}>
                                  {localizeComponentTitle(locale, control.slug, control.title)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
