"use client";

import Link from "next/link";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import { getComponentIcon } from "@/lib/controls/componentIcons";
import { getCompositionChildren } from "@/lib/controls/compositionGraph";
import { getControl } from "@/lib/controls/registry";
import { componentPath } from "@/lib/controls/routes";
import type { ControlDefinition, ControlSlug } from "@/lib/controls/types";
import styles from "./CompositionPartsList.module.css";

type CompositionLinksPanelProps = {
  controls?: ControlDefinition[];
  hint?: string;
  slugs: ControlSlug[];
  title: string;
};

function controlHref(control: ControlDefinition) {
  return componentPath(control.slug);
}

export function CompositionLinksPanel({ controls: resolvedControls, hint, slugs, title }: CompositionLinksPanelProps) {
  const entries =
    resolvedControls ??
    slugs
      .map((slug) => getControl(slug))
      .filter((control): control is NonNullable<typeof control> => Boolean(control));

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
      </div>
      <ul className={styles.list}>
        {entries.map((control) => (
          <li key={`${control.category}:${control.slug}`}>
            <Link className={styles.link} href={controlHref(control)}>
              <ComponentIcon compact icon={getComponentIcon(control.slug)} />
              <span className={styles.label}>{control.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CompositionPartsList({ control, parts }: { control?: ControlDefinition; parts: ControlSlug[] }) {
  return (
    <CompositionLinksPanel
      controls={control ? getCompositionChildren(control) : undefined}
      hint="Open a sub-component to view its docs and settings."
      slugs={parts}
      title="Built from"
    />
  );
}

export function CompositionUsageList({ controls, parents }: { controls?: ControlDefinition[]; parents: ControlSlug[] }) {
  return (
    <CompositionLinksPanel
      controls={controls}
      hint="Parent compositions that include this component."
      slugs={parents}
      title="Used in"
    />
  );
}
