"use client";

import { ComponentsDocsShell } from "@/components/development/ComponentsShell";
import {
  ComponentsThemeProvider,
  useSetComponentsPageHeader,
} from "@/components/development/ComponentsThemeProvider";
import { ErrorPage } from "@/components/documentation/ErrorPage";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function ForbiddenContent() {
  const { t } = useLocale();
  useSetComponentsPageHeader(
    t("docs.error.accessDenied.title"),
    t("docs.error.accessDenied.header"),
  );

  return (
    <ErrorPage
      code="403"
      description={t("docs.error.accessDenied.description")}
      title={t("docs.error.accessDenied.title")}
      titleId="forbidden-title"
    />
  );
}

export function ForbiddenPage() {
  return (
    <ComponentsThemeProvider>
      <ComponentsDocsShell>
        <ForbiddenContent />
      </ComponentsDocsShell>
    </ComponentsThemeProvider>
  );
}

export function ForbiddenPageContent() {
  const { t } = useLocale();
  return (
    <ErrorPage
      code="403"
      description={t("docs.error.accessDenied.description")}
      title={t("docs.error.accessDenied.title")}
      titleId="forbidden-title"
    />
  );
}
