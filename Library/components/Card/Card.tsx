import type { ReactNode } from "react";
import type { SurfaceDensity, SurfaceTone } from "@/components/fields/types";
import styles from "./Card.module.css";

type CardProps = {
  actions?: ReactNode;
  children: ReactNode;
  density?: SurfaceDensity;
  eyebrow?: string;
  footer?: ReactNode;
  media?: ReactNode;
  title: string;
  tone?: SurfaceTone;
};

export function Card({
  actions,
  children,
  density = "comfortable",
  eyebrow,
  footer,
  media,
  title,
  tone = "default",
}: CardProps) {
  return (
    <article className={styles.card} data-density={density} data-tone={tone}>
      {media ? <div className={styles.media}>{media}</div> : null}
      <div className={styles.body}>
        <div className={styles.heading}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
      {footer || actions ? (
        <footer className={styles.footer}>
          {footer ? <div className={styles.footerContent}>{footer}</div> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </footer>
      ) : null}
    </article>
  );
}
