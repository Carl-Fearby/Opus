import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

export type FontAwesomeIconCatalogEntry = {
  icon: IconDefinition;
  iconName: string;
  importName: string;
  label: string;
};

function formatIconLabel(iconName: string) {
  return iconName
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildFontAwesomeIconCatalog() {
  const seen = new Set<string>();
  const catalog: FontAwesomeIconCatalogEntry[] = [];

  for (const [importName, icon] of Object.entries(fas)) {
    if (!importName.startsWith("fa") || typeof icon !== "object" || icon === null || !("iconName" in icon)) {
      continue;
    }

    const definition = icon as IconDefinition;
    if (seen.has(definition.iconName)) {
      continue;
    }

    seen.add(definition.iconName);
    catalog.push({
      iconName: definition.iconName,
      importName,
      label: formatIconLabel(definition.iconName),
      icon: definition,
    });
  }

  return catalog.sort((left, right) => left.label.localeCompare(right.label));
}

export const fontAwesomeIconCatalog = buildFontAwesomeIconCatalog();

const iconByName = new Map(fontAwesomeIconCatalog.map((entry) => [entry.iconName, entry]));

export function getFontAwesomeIconOption(iconName: string) {
  return iconByName.get(iconName) ?? fontAwesomeIconCatalog[0];
}

export function filterFontAwesomeIcons(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return fontAwesomeIconCatalog;
  }

  return fontAwesomeIconCatalog.filter((entry) => {
    return (
      entry.label.toLowerCase().includes(normalized) ||
      entry.iconName.includes(normalized) ||
      entry.importName.toLowerCase().includes(normalized)
    );
  });
}
