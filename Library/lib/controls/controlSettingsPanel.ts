import type { ControlSlug } from "./types";

const SLUGS_WITHOUT_SETTINGS_PANEL = new Set<ControlSlug>(["404-page", "403-page"]);

export function controlHasSettingsPanel(slug: ControlSlug): boolean {
  return !SLUGS_WITHOUT_SETTINGS_PANEL.has(slug);
}
