"use client";

import Link from "next/link";
import { COMPONENTS_BASE_PATH, DOCUMENTATION_BASE_PATH } from "@/lib/documentation/routes";
import { useLocale } from "@/lib/i18n/LocaleProvider";
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

export function ErrorPage({
  code,
  title,
  titleId,
  description,
  actions,
}: ErrorPageProps) {
  const { t } = useLocale();
  const pageActions: ErrorPageAction[] = actions ?? [
    { href: DOCUMENTATION_BASE_PATH, label: t("docs.error.documentationHome"), variant: "primary" },
    { href: COMPONENTS_BASE_PATH, label: t("docs.error.browseComponents"), variant: "secondary" },
  ];

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
          {pageActions.map((action) => (
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
