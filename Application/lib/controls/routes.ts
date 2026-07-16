import type { ComponentCategory } from "./types";
import type { ControlSettings } from "./types";
import { encodeRawSettingsParam } from "./rawSettings";
import { getControl } from "./registry";
import { COMPONENTS_BASE_PATH } from "@/lib/documentation/routes";

export { COMPONENTS_BASE_PATH };

export const CATEGORY_PATHS: Record<ComponentCategory, string> = {
  content: `${COMPONENTS_BASE_PATH}/content`,
  dashboard: `${COMPONENTS_BASE_PATH}/dashboard`,
  forms: `${COMPONENTS_BASE_PATH}/forms`,
  graphs: `${COMPONENTS_BASE_PATH}/graphs`,
  labs: `${COMPONENTS_BASE_PATH}/labs`,
  overlays: `${COMPONENTS_BASE_PATH}/overlays`,
  system: `${COMPONENTS_BASE_PATH}/system`,
};

export function componentPath(slug?: string) {
  return slug ? `${COMPONENTS_BASE_PATH}/${slug}` : COMPONENTS_BASE_PATH;
}

export function componentRawPath(slug: string, settings?: ControlSettings) {
  const path = `${COMPONENTS_BASE_PATH}/raw/${slug}`;
  if (!settings) {
    return path;
  }

  return `${path}?config=${encodeRawSettingsParam(settings)}`;
}

export function categoryPath(category: ComponentCategory) {
  return CATEGORY_PATHS[category];
}

export function navigationGroupToSlug(label: string) {
  return label
    .toLowerCase()
    .replace(/\//g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function categorySubgroupPath(category: ComponentCategory, navigationGroup: string) {
  return `${CATEGORY_PATHS[category]}/${navigationGroupToSlug(navigationGroup)}`;
}

export function getCategorySubgroupFromPath(pathname: string): {
  category: ComponentCategory;
  groupSlug: string;
} | null {
  for (const [category, basePath] of Object.entries(CATEGORY_PATHS) as [ComponentCategory, string][]) {
    if (!pathname.startsWith(`${basePath}/`)) {
      continue;
    }

    const groupSlug = pathname.slice(basePath.length + 1);
    if (groupSlug && !groupSlug.includes("/")) {
      return { category, groupSlug };
    }
  }

  return null;
}

export function getCategoryFromPath(pathname: string): ComponentCategory | null {
  if (pathname === CATEGORY_PATHS.content) {
    return "content";
  }

  if (pathname === CATEGORY_PATHS.dashboard) {
    return "dashboard";
  }

  if (pathname === CATEGORY_PATHS.forms) {
    return "forms";
  }

  if (pathname === CATEGORY_PATHS.graphs) {
    return "graphs";
  }

  if (pathname === CATEGORY_PATHS.labs) {
    return "labs";
  }

  if (pathname === CATEGORY_PATHS.system) {
    return "system";
  }

  if (pathname === CATEGORY_PATHS.overlays) {
    return "overlays";
  }

  return null;
}

export function getActiveCategoryFromPath(pathname: string): ComponentCategory | null {
  const categoryFromPath = getCategoryFromPath(pathname);
  if (categoryFromPath) {
    return categoryFromPath;
  }

  const subgroup = getCategorySubgroupFromPath(pathname);
  if (subgroup) {
    return subgroup.category;
  }

  if (!pathname.startsWith(`${COMPONENTS_BASE_PATH}/`)) {
    return null;
  }

  const segment = pathname.slice(COMPONENTS_BASE_PATH.length + 1);
  if (!segment || segment.includes("/")) {
    return null;
  }

  return getControl(segment)?.category ?? null;
}
