import type { ReactNode } from "react";
import type { SurfaceDensity, SurfaceTone } from "@/components/fields/types";
import styles from "./Panel.module.css";

type PanelProps = {
  actions?: ReactNode;
  children: ReactNode;
  density?: SurfaceDensity;
  description?: string;
  divided?: boolean;
  footer?: ReactNode;
  title: string;
  tone?: SurfaceTone;
};

export function Panel({
  actions,
  children,
  density = "comfortable",
  description,
  divided = true,
  footer,
  title,
  tone = "default",
}: PanelProps) {
  return (
    <section className={styles.panel} data-density={density} data-divided={divided} data-tone={tone}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{title}</h2>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.headerActions}>{actions}</div> : null}
      </header>
      <div className={styles.body}>{children}</div>
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </section>
  );
}
