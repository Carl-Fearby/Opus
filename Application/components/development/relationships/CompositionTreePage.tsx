"use client";

import Link from "next/link";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { useOpusI18n } from "@/components/OpusI18n";
import { categoryMessageKey } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useComponentTitle } from "@/lib/i18n/useComponentTitle";
import { getComponentIcon } from "@/lib/controls/componentIcons";
import { getCompositionTree } from "@/lib/controls/compositionGraph";
import { componentPath } from "@/lib/controls/routes";
import type { ControlDefinition } from "@/lib/controls/types";
import styles from "./CompositionTreePage.module.css";

function controlHref(control: ControlDefinition) {
  return componentPath(control.slug);
}

export function CompositionTreePage() {
  const { t } = useOpusI18n();
  const { t: tSite } = useLocale();
  const titleFor = useComponentTitle();
  const nodes = getCompositionTree();
  const relationshipCount = nodes.reduce((total, node) => total + node.children.length, 0);
  const childCount = new Set(nodes.flatMap((node) => node.children.map((child) => `${child.category}:${child.slug}`))).size;

  useSetComponentsPageHeader(
    t("relationships.title", "Relationships"),
    t(
      "relationships.description",
      "Graphical map of documented Opus components and the public sub-components they are built from.",
    ),
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="relationships-title">
        <div>
          <p className={styles.kicker}>{t("relationships.compositionMap", "Composition map")}</p>
          <h1 className={styles.title} id="relationships-title">
            {t("relationships.builtFrom", "Built from relationships")}
          </h1>
          <p className={styles.description}>
            {t(
              "relationships.body",
              "This page only shows relationships between documented public components — including Labs compositions such as Login Form, Forgot Password, Company Details, and Sales Invoice. Internal helpers stay hidden unless they have their own component docs. Third-party foundations are recorded separately on the",
            )}{" "}
            <Link href="/documentation/guide/licensed-components">
              {t("relationships.licensed", "Licensed components")}
            </Link>{" "}
            {t("relationships.pageSuffix", "page.")}
          </p>
        </div>
        <dl className={styles.stats} aria-label={t("relationships.totals", "Relationship totals")}>
          <div className={styles.stat}>
            <dt>{t("relationships.compositions", "Compositions")}</dt>
            <dd>{nodes.length}</dd>
          </div>
          <div className={styles.stat}>
            <dt>{t("relationships.links", "Links")}</dt>
            <dd>{relationshipCount}</dd>
          </div>
          <div className={styles.stat}>
            <dt>{t("relationships.subComponents", "Sub-components")}</dt>
            <dd>{childCount}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.graphSection} aria-labelledby="relationship-graph-title">
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>{t("relationships.graph", "Graph")}</p>
          <h2 className={styles.sectionTitle} id="relationship-graph-title">
            {t("relationships.parentToChild", "Parent to child map")}
          </h2>
        </div>
        <div className={styles.graphRoot}>
          <div className={styles.rootNode}>
            <span className={styles.rootMark}>Opus</span>
            <span className={styles.rootLabel}>{t("relationships.componentLibrary", "Component library")}</span>
          </div>
          <div className={styles.rootStem} aria-hidden="true" />
        </div>
        <div className={styles.graphGrid}>
          {nodes.map((node) => (
            <article className={styles.graphCard} key={`${node.category}:${node.slug}`}>
              <Link className={styles.parentLink} href={controlHref(node)}>
                <ComponentIcon icon={getComponentIcon(node.slug)} />
                <span>
                  <span className={styles.parentTitle}>{titleFor(node.slug, node.title)}</span>
                  <span className={styles.parentMeta}>
                    {tSite(categoryMessageKey(node.category))} ·{" "}
                    {node.children.length === 1
                      ? t("relationships.part", "{count} part", { count: node.children.length })
                      : t("relationships.parts", "{count} parts", { count: node.children.length })}
                  </span>
                </span>
              </Link>
              <div className={styles.connector} aria-hidden="true" />
              <ul className={styles.childList}>
                {node.children.map((child) => (
                  <li key={`${node.slug}:${child.category}:${child.slug}`}>
                    <Link className={styles.childLink} href={controlHref(child)}>
                      <ComponentIcon compact icon={getComponentIcon(child.slug)} />
                      <span>{titleFor(child.slug, child.title)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.outlineSection} aria-labelledby="relationship-outline-title">
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>{t("relationships.audit", "Audit")}</p>
          <h2 className={styles.sectionTitle} id="relationship-outline-title">
            {t("relationships.strictOutline", "Strict relationship outline")}
          </h2>
        </div>
        <div className={styles.outlineGrid}>
          {nodes.map((node) => (
            <article className={styles.outlineCard} key={`outline:${node.category}:${node.slug}`}>
              <Link className={styles.outlineParent} href={controlHref(node)}>
                {titleFor(node.slug, node.title)}
              </Link>
              <p className={styles.outlineMeta}>
                {node.children.length === 1
                  ? t("relationships.uses", "Uses {count} documented component", { count: node.children.length })
                  : t("relationships.usesPlural", "Uses {count} documented components", { count: node.children.length })}
                {node.parentCount
                  ? t("relationships.usedBy", " · used by {count}", { count: node.parentCount })
                  : ""}
              </p>
              <ul className={styles.outlineChildren}>
                {node.children.map((child) => (
                  <li key={`outline:${node.slug}:${child.category}:${child.slug}`}>
                    <Link href={controlHref(child)}>{titleFor(child.slug, child.title)}</Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
