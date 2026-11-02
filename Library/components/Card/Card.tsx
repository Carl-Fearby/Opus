import type { ReactNode } from "react";
import type { SurfaceDensity, SurfaceTone } from "@/components/fields/types";
import styles from "./Card.module.css";

type CardProps = {
  actions?: ReactNode;
  children: ReactNode;
  density?: SurfaceDensity;
  eyebrow?: string;
  footer?: ReactNode;
  /** Makes the whole card a link, with an overlay anchor instead of nested links. */
  href?: string;
  /** Lift and highlight on hover and focus. Implied by `href`. */
  interactive?: boolean;
  /** Accessible name for the overlay link. Defaults to `title`. */
  linkLabel?: string;
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
  href,
  interactive = false,
  linkLabel,
  media,
  title,
  tone = "default",
}: CardProps) {
  return (
    <article
      className={styles.card}
      data-density={density}
      data-interactive={interactive || href ? true : undefined}
      data-linked={href ? true : undefined}
      data-tone={tone}
    >
      {href ? <a className={styles.link} href={href} aria-label={linkLabel ?? title} /> : null}
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
