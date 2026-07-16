import type { ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import { COMPONENTS_BASE_PATH, PLAYGROUND_BASE_PATH } from "@/lib/documentation/routes";

const PLAYGROUND_SEED_KEY = "opus-playground-seed";

const CATEGORY_OVERVIEW_PATHS = new Set([
  `${COMPONENTS_BASE_PATH}/content`,
  `${COMPONENTS_BASE_PATH}/forms`,
  `${COMPONENTS_BASE_PATH}/graphs`,
  `${COMPONENTS_BASE_PATH}/labs`,
  `${COMPONENTS_BASE_PATH}/overlays`,
  `${COMPONENTS_BASE_PATH}/system`,
]);

export type PlaygroundSeed = {
  category?: ComponentCategory;
  settings: ControlSettings;
  slug: ControlSlug;
};

export function resolvePlaygroundContextFromLocation(
  pathname: string,
  _categoryParam?: string | null,
): Pick<PlaygroundSeed, "category" | "slug"> | null {
  void _categoryParam;
  if (!pathname.startsWith(`${COMPONENTS_BASE_PATH}/`)) {
    return null;
  }

  const segment = pathname.slice(COMPONENTS_BASE_PATH.length + 1).split("/")[0];
  if (!segment || segment === "raw" || CATEGORY_OVERVIEW_PATHS.has(pathname)) {
    return null;
  }

  return { slug: segment as ControlSlug };
}

export function resolvePlaygroundHrefFromLocation(pathname: string, categoryParam?: string | null) {
  const context = resolvePlaygroundContextFromLocation(pathname, categoryParam);
  if (context) {
    return buildPlaygroundHref(context.slug, context.category);
  }

  return PLAYGROUND_BASE_PATH;
}

export function resolvePlaygroundHref(pathname: string, categoryParam?: string | null) {
  const hrefFromLocation = resolvePlaygroundHrefFromLocation(pathname, categoryParam);
  if (hrefFromLocation !== PLAYGROUND_BASE_PATH) {
    return hrefFromLocation;
  }

  const seed = readPlaygroundSeed();
  if (seed) {
    return buildPlaygroundHref(seed.slug, seed.category);
  }

  return PLAYGROUND_BASE_PATH;
}

export function buildComponentHref(slug: ControlSlug, category?: ComponentCategory) {
  void category;
  return `${COMPONENTS_BASE_PATH}/${slug}`;
}

export function resolveComponentsHrefFromLocation(pathname: string, categoryParam?: string | null) {
  const context = resolvePlaygroundContextFromLocation(pathname, categoryParam);
  if (context) {
    return buildComponentHref(context.slug, context.category);
  }

  return COMPONENTS_BASE_PATH;
}

export function resolveComponentsHref(pathname: string, categoryParam?: string | null) {
  const hrefFromLocation = resolveComponentsHrefFromLocation(pathname, categoryParam);
  if (hrefFromLocation !== COMPONENTS_BASE_PATH) {
    return hrefFromLocation;
  }

  const seed = readPlaygroundSeed();
  if (seed) {
    return buildComponentHref(seed.slug, seed.category);
  }

  return COMPONENTS_BASE_PATH;
}

export function buildPlaygroundHref(slug: ControlSlug, category?: ComponentCategory) {
  void category;
  const params = new URLSearchParams({ slug });

  return `${PLAYGROUND_BASE_PATH}?${params.toString()}`;
}

export function storePlaygroundSeed(seed: PlaygroundSeed) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(PLAYGROUND_SEED_KEY, JSON.stringify(seed));
}

export function readPlaygroundSeed(): PlaygroundSeed | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(PLAYGROUND_SEED_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as PlaygroundSeed;
  } catch {
    return null;
  }
}

export function clearPlaygroundSeed() {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(PLAYGROUND_SEED_KEY);
}
