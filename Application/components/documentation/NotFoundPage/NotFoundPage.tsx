"use client";

import Link from "next/link";
import { ComponentsDocsShell } from "@/components/development/ComponentsShell";
import {
  ComponentsThemeProvider,
  useSetComponentsPageHeader,
} from "@/components/development/ComponentsThemeProvider";
import { COMPONENTS_BASE_PATH, DOCUMENTATION_BASE_PATH } from "@/lib/documentation/routes";
import styles from "./NotFoundPage.module.css";

function NotFoundContent() {
  useSetComponentsPageHeader(
    "Page not found",
    "This route is not part of the Opus documentation site.",
  );

  return (
    <section aria-labelledby="not-found-title" className={styles.frame}>
      <div className={styles.card}>
        <p aria-hidden="true" className={styles.code}>
          404
        </p>
        <h2 className={styles.title} id="not-found-title">
          Page not found
        </h2>
        <p className={styles.description}>
          The page you requested does not exist, may have moved, or the URL may be incorrect. Use the
          navigation to browse the component library or return to documentation home.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href={DOCUMENTATION_BASE_PATH}>
            Documentation home
          </Link>
          <Link className={styles.secondaryAction} href={COMPONENTS_BASE_PATH}>
            Browse components
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NotFoundPage() {
  return (
    <ComponentsThemeProvider>
      <ComponentsDocsShell>
        <NotFoundContent />
      </ComponentsDocsShell>
    </ComponentsThemeProvider>
  );
}
