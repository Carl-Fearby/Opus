"use client";

import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import styles from "./ComponentsShell.module.css";

export function ComponentsPageHeader() {
  const { pageHeader } = useComponentsTheme();
  const currentLabel = pageHeader.title || undefined;

  return (
    <div className={styles.pageHeader}>
      <DocumentationBreadcrumbs currentLabel={currentLabel} />
      {pageHeader.title ? <h1>{pageHeader.title}</h1> : <h1 className={styles.visuallyHidden}>Components</h1>}
      {pageHeader.description ? <p>{pageHeader.description}</p> : null}
    </div>
  );
}
