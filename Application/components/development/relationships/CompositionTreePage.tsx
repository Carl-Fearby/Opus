"use client";

import Link from "next/link";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { getComponentIcon } from "@/lib/controls/componentIcons";
import { getCompositionTree } from "@/lib/controls/compositionGraph";
import { componentPath } from "@/lib/controls/routes";
import type { ControlDefinition } from "@/lib/controls/types";
import styles from "./CompositionTreePage.module.css";

function controlHref(control: ControlDefinition) {
  return componentPath(control.slug);
}

export function CompositionTreePage() {
  const nodes = getCompositionTree();
  const relationshipCount = nodes.reduce((total, node) => total + node.children.length, 0);
  const childCount = new Set(nodes.flatMap((node) => node.children.map((child) => `${child.category}:${child.slug}`))).size;

  useSetComponentsPageHeader(
    "Relationships",
    "Graphical map of documented Opus components and the public sub-components they are built from.",
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="relationships-title">
        <div>
          <p className={styles.kicker}>Composition map</p>
          <h1 className={styles.title} id="relationships-title">
            Built from relationships
          </h1>
          <p className={styles.description}>
            This page only shows relationships between documented public components. Internal
            helpers stay hidden unless they have their own component docs.
          </p>
        </div>
        <dl className={styles.stats} aria-label="Relationship totals">
          <div className={styles.stat}>
            <dt>Compositions</dt>
            <dd>{nodes.length}</dd>
          </div>
          <div className={styles.stat}>
            <dt>Links</dt>
            <dd>{relationshipCount}</dd>
          </div>
          <div className={styles.stat}>
            <dt>Sub-components</dt>
            <dd>{childCount}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.graphSection} aria-labelledby="relationship-graph-title">
        <div className={styles.sectionHeader}>
          <p className={styles.kicker}>Graph</p>
          <h2 className={styles.sectionTitle} id="relationship-graph-title">
            Parent to child map
          </h2>
        </div>
        <div className={styles.graphRoot}>
          <div className={styles.rootNode}>
            <span className={styles.rootMark}>Opus</span>
            <span className={styles.rootLabel}>Component library</span>
          </div>
          <div className={styles.rootStem} aria-hidden="true" />
        </div>
        <div className={styles.graphGrid}>
          {nodes.map((node) => (
            <article className={styles.graphCard} key={`${node.category}:${node.slug}`}>
              <Link className={styles.parentLink} href={controlHref(node)}>
                <ComponentIcon icon={getComponentIcon(node.slug)} />
                <span>
                  <span className={styles.parentTitle}>{node.title}</span>
                  <span className={styles.parentMeta}>
                    {node.category} · {node.children.length} part{node.children.length === 1 ? "" : "s"}
                  </span>
                </span>
              </Link>
              <div className={styles.connector} aria-hidden="true" />
              <ul className={styles.childList}>
                {node.children.map((child) => (
                  <li key={`${node.slug}:${child.category}:${child.slug}`}>
                    <Link className={styles.childLink} href={controlHref(child)}>
                      <ComponentIcon compact icon={getComponentIcon(child.slug)} />
                      <span>{child.title}</span>
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
          <p className={styles.kicker}>Audit</p>
          <h2 className={styles.sectionTitle} id="relationship-outline-title">
            Strict relationship outline
          </h2>
        </div>
        <div className={styles.outlineGrid}>
          {nodes.map((node) => (
            <article className={styles.outlineCard} key={`outline:${node.category}:${node.slug}`}>
              <Link className={styles.outlineParent} href={controlHref(node)}>
                {node.title}
              </Link>
              <p className={styles.outlineMeta}>
                Uses {node.children.length} documented component{node.children.length === 1 ? "" : "s"}
                {node.parentCount ? ` · used by ${node.parentCount}` : ""}
              </p>
              <ul className={styles.outlineChildren}>
                {node.children.map((child) => (
                  <li key={`outline:${node.slug}:${child.category}:${child.slug}`}>
                    <Link href={controlHref(child)}>{child.title}</Link>
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
