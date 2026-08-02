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

        <div className={styles.grid}>
          {componentCategories.map((category) => {
            const categoryControls = getControlsByCategory(category.id);
            const sections = getControlSectionsByCategory(category.id);

            return (
              <article key={category.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h3>{category.label}</h3>
                    <p>{categoryDescriptions[category.id]}</p>
                  </div>
                  <span>{categoryControls.length}</span>
                </div>

                <div className={styles.groups}>
                  {sections.map((section) => (
                    <div className={styles.group} key={section.label ?? `${category.id}-components`}>
                      {section.label ? <h4>{section.label}</h4> : null}
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

                <Link className={styles.categoryLink} href={categoryPath(category.id)}>
                  Browse {category.label.toLowerCase()} <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
