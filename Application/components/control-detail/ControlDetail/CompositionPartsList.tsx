"use client";

import Link from "next/link";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import { getComponentIcon } from "@/lib/controls/componentIcons";
import { getControl } from "@/lib/controls/registry";
import { componentPath } from "@/lib/controls/routes";
import type { ControlSlug } from "@/lib/controls/types";
import styles from "./CompositionPartsList.module.css";

type CompositionLinksPanelProps = {
  hint?: string;
  slugs: ControlSlug[];
  title: string;
};

export function CompositionLinksPanel({ hint, slugs, title }: CompositionLinksPanelProps) {
  const entries = slugs
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
          <li key={control.slug}>
            <Link className={styles.link} href={componentPath(control.slug)}>
              <ComponentIcon compact icon={getComponentIcon(control.slug)} />
              <span className={styles.label}>{control.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CompositionPartsList({ parts }: { parts: ControlSlug[] }) {
  return (
    <CompositionLinksPanel
      hint="Open a sub-component to view its docs and settings."
      slugs={parts}
      title="Built from"
    />
  );
}

export function CompositionUsageList({ parents }: { parents: ControlSlug[] }) {
  return (
    <CompositionLinksPanel
      hint="Parent compositions that include this component."
      slugs={parents}
      title="Used in"
    />
  );
}
