"use client";

import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./ComponentsShell.module.css";

export function ComponentsPageHeader() {
  const { pageHeader } = useComponentsTheme();

  if (!pageHeader.title) {
    return null;
  }

  return (
    <div className={styles.pageHeader}>
      <h1>{pageHeader.title}</h1>
      {pageHeader.description ? <p>{pageHeader.description}</p> : null}
    </div>
  );
}
