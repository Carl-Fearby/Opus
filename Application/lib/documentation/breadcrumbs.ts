import type { BreadcrumbItem } from "opus-react";
import { componentCategories, getControl, getNavigationGroupBySlug } from "@/lib/controls/registry";
import {
  CATEGORY_PATHS,
  COMPONENTS_BASE_PATH,
  categorySubgroupPath,
  getCategoryFromPath,
  getCategorySubgroupFromPath,
  navigationGroupToSlug,
} from "@/lib/controls/routes";
import {
  DOCUMENTATION_BASE_PATH,
  GUIDE_BASE_PATH,
  VERSION_BASE_PATH,
  guidePath,
} from "@/lib/documentation/routes";

type GuidePageRef = {
  slug: string;
  title: string;
};

type BuildDocumentationBreadcrumbsOptions = {
  currentLabel?: string;
  guidePages?: GuidePageRef[];
};

function crumb(id: string, label: string, href?: string): BreadcrumbItem {
  return { id, label, href };
}

function categoryLabel(category: keyof typeof CATEGORY_PATHS) {
  return componentCategories.find((entry) => entry.id === category)?.label ?? category;
}

export function buildDocumentationBreadcrumbs(
  pathname: string,
  options: BuildDocumentationBreadcrumbsOptions = {},
): BreadcrumbItem[] {
  if (pathname === "/") {
    return [crumb("current", "Opus")];
  }

  const items: BreadcrumbItem[] = [
    crumb("home", "Opus", "/"),
    crumb("documentation", "Documentation", DOCUMENTATION_BASE_PATH),
  ];

  if (pathname === DOCUMENTATION_BASE_PATH) {
    items.push(crumb("current", options.currentLabel ?? "Home"));
    return items;
  }

  if (pathname === GUIDE_BASE_PATH || pathname.startsWith(`${GUIDE_BASE_PATH}/`)) {
    items.push(crumb("guide", "Guide", GUIDE_BASE_PATH));

    if (pathname === GUIDE_BASE_PATH) {
      items.push(crumb("current", options.currentLabel ?? "Overview"));
      return items;
    }

    const page = options.guidePages?.find(
      (entry) => guidePath(entry.slug === "index" ? undefined : entry.slug) === pathname,
    );

    items.push(crumb("current", options.currentLabel ?? page?.title ?? "Guide"));
    return items;
  }

  if (pathname === VERSION_BASE_PATH) {
    items.push(crumb("current", options.currentLabel ?? "Version"));
    return items;
  }

  if (pathname.startsWith(COMPONENTS_BASE_PATH)) {
    items.push(crumb("components", "Components", COMPONENTS_BASE_PATH));

    const overviewCategory = getCategoryFromPath(pathname);
    if (overviewCategory) {
      items.push(crumb("current", options.currentLabel ?? categoryLabel(overviewCategory)));
      return items;
    }

    const subgroup = getCategorySubgroupFromPath(pathname);
    if (subgroup) {
      const groupLabel =
        getNavigationGroupBySlug(subgroup.category, subgroup.groupSlug) ?? subgroup.groupSlug;
      items.push(
        crumb(subgroup.category, categoryLabel(subgroup.category), CATEGORY_PATHS[subgroup.category]),
      );
      items.push(crumb("current", options.currentLabel ?? groupLabel));
      return items;
    }

    if (pathname === COMPONENTS_BASE_PATH) {
      items.push(crumb("current", options.currentLabel ?? "Overview"));
      return items;
    }

    const relativePath = pathname.slice(COMPONENTS_BASE_PATH.length + 1);

    if (relativePath.startsWith("raw/")) {
      const slug = relativePath.slice("raw/".length);
      const control = getControl(slug);
      if (control) {
        items.push(
          crumb(control.category, categoryLabel(control.category), CATEGORY_PATHS[control.category]),
        );
        if (control.navigationGroup) {
          items.push(
            crumb(
              navigationGroupToSlug(control.navigationGroup),
              control.navigationGroup,
              categorySubgroupPath(control.category, control.navigationGroup),
            ),
          );
        }
      }
      items.push(crumb("current", options.currentLabel ?? `${control?.title ?? slug} (raw)`));
      return items;
    }

    if (relativePath && !relativePath.includes("/")) {
      const control = getControl(relativePath);
      if (control) {
        items.push(
          crumb(control.category, categoryLabel(control.category), CATEGORY_PATHS[control.category]),
        );
        if (control.navigationGroup) {
          items.push(
            crumb(
              navigationGroupToSlug(control.navigationGroup),
              control.navigationGroup,
              categorySubgroupPath(control.category, control.navigationGroup),
            ),
          );
        }
        items.push(crumb("current", options.currentLabel ?? control.title));
        return items;
      }
    }

    items.push(crumb("current", options.currentLabel ?? "Page"));
    return items;
  }

  items.push(crumb("current", options.currentLabel ?? "Page"));
  return items;
}
