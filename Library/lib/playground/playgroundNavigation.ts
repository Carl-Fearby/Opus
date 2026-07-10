import type { ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import { PLAYGROUND_BASE_PATH } from "@/lib/documentation/routes";

const PLAYGROUND_SEED_KEY = "opus-playground-seed";

export type PlaygroundSeed = {
  category?: ComponentCategory;
  settings: ControlSettings;
  slug: ControlSlug;
};

export function buildPlaygroundHref(slug: ControlSlug, category?: ComponentCategory) {
  const params = new URLSearchParams({ slug });
  if (category) {
    params.set("category", category);
  }

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
