"use client";

import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./ComponentsShell.module.css";

export function ComponentsPageHeader() {
  const { t } = useLocale();
  const { pageHeader } = useComponentsTheme();
  const currentLabel = pageHeader.title || undefined;

  return (
    <div className={styles.pageHeader} data-opus-tour="component-heading">
      <DocumentationBreadcrumbs currentLabel={currentLabel} />
      {pageHeader.title ? <h1>{pageHeader.title}</h1> : <h1 className={styles.visuallyHidden}>{t("docs.components.hiddenTitle")}</h1>}
      {pageHeader.description ? <p>{pageHeader.description}</p> : null}
    </div>
  );
}
