"use client";

import { useId, type ReactNode } from "react";
import type { EmptyStateIcon, SurfaceDensity } from "@/components/fields/types";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  actions?: ReactNode;
  description?: string;
  density?: SurfaceDensity;
  icon?: EmptyStateIcon | false;
  title: string;
};

function EmptyStateGlyph({ icon }: { icon: EmptyStateIcon }) {
  if (icon === "search") {
    return (
      <svg aria-hidden="true" className={styles.iconSvg} viewBox="0 0 24 24">
        <circle cx="11" cy="11" fill="none" r="6.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M16 16 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
      </svg>
    );
  }

  if (icon === "folder") {
    return (
      <svg aria-hidden="true" className={styles.iconSvg} viewBox="0 0 24 24">
        <path
          d="M4.5 7.5h5l1.5 1.5H19.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 4.5 16.5V7.5Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="1.75"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={styles.iconSvg} viewBox="0 0 24 24">
      <path
        d="M5 8.5h14v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V8.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <path
        d="M5 8.5 7.5 5.5h5L14 8.5"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

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
          <EmptyStateGlyph icon={icon} />
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
