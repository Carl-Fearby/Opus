import type { DropdownMenuItemData } from "opus-react";
import {
  defaultTopNavigationBarMenus,
  type TopNavigationBarMenu,
  type TopNavigationDropdownMenu,
  type TopNavigationMegaMenu,
} from "opus-react";
import { formatMegaMenuMenusForUsage } from "./megaMenuDemo";

export const topNavigationDemoMenus: TopNavigationBarMenu[] = defaultTopNavigationBarMenus;

function quote(value: string): string {
  return JSON.stringify(value);
}

function withShortcutPreference(
  items: DropdownMenuItemData[],
  showShortcuts: boolean,
): DropdownMenuItemData[] {
  if (showShortcuts) {
    return items;
  }

  return items.map((item) => {
    const itemWithoutShortcut: DropdownMenuItemData = { ...item };
    delete itemWithoutShortcut.shortcut;
    return itemWithoutShortcut;
  });
}

function formatDropdownMenuItemsForUsage(
  items: DropdownMenuItemData[],
  options: { showShortcuts?: boolean } = {},
): string {
  const showShortcuts = options.showShortcuts ?? true;
  const resolvedItems = withShortcutPreference(items, showShortcuts);
  const indent = "      ";

  return resolvedItems
    .map((item) => {
      const parts = [
        `${indent}{`,
        `${indent}  id: ${quote(item.id)},`,
        `${indent}  label: ${quote(item.label)},`,
      ];

      if (item.shortcut) {
        parts.push(`${indent}  shortcut: ${quote(item.shortcut)},`);
      }

      parts.push(`${indent}}`);

      return parts.join("\n");
    })
    .join(",\n");
}

function formatDropdownMenuForUsage(
  menu: TopNavigationDropdownMenu,
  options: { showShortcuts?: boolean } = {},
): string {
  const indent = "  ";

  return [
    `${indent}{`,
    `${indent}  type: "dropdown",`,
    `${indent}  id: ${quote(menu.id)},`,
    `${indent}  label: ${quote(menu.label)},`,
    `${indent}  items: [`,
    formatDropdownMenuItemsForUsage(menu.items, options),
    `${indent}  ],`,
    `${indent}}`,
  ].join("\n");
}

function formatMegaMenuForUsage(menu: TopNavigationMegaMenu): string {
  const indent = "  ";
  const body = formatMegaMenuMenusForUsage([
    {
      id: menu.id,
      label: menu.label,
      featured: menu.featured,
      sections: menu.sections,
    },
  ]);
  const innerLines = body
    .split("\n")
    .slice(1, -1)
    .map((line) => `${indent}${line}`);

  return [`${indent}{`, `${indent}  type: "mega",`, ...innerLines, `${indent}}`].join("\n");
}

export function formatTopNavigationMenusForUsage(
  menus: TopNavigationBarMenu[],
  options: { showShortcuts?: boolean } = {},
): string {
  return menus
    .map((menu) =>
      menu.type === "dropdown"
        ? formatDropdownMenuForUsage(menu, options)
        : formatMegaMenuForUsage(menu),
    )
    .join(",\n");
}
