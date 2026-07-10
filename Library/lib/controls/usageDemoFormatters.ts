import type { ControlSettingsBySlug } from "./types";
import {
  cascaderDemoOptions,
  filterSelectDemoGroups,
  multiSelectDemoOptions,
  transferListDemoAvailable,
  treeSelectDemoNodes,
} from "./advancedFormDemoData";
import {
  demoCalendarEvents,
  demoDualListItems,
  demoDualListSelected,
  demoFilterConditions,
  demoInspectorFields,
  demoKanbanCards,
  demoKanbanColumns,
  demoPermissionResources,
  demoPermissionRoles,
  demoPermissions,
  demoPropertyInspectorItems,
  demoQueryGroup,
  demoResourceItems,
  demoResources,
  demoRules,
  demoSchedulerEvents,
} from "./buildersDemoData";
import type { ContentTimelineRowStyle } from "./types";
import {
  demoAvatarGroupItems,
  demoDescriptionListItems,
  demoJsonValue,
  demoListItems,
  demoMasonryItems,
  demoPropertyItems,
  demoContentTimelineItems,
  demoContentTimelineGroups,
  demoTreeViewNodes,
} from "./contentDemoData";
import { layoutDemoTiles, layoutScrollLines } from "./layoutDemoData";
import {
  demoBottomNavItems,
  demoBreadcrumbItems,
  demoRailItems,
  demoSplitActions,
} from "./navigationExtrasDemoData";
import { demoStatTiles, demoTiles } from "./tilesDemoData";

