import type { BreadcrumbItem } from "opus-react";
import { categoryMessageKey, DEFAULT_LOCALE, translate, type Locale } from "@/lib/i18n";
import { localizeComponentTitle } from "@/lib/i18n/componentTitles";
import { localizeNavigationGroup } from "@/lib/i18n/navigationGroupLabels";
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
  locale?: Locale;
};

function crumb(id: string, label: string, href?: string): BreadcrumbItem {
  return { id, label, href };
}

function categoryLabel(category: keyof typeof CATEGORY_PATHS, locale: Locale) {
  return translate(locale, categoryMessageKey(category));
}

export function buildDocumentationBreadcrumbs(
  pathname: string,
  options: BuildDocumentationBreadcrumbsOptions = {},
): BreadcrumbItem[] {
  const locale = options.locale ?? DEFAULT_LOCALE;
  if (pathname === "/") {
    return [crumb("current", "Opus")];
  }

  const items: BreadcrumbItem[] = [
    crumb("home", "Opus", "/"),
    crumb("documentation", translate(locale, "docs.nav.aria"), DOCUMENTATION_BASE_PATH),
  ];

  if (pathname === DOCUMENTATION_BASE_PATH) {
    items.push(crumb("current", options.currentLabel ?? translate(locale, "docs.nav.home")));
    return items;
  }

  if (pathname === GUIDE_BASE_PATH || pathname.startsWith(`${GUIDE_BASE_PATH}/`)) {
    items.push(crumb("guide", translate(locale, "docs.nav.guide"), GUIDE_BASE_PATH));

    if (pathname === GUIDE_BASE_PATH) {
      items.push(crumb("current", options.currentLabel ?? translate(locale, "docs.overview")));
      return items;
    }

    const page = options.guidePages?.find(
      (entry) => guidePath(entry.slug === "index" ? undefined : entry.slug) === pathname,
    );

    items.push(crumb("current", options.currentLabel ?? page?.title ?? translate(locale, "docs.nav.guide")));
    return items;
  }

  if (pathname === VERSION_BASE_PATH) {
    items.push(crumb("current", options.currentLabel ?? translate(locale, "docs.nav.version")));
    return items;
  }

  if (pathname === SECURITY_BASE_PATH) {
    items.push(crumb("current", options.currentLabel ?? translate(locale, "docs.nav.security")));
    return items;
  }

  if (pathname.startsWith(COMPONENTS_BASE_PATH)) {
    items.push(crumb("components", translate(locale, "docs.nav.components"), COMPONENTS_BASE_PATH));

    const overviewCategory = getCategoryFromPath(pathname);
    if (overviewCategory) {
      items.push(crumb("current", options.currentLabel ?? categoryLabel(overviewCategory, locale)));
      return items;
    }

    const subgroup = getCategorySubgroupFromPath(pathname);
    if (subgroup) {
      const groupLabel =
        getNavigationGroupBySlug(subgroup.category, subgroup.groupSlug) ?? subgroup.groupSlug;
      items.push(
        crumb(subgroup.category, categoryLabel(subgroup.category, locale), CATEGORY_PATHS[subgroup.category]),
      );
      items.push(crumb("current", options.currentLabel ?? localizeNavigationGroup(locale, groupLabel)));
      return items;
    }

    if (pathname === COMPONENTS_BASE_PATH) {
      items.push(crumb("current", options.currentLabel ?? translate(locale, "docs.overview")));
      return items;
    }

    const relativePath = pathname.slice(COMPONENTS_BASE_PATH.length + 1);

    if (relativePath.startsWith("raw/")) {
      const slug = relativePath.slice("raw/".length);
      const control = getControl(slug);
      if (control) {
        items.push(
          crumb(control.category, categoryLabel(control.category, locale), CATEGORY_PATHS[control.category]),
        );
        if (control.navigationGroup) {
          items.push(
            crumb(
              `group-${control.category}-${navigationGroupToSlug(control.navigationGroup)}`,
              localizeNavigationGroup(locale, control.navigationGroup),
              categorySubgroupPath(control.category, control.navigationGroup),
            ),
          );
        }
      }
      items.push(crumb("current", options.currentLabel ?? `${localizeComponentTitle(locale, control?.slug ?? slug, control?.title ?? slug)} (raw)`));
      return items;
    }

    if (relativePath && !relativePath.includes("/")) {
      const control = getControl(relativePath);
      if (control) {
        items.push(
          crumb(control.category, categoryLabel(control.category, locale), CATEGORY_PATHS[control.category]),
        );
        if (control.navigationGroup) {
          items.push(
            crumb(
              `group-${control.category}-${navigationGroupToSlug(control.navigationGroup)}`,
              localizeNavigationGroup(locale, control.navigationGroup),
              categorySubgroupPath(control.category, control.navigationGroup),
            ),
          );
        }
        items.push(crumb("current", options.currentLabel ?? localizeComponentTitle(locale, control.slug, control.title)));
        return items;
      }
    }

    items.push(crumb("current", options.currentLabel ?? translate(locale, "docs.page")));
    return items;
  }

  items.push(crumb("current", options.currentLabel ?? translate(locale, "docs.page")));
  return items;
}
