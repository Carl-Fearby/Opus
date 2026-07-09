export type NavigationExtrasCatalogEntry = {
  componentName: string;
  description: string;
  navigationGroup: "Navigation";
  slug:
    | "breadcrumb"
    | "pagination"
    | "page-header"
    | "toolbar"
    | "bottom-navigation"
    | "navigation-rail"
    | "split-button"
    | "fab";
  sourceFiles: string[];
  title: string;
};

export const navigationExtrasCatalog = [
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    componentName: "Breadcrumb",
    navigationGroup: "Navigation",
    description: "Hierarchical trail for the current location in an information architecture.",
    sourceFiles: ["components/Breadcrumb/Breadcrumb.tsx", "components/Breadcrumb/Breadcrumb.module.css"],
  },
  {
    slug: "pagination",
    title: "Pagination",
    componentName: "Pagination",
    navigationGroup: "Navigation",
    description: "Page controls with previous/next and numbered page targets.",
    sourceFiles: ["components/Pagination/Pagination.tsx", "components/Pagination/Pagination.module.css"],
  },
  {
    slug: "page-header",
    title: "Page Header",
    componentName: "PageHeader",
    navigationGroup: "Navigation",
    description: "Page title block with optional eyebrow, description, breadcrumbs, and actions.",
    sourceFiles: ["components/PageHeader/PageHeader.tsx", "components/PageHeader/PageHeader.module.css"],
  },
  {
    slug: "toolbar",
    title: "Dock / Toolbar",
    componentName: "Toolbar",
    navigationGroup: "Navigation",
    description: "Action strip with start, centre, and end clusters for tool controls.",
    sourceFiles: ["components/Toolbar/Toolbar.tsx", "components/Toolbar/Toolbar.module.css"],
  },
  {
    slug: "bottom-navigation",
    title: "Bottom Navigation",
    componentName: "BottomNavigation",
    navigationGroup: "Navigation",
    description: "Mobile-style bottom destinations with icons and short labels.",
    sourceFiles: [
      "components/BottomNavigation/BottomNavigation.tsx",
      "components/BottomNavigation/BottomNavigation.module.css",
    ],
  },
  {
    slug: "navigation-rail",
    title: "Navigation Rail",
    componentName: "NavigationRail",
    navigationGroup: "Navigation",
    description: "Compact vertical destination rail for tablet and desktop shells.",
    sourceFiles: [
      "components/NavigationRail/NavigationRail.tsx",
      "components/NavigationRail/NavigationRail.module.css",
    ],
  },
  {
    slug: "split-button",
    title: "Split Button",
    componentName: "SplitButton",
    navigationGroup: "Navigation",
    description: "Primary action with a cascading menu of related actions.",
    sourceFiles: ["components/SplitButton/SplitButton.tsx", "components/SplitButton/SplitButton.module.css"],
  },
  {
    slug: "fab",
    title: "FAB",
    componentName: "FloatingActionButton",
    navigationGroup: "Navigation",
    description: "Floating action button for a single prominent create or primary action.",
    sourceFiles: [
      "components/FloatingActionButton/FloatingActionButton.tsx",
      "components/FloatingActionButton/FloatingActionButton.module.css",
    ],
  },
] as const satisfies readonly NavigationExtrasCatalogEntry[];

export type NavigationExtrasControlSlug = (typeof navigationExtrasCatalog)[number]["slug"];

export function isNavigationExtrasSlug(slug: string): slug is NavigationExtrasControlSlug {
  return navigationExtrasCatalog.some((entry) => entry.slug === slug);
}
