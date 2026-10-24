import type { BreadcrumbItem } from "opus-react";
import { categoryMessageKey, type MessageKey } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/englishSiteMessages";
import { getControl, getNavigationGroupBySlug } from "@/lib/controls/registry";
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
  SECURITY_BASE_PATH,
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

export function buildDocumentationBreadcrumbs(
  pathname: string,
  options: BuildDocumentationBreadcrumbsOptions = {},
): BreadcrumbItem[] {
  const translate = (key: MessageKey) => en[key] ?? key;
  const navLabel = (label: string) => label;
  const titleFor = (_slug: string, fallback: string) => fallback;

  const categoryLabel = (category: keyof typeof CATEGORY_PATHS) =>
    translate(categoryMessageKey(category));

  if (pathname === "/") {
    return [crumb("current", "Opus")];
  }

  const items: BreadcrumbItem[] = [
    crumb("home", "Opus", "/"),
    crumb("documentation", translate("docs.nav.aria"), DOCUMENTATION_BASE_PATH),
  ];

  if (pathname === DOCUMENTATION_BASE_PATH) {
    items.push(crumb("current", options.currentLabel ?? translate("docs.nav.home")));
    return items;
  }

  if (pathname === GUIDE_BASE_PATH || pathname.startsWith(`${GUIDE_BASE_PATH}/`)) {
    items.push(crumb("guide", translate("docs.nav.guide"), GUIDE_BASE_PATH));

    if (pathname === GUIDE_BASE_PATH) {
      items.push(crumb("current", options.currentLabel ?? translate("docs.overview")));
      return items;
    }

    const page = options.guidePages?.find(
      (entry) => guidePath(entry.slug === "index" ? undefined : entry.slug) === pathname,
    );

    items.push(crumb("current", options.currentLabel ?? page?.title ?? translate("docs.nav.guide")));
    return items;
  }

  if (pathname === VERSION_BASE_PATH) {
    items.push(crumb("current", options.currentLabel ?? translate("docs.nav.version")));
    return items;
  }

  if (pathname === SECURITY_BASE_PATH) {
    items.push(crumb("current", options.currentLabel ?? translate("docs.nav.security")));
    return items;
  }

  if (pathname.startsWith(COMPONENTS_BASE_PATH)) {
    items.push(crumb("components", translate("docs.nav.components"), COMPONENTS_BASE_PATH));

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
      items.push(crumb("current", options.currentLabel ?? navLabel(groupLabel)));
      return items;
    }

    if (pathname === COMPONENTS_BASE_PATH) {
      items.push(crumb("current", options.currentLabel ?? translate("docs.overview")));
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
              `group-${control.category}-${navigationGroupToSlug(control.navigationGroup)}`,
              navLabel(control.navigationGroup),
              categorySubgroupPath(control.category, control.navigationGroup),
            ),
          );
        }
      }
      items.push(crumb("current", options.currentLabel ?? `${titleFor(control?.slug ?? slug, control?.title ?? slug)} (raw)`));
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
              `group-${control.category}-${navigationGroupToSlug(control.navigationGroup)}`,
              navLabel(control.navigationGroup),
              categorySubgroupPath(control.category, control.navigationGroup),
            ),
          );
        }
        items.push(crumb("current", options.currentLabel ?? titleFor(control.slug, control.title)));
        return items;
      }
    }

    items.push(crumb("current", options.currentLabel ?? translate("docs.page")));
    return items;
  }

  items.push(crumb("current", options.currentLabel ?? translate("docs.page")));
  return items;
}
