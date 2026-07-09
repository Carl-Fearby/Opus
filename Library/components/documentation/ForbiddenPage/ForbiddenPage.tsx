"use client";

import { ComponentsDocsShell } from "@/components/development/ComponentsShell";
import {
  ComponentsThemeProvider,
  useSetComponentsPageHeader,
} from "@/components/development/ComponentsThemeProvider";
import { ErrorPage } from "@/components/documentation/ErrorPage";

function ForbiddenContent() {
  useSetComponentsPageHeader(
    "Access denied",
    "You do not have permission to view this page.",
  );

  return (
    <ErrorPage
      code="403"
      description="You do not have permission to view this page. If you believe this is a mistake, contact your administrator or sign in with a different account."
      title="Access denied"
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
  return (
    <ErrorPage
      code="403"
      description="You do not have permission to view this page. If you believe this is a mistake, contact your administrator or sign in with a different account."
      title="Access denied"
      titleId="forbidden-title"
    />
  );
}
