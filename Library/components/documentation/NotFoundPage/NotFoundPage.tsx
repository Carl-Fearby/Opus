"use client";

import { ComponentsDocsShell } from "@/components/development/ComponentsShell";
import {
  ComponentsThemeProvider,
  useSetComponentsPageHeader,
} from "@/components/development/ComponentsThemeProvider";
import { ErrorPage } from "@/components/documentation/ErrorPage";

function NotFoundContent() {
  useSetComponentsPageHeader(
    "Page not found",
    "This route is not part of the Opus documentation site.",
  );

  return (
    <ErrorPage
      code="404"
      description="The page you requested does not exist, may have moved, or the URL may be incorrect. Use the navigation to browse the component library or return to documentation home."
      title="Page not found"
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
  return (
    <ErrorPage
      code="404"
      description="The page you requested does not exist, may have moved, or the URL may be incorrect. Use the navigation to browse the component library or return to documentation home."
      title="Page not found"
      titleId="not-found-title"
    />
  );
}