function formatJsValue(value: unknown, indent = 0): string {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    const pad = " ".repeat(indent + 2);
    const close = " ".repeat(indent);
    return `[\n${value.map((item) => `${pad}${formatJsValue(item, indent + 2)}`).join(",\n")},\n${close}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, entry]) => entry !== undefined);
    if (entries.length === 0) {
      return "{}";
    }

    const pad = " ".repeat(indent + 2);
    const close = " ".repeat(indent);
    return `{\n${entries.map(([key, entry]) => `${pad}${key}: ${formatJsValue(entry, indent + 2)}`).join(",\n")},\n${close}}`;
  }

  return JSON.stringify(value);
}

export function formatObjectLiteral(value: unknown, indent = 2): string {
  return formatJsValue(value, indent);
}

export function formatLayoutTileChildren(count?: number): string {
  const tiles = count ? layoutDemoTiles.slice(0, count) : layoutDemoTiles;
  return tiles.map((tile) => `  <div>${tile}</div>`).join("\n");
}

export function formatScrollAreaContent(): string {
  return layoutScrollLines.map((line) => `    <div>${line}</div>`).join("\n");
}

export function formatAvatarGroupItemsForUsage() {
  return formatObjectLiteral(demoAvatarGroupItems);
}

export function formatJsonValueForUsage() {
  return formatObjectLiteral(demoJsonValue);
}

export function formatListItemsForUsage(showIcons: boolean) {
  return formatObjectLiteral(demoListItems(showIcons));
}

export function formatDescriptionListItemsForUsage() {
  return formatObjectLiteral(demoDescriptionListItems);
}

export function formatContentTimelineItemsForUsage(
  includeStatus: boolean,
  rowStyles: [ContentTimelineRowStyle, ContentTimelineRowStyle, ContentTimelineRowStyle],
  includeTags = true,
) {
  return formatObjectLiteral(demoContentTimelineItems(includeStatus, rowStyles, includeTags));
}

export function formatContentTimelineGroupsForUsage(
  includeStatus: boolean,
  rowStyles: [ContentTimelineRowStyle, ContentTimelineRowStyle, ContentTimelineRowStyle],
  includeTags = true,
) {
  return formatObjectLiteral(demoContentTimelineGroups(includeStatus, rowStyles, includeTags));
}

export function formatTreeViewNodesForUsage() {
  return formatObjectLiteral(demoTreeViewNodes);
}

export function formatMasonryItemsForUsage() {
  return formatObjectLiteral(demoMasonryItems);
}

export function formatPropertyItemsForUsage(copyable: boolean) {
  return formatObjectLiteral(demoPropertyItems(copyable));
}

export function formatBreadcrumbItemsForUsage() {
  return formatObjectLiteral(demoBreadcrumbItems);
}

export function formatBottomNavItemsForUsage() {
  return formatObjectLiteral(demoBottomNavItems);
}

export function formatRailItemsForUsage() {
  return formatObjectLiteral(demoRailItems);
}

export function formatSplitActionsForUsage() {
  return formatObjectLiteral(demoSplitActions);
}

export function formatTilesForUsage(): string {
  return `[\n${demoTiles
    .map(
      (item) =>
        `  { id: ${JSON.stringify(item.id)}, label: ${JSON.stringify(item.label)}, icon: ${JSON.stringify(item.icon)}, tone: ${JSON.stringify(item.tone)}, onClick: () => handleTile(${JSON.stringify(item.id)}) }`,
    )
    .join(",\n")},\n]`;
}

export function formatStatTilesForUsage(): string {
  return `[\n${demoStatTiles
    .map(
      (item) =>
        `  { id: ${JSON.stringify(item.id)}, label: ${JSON.stringify(item.label)}, value: ${JSON.stringify(item.value)}, icon: ${JSON.stringify(item.icon)}, tone: ${JSON.stringify(item.tone)}, trend: ${JSON.stringify(item.trend)}, trendValue: ${JSON.stringify(item.trendValue)}, comparison: ${JSON.stringify(item.comparison)}, onClick: () => handleStatTile(${JSON.stringify(item.id)}) }`,
    )
    .join(",\n")},\n]`;
}

export function formatPropertyInspectorItemsForUsage() {
  return formatObjectLiteral(demoPropertyInspectorItems());
}

export function formatFilterConditionsForUsage() {
  return formatObjectLiteral(demoFilterConditions);
}

export function formatInspectorFieldsForUsage() {
  return formatObjectLiteral(demoInspectorFields);
}

export function formatQueryGroupForUsage(combinator?: string) {
  return formatObjectLiteral(combinator ? { ...demoQueryGroup, combinator } : demoQueryGroup);
}

export function formatRulesForUsage(showDisabled: boolean) {
  return formatObjectLiteral(showDisabled ? demoRules : demoRules.filter((rule) => rule.enabled));
}

export function formatPermissionsRolesForUsage() {
  return formatObjectLiteral(demoPermissionRoles);
}

export function formatPermissionsResourcesForUsage() {
  return formatObjectLiteral(demoPermissionResources);
}

export function formatPermissionsForUsage() {
  return formatObjectLiteral(demoPermissions());
}

export function formatDualListAvailableForUsage() {
  return formatObjectLiteral(demoDualListItems);
}

export function formatDualListSelectedForUsage(selectedCount: number) {
  return formatObjectLiteral(demoDualListSelected.slice(0, selectedCount));
}

export function formatSchedulerEventsForUsage() {
  return formatObjectLiteral(demoSchedulerEvents);
}

export function formatKanbanCardsForUsage() {
  return formatObjectLiteral(demoKanbanCards);
}

export function formatKanbanColumnsForUsage() {
  return formatObjectLiteral(demoKanbanColumns);
}

export function formatCalendarEventsForUsage() {
  return formatObjectLiteral(demoCalendarEvents());
}

export function formatResourcePlannerResourcesForUsage() {
  return formatObjectLiteral(demoResources);
}

export function formatResourcePlannerItemsForUsage() {
  return formatObjectLiteral(demoResourceItems);
}

export function formatFilterSelectGroupsForUsage() {
  return formatObjectLiteral(filterSelectDemoGroups);
}

export function formatMultiSelectOptionsForUsage(options: string) {
  const parsed = options
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);

  return formatObjectLiteral(parsed.length ? parsed : multiSelectDemoOptions);
}

export function formatTransferListAvailableForUsage(available: string) {
  const parsed = available
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return formatObjectLiteral(parsed.length ? parsed : transferListDemoAvailable);
}

export function formatTreeSelectNodesForUsage() {
  return formatObjectLiteral(treeSelectDemoNodes);
}

export function formatCascaderOptionsForUsage() {
  return formatObjectLiteral(cascaderDemoOptions);
}

export function formatSegmentedControlOptionsForUsage(options: string) {
  const parsed = options
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);

  return formatObjectLiteral(parsed.length ? parsed : ["Monthly", "Quarterly", "Yearly"]);
}

export function formatDockLayoutProps(settings: ControlSettingsBySlug["dock-layout"]) {
  const props = [
    settings.showTop ? 'top="Top dock"' : "",
    settings.showBottom ? 'bottom="Bottom dock"' : "",
    settings.showLeft ? 'left="Left dock"' : "",
    settings.showRight ? 'right="Right dock"' : "",
  ].filter(Boolean);

  return props.join(" ");
}
