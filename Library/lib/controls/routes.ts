import type { ComponentCategory } from "./types";
import type { ControlSettings } from "./types";
import { encodeRawSettingsParam } from "./rawSettings";
import { getControl } from "./registry";
import { COMPONENTS_BASE_PATH } from "@/lib/documentation/routes";

export { COMPONENTS_BASE_PATH };

export const CATEGORY_PATHS: Record<ComponentCategory, string> = {
  content: `${COMPONENTS_BASE_PATH}/content`,
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

export function getCategoryFromPath(pathname: string): ComponentCategory | null {
  if (pathname === CATEGORY_PATHS.content) {
    return "content";
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

  if (!pathname.startsWith(`${COMPONENTS_BASE_PATH}/`)) {
    return null;
  }

  const segment = pathname.slice(COMPONENTS_BASE_PATH.length + 1);
  if (!segment || segment.includes("/")) {
    return null;
  }

  return getControl(segment)?.category ?? null;
}
