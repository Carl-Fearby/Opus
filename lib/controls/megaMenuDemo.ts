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

export const megaMenuSectionTemplates: MegaMenuSection[] = [
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
      {
        id: "layout",
        label: "Layout primitives",
        description: "Sections, panels, and responsive page structure patterns.",
      },
      {
        id: "motion",
        label: "Motion",
        description: "Transitions, timing, and entrance patterns for overlays and menus.",
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
      {
        id: "data",
        label: "Data surfaces",
        description: "Tables, grids, and readable data presentation patterns.",
      },
      {
        id: "media",
        label: "Media",
        description: "Images, galleries, lightboxes, and 3D asset previews.",
      },
    ],
  },
  {
    id: "workflows",
    title: "Workflows",
    items: [
      {
        id: "settings",
        label: "Settings pages",
        description: "Grouped controls with clear save and cancel actions.",
      },
      {
        id: "confirmation",
        label: "Confirmation flows",
        description: "Dialogs and modals for safe decisions.",
      },
      {
        id: "onboarding",
        label: "Onboarding",
        description: "First-run guidance, empty states, and progressive setup.",
      },
      {
        id: "search",
        label: "Search and filter",
        description: "Command palettes, query fields, and result surfaces.",
      },
      {
        id: "notifications",
        label: "Notifications",
        description: "Toasts, alerts, and inline status messaging.",
      },
    ],
  },
  {
    id: "states",
    title: "States",
    items: [
      {
        id: "loading",
        label: "Loading",
        description: "Skeletons and progressive reveal patterns.",
      },
      {
        id: "empty",
        label: "Empty states",
        description: "Helpful zero-state messaging and actions.",
      },
      {
        id: "error",
        label: "Error handling",
        description: "Alerts, inline errors, and recovery routes.",
      },
      {
        id: "success",
        label: "Success feedback",
        description: "Confirmation messaging and post-action summaries.",
      },
      {
        id: "disabled",
        label: "Disabled states",
        description: "Unavailable actions, muted controls, and guidance copy.",
      },
    ],
  },
];

export function buildMegaMenuPreviewConfig(settings: MegaMenuSettings): MegaMenuConfig {
  const sections = megaMenuSectionTemplates.slice(0, settings.columnCount).map((section) => ({
    id: section.id,
    title: section.title,
    items: section.items.slice(0, settings.itemsPerColumn),
  }));

  const featured: MegaMenuFeatured | undefined = settings.featured
    ? {
        eyebrow: settings.featuredEyebrow,
        title: settings.featuredTitle,
        description: settings.featuredDescription,
        actionLabel: settings.featuredActionLabel || undefined,
      }
    : undefined;

  return {
    id: "resources",
    label: "Resources",
    featured,
    sections,
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
