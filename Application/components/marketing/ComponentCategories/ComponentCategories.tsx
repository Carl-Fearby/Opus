import Link from "next/link";
import {
  categoryDescriptions,
  componentCategories,
  controls,
  getControlSectionsByCategory,
  getControlsByCategory,
} from "@/lib/controls/registry";
import { categoryPath, componentPath, COMPONENTS_BASE_PATH } from "@/lib/controls/routes";
import styles from "./ComponentCategories.module.css";

export function ComponentCategories() {
  return (
    <section className={styles.section} id="components">
      <div className={styles.inner}>
        <div className={styles.directory}>
          <div className={styles.introRow}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}>Component library</p>
              <h2>Every component. One coherent system.</h2>
              <p>
                Explore all {controls.length} documented primitives, visualisations, application
                patterns, and complete compositions available in Opus today.
              </p>
            </div>
            <Link className={styles.catalogueLink} href={COMPONENTS_BASE_PATH}>
              Open the full catalogue <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.categoryList}>
          {componentCategories.map((category) => {
            const categoryControls = getControlsByCategory(category.id);
            const sections = getControlSectionsByCategory(category.id);
            const ungroupedSections = sections.filter((section) => !section.label);
            const groupedSections = sections.filter((section) => section.label);

            return (
              <article key={category.id} className={styles.categoryRow}>
                <div className={styles.categorySummary}>
                  <div className={styles.categoryTitle}>
                    <h3>{category.label}</h3>
                    <span>{categoryControls.length}</span>
                  </div>
                  <p>{categoryDescriptions[category.id]}</p>
                  <Link className={styles.categoryLink} href={categoryPath(category.id)}>
                    Browse {category.label.toLowerCase()} <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className={styles.groups}>
                  {ungroupedSections.map((section) => (
                    <div className={`${styles.group} ${styles.ungrouped}`} key={`${category.id}-components`}>
                      <h4>Components</h4>
                      <ul>
                        {section.controls.map((control) => (
                          <li key={control.slug}>
                            <Link href={componentPath(control.slug)}>{control.title}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {groupedSections.length ? (
                    <div className={styles.groupColumns}>
                      {groupedSections.map((section) => (
                        <div className={styles.group} key={section.label}>
                          <h4>{section.label}</h4>
                          <ul>
                            {section.controls.map((control) => (
                              <li key={control.slug}>
                                <Link href={componentPath(control.slug)}>{control.title}</Link>
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
