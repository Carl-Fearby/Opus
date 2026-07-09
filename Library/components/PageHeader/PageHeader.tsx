import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

export type PageHeaderProps = {
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageHeader({ actions, breadcrumbs, description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className={styles.root}>
      {breadcrumbs ? <div className={styles.breadcrumbs}>{breadcrumbs}</div> : null}
      <div className={styles.row}>
        <div className={styles.copy}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </header>
  );
}
