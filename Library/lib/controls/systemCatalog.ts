export type SystemCatalogEntry = {
  componentName: string;
  description: string;
  settingsType: "403-page" | "404-page";
  slug: string;
  sourceFiles: string[];
  title: string;
};

export const systemCatalog = [
  {
    slug: "404-page",
    title: "404 Page",
    componentName: "NotFoundPage",
    description:
      "Full-page not-found state with status code, guidance copy, and navigation actions back to documentation.",
    settingsType: "404-page",
    sourceFiles: [
      "components/documentation/ErrorPage/ErrorPage.tsx",
      "components/documentation/ErrorPage/ErrorPage.module.css",
      "components/documentation/NotFoundPage/NotFoundPage.tsx",
    ],
  },
  {
    slug: "403-page",
    title: "403 Page",
    componentName: "ForbiddenPage",
    description:
      "Full-page access-denied state with status code, permission guidance, and navigation actions back to documentation.",
    settingsType: "403-page",
    sourceFiles: [
      "components/documentation/ErrorPage/ErrorPage.tsx",
      "components/documentation/ErrorPage/ErrorPage.module.css",
      "components/documentation/ForbiddenPage/ForbiddenPage.tsx",
    ],
  },
] as const satisfies readonly SystemCatalogEntry[];

export type SystemControlSlug = (typeof systemCatalog)[number]["slug"];

export const SYSTEM_SLUGS = systemCatalog.map((entry) => entry.slug);

const systemSlugSet = new Set<string>(SYSTEM_SLUGS);

export function isSystemSlug(slug: string): slug is SystemControlSlug {
  return systemSlugSet.has(slug);
}

export function getSystemCatalogEntry(slug: SystemControlSlug) {
  return systemCatalog.find((entry) => entry.slug === slug)!;
}
