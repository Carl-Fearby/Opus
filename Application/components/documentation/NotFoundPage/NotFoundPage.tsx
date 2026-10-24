"use client";

import { ComponentsDocsShell } from "@/components/development/ComponentsShell";
import {
  ComponentsThemeProvider,
  useSetComponentsPageHeader,
} from "@/components/development/ComponentsThemeProvider";
import { ErrorPage } from "@/components/documentation/ErrorPage";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function NotFoundContent() {
  const { t } = useLocale();
  useSetComponentsPageHeader(
    t("docs.error.pageNotFound.title"),
    t("docs.error.pageNotFound.header"),
  );

  return (
    <ErrorPage
      code="404"
      description={t("docs.error.pageNotFound.description")}
      title={t("docs.error.pageNotFound.title")}
      titleId="not-found-title"
    />
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

export function NotFoundPageContent() {
  const { t } = useLocale();
  return (
    <ErrorPage
      code="404"
      description={t("docs.error.pageNotFound.description")}
      title={t("docs.error.pageNotFound.title")}
      titleId="not-found-title"
    />
  );
}
