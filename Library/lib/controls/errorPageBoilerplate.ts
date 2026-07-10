const notFoundDescription =
  "The page you requested does not exist, may have moved, or the URL may be incorrect. Use the navigation to browse the component library or return to documentation home.";

const forbiddenDescription =
  "You do not have permission to view this page. If you believe this is a mistake, contact your administrator or sign in with a different account.";

export function generate404PlaygroundCode(): string {
  return `"use client";

import { ErrorPage } from "@/components/documentation/ErrorPage";

export default function Example() {
  return (
    <ErrorPage
      code="404"
      description=${JSON.stringify(notFoundDescription)}
      title="Page not found"
      titleId="not-found-title"
    />
  );
}`;
}

export function generate403PlaygroundCode(): string {
  return `"use client";

import { ErrorPage } from "@/components/documentation/ErrorPage";

export default function Example() {
  return (
    <ErrorPage
      code="403"
      description=${JSON.stringify(forbiddenDescription)}
      title="Access denied"
      titleId="forbidden-title"
    />
  );
}`;
}

export function generate404PageBoilerplate(): string {
  return `// app/not-found.tsx
import { NotFoundPage } from "@/components/documentation/NotFoundPage";

export default function NotFound() {
  return <NotFoundPage />;
}`;
}

export function generate403PageBoilerplate(): string {
  return `// app/forbidden/page.tsx — or your access-denied route
import { ForbiddenPage } from "@/components/documentation/ForbiddenPage";

export default function ForbiddenRoute() {
  return <ForbiddenPage />;
}`;
}
