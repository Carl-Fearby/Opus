import {
  defaultMegaMenuMenus,
  type MegaMenuConfig,
  type MegaMenuFeatured,
  type MegaMenuItem,
  type MegaMenuSection,
} from "@/components/MegaMenu";
import type { MegaMenuSettings } from "@/lib/controls/types";

const editMenu = defaultMegaMenuMenus.find((menu) => menu.id === "edit");

if (!editMenu) {
  throw new Error("Expected edit mega menu config in defaultMegaMenuMenus.");
}

export const megaMenuEditConfig: MegaMenuConfig = editMenu;

export const topNavigationMegaMenus: MegaMenuConfig[] = [megaMenuEditConfig];

export const megaMenuPreviewFeatured: MegaMenuFeatured = {
  eyebrow: "Featured",
  title: "Build faster with Opus",
  description:
    "Browse production-ready components, patterns, and implementation notes from one navigation surface.",
  actionLabel: "Explore library",
};

export const megaMenuPreviewSections: MegaMenuSection[] = [
  {
    id: "foundation",
    title: "Foundation",
    items: [
      {
        id: "tokens",
        label: "Design tokens",
        description: "Colour, radius, spacing, typography, and shared CSS variables.",
      },
      {
        id: "themes",
        label: "Theme system",
        description: "Light and dark modes with unified surface and form colours.",
      },
      {
        id: "accessibility",
        label: "Accessibility",
        description: "Keyboard, focus, aria, and contrast guidance for components.",
      },
    ],
  },
  {
    id: "systems",
    title: "Systems",
    items: [
      {
        id: "forms",
        label: "Form architecture",
        description: "Composable fields, labels, errors, and layout modes.",
      },
      {
        id: "navigation",
        label: "Navigation shells",
        description: "Sidebars, top menus, and deep navigation patterns.",
      },
      {
        id: "overlays",
        label: "Overlays",
        description: "Dialogs, drawers, popovers, and command palettes.",
      },
    ],
  },
];

export function buildMegaMenuPreviewConfig(
  settings: Pick<MegaMenuSettings, "featured">,
): MegaMenuConfig {
  return {
    id: "resources",
    label: "Resources",
    featured: settings.featured ? megaMenuPreviewFeatured : undefined,
    sections: megaMenuPreviewSections,
  };
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function formatMegaMenuItem(item: MegaMenuItem, indent: string): string {
  const lines = [
    `${indent}{`,
    `${indent}  id: ${quote(item.id)},`,
    `${indent}  label: ${quote(item.label)},`,
    `${indent}  description: ${quote(item.description ?? "")},`,
    `${indent}}`,
  ];

  return lines.join("\n");
}

function formatMegaMenuSection(section: MegaMenuSection, indent: string): string {
  const itemIndent = `${indent}  `;
  const items = section.items.map((item) => formatMegaMenuItem(item, itemIndent)).join(",\n");

  return [
    `${indent}{`,
    `${indent}  id: ${quote(section.id)},`,
    `${indent}  title: ${quote(section.title)},`,
    `${indent}  items: [`,
    items,
    `${indent}  ],`,
    `${indent}}`,
  ].join("\n");
}

function formatMegaMenuFeatured(featured: MegaMenuFeatured, indent: string): string {
  const lines = [
    `${indent}featured: {`,
    `${indent}  eyebrow: ${quote(featured.eyebrow ?? "")},`,
    `${indent}  title: ${quote(featured.title)},`,
    `${indent}  description: ${quote(featured.description)},`,
  ];

  if (featured.actionLabel) {
    lines.push(`${indent}  actionLabel: ${quote(featured.actionLabel)},`);
  }

  lines.push(`${indent}},`);

  return lines.join("\n");
}

function formatMegaMenuConfig(
  menu: MegaMenuConfig,
  options: { includeFeatured?: boolean } = {},
): string {
  const includeFeatured = options.includeFeatured ?? true;
  const indent = "  ";
  const sectionIndent = `${indent}  `;
  const sections = menu.sections
    .map((section) => formatMegaMenuSection(section, sectionIndent))
    .join(",\n");

  const lines = [
    "{",
    `${indent}id: ${quote(menu.id)},`,
    `${indent}label: ${quote(menu.label)},`,
  ];

  if (includeFeatured && menu.featured) {
    lines.push(formatMegaMenuFeatured(menu.featured, indent));
  }

  lines.push(
    `${indent}sections: [`,
    sections,
    `${indent}],`,
    "}",
  );

  return lines.join("\n");
}

export function formatMegaMenuMenusForUsage(
  menus: MegaMenuConfig[],
  options: { includeFeatured?: boolean } = {},
): string {
  return menus.map((menu) => formatMegaMenuConfig(menu, options)).join(",\n");
}
