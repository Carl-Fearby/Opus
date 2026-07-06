"use client";

import { useId, type ReactNode } from "react";
import type { SurfaceDensity } from "@/components/fields/types";
import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  actions?: ReactNode;
  description?: string;
  density?: SurfaceDensity;
  icon?: string | false;
  title: string;
};

export function EmptyState({
  actions,
  description,
  density = "comfortable",
  icon = "inbox",
  title,
}: EmptyStateProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = description ? `${baseId}-description` : undefined;

  return (
    <section
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={styles.root}
      data-density={density}
    >
      {icon ? (
        <div aria-hidden="true" className={styles.iconWrap}>
          <CatalogIcon iconName={icon} />
        </div>
      ) : null}
      <div className={styles.copy}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        {description ? (
          <p className={styles.description} id={descriptionId}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}
