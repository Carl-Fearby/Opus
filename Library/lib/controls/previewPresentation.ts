import type { ControlSlug } from "./types";

const FULL_BLEED_PREVIEWS = new Set<ControlSlug>([
  "background-blobs",
  "desktop",
  "lab-desktop-environment",
  "lab-test-layout",
]);

export function isFullBleedPreview(slug?: string | null) {
  return Boolean(slug && FULL_BLEED_PREVIEWS.has(slug as ControlSlug));
}
