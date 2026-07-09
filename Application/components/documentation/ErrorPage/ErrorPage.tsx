import Link from "next/link";
import { COMPONENTS_BASE_PATH, DOCUMENTATION_BASE_PATH } from "@/lib/documentation/routes";
import styles from "./ErrorPage.module.css";

export type ErrorPageAction = {
  href: string;
  label: string;
  variant: "primary" | "secondary";
};

export type ErrorPageProps = {
  actions?: ErrorPageAction[];
  code: string;
  description: string;
  title: string;
  titleId: string;
};

const defaultActions: ErrorPageAction[] = [
  { href: DOCUMENTATION_BASE_PATH, label: "Documentation home", variant: "primary" },
  { href: COMPONENTS_BASE_PATH, label: "Browse components", variant: "secondary" },
];

export function ErrorPage({
  code,
  title,
  titleId,
  description,
  actions = defaultActions,
}: ErrorPageProps) {
  return (
    <section aria-labelledby={titleId} className={styles.frame}>
      <div className={styles.card}>
        <p aria-hidden="true" className={styles.code}>
          {code}
        </p>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          {actions.map((action) => (
            <Link
              key={action.label}
              className={action.variant === "primary" ? styles.primaryAction : styles.secondaryAction}
              href={action.href}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
