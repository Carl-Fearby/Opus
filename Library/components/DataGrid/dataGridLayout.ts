import type { ReactNode } from "react";
import type { DataGridRow } from "./DataGrid";

export type DataGridLayout = "flat" | "grouped" | "tree" | "pivot";

export type DataGridDisplayRow =
  | {
      kind: "data";
      depth: number;
      expandable: boolean;
      expanded: boolean;
      hasChildren: boolean;
      row: DataGridRow;
    }
  | {
      kind: "group";
      count: number;
      expanded: boolean;
      id: string;
      label: string;
    };

function cellText(value: ReactNode): string {
  if (value === null || value === undefined || typeof value === "boolean") {
    return "";
  }

  if (typeof value === "number" || typeof value === "string") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(cellText).join(" ");
  }

  return "";
}

export function getRowCellText(row: DataGridRow, key: string): string {
  if (key === "team") {
    return cellText(row.values.team ?? row.label);
  }

  return cellText(row.values[key]);
}

export function buildGroupedDisplayRows(
  rows: DataGridRow[],
  groupBy: string,
  collapsedGroupIds: Set<string>,
): DataGridDisplayRow[] {
  const groups = new Map<string, DataGridRow[]>();

  for (const row of rows) {
    const label = getRowCellText(row, groupBy) || "Ungrouped";
    const bucket = groups.get(label) ?? [];
    bucket.push(row);
    groups.set(label, bucket);
  }

  const display: DataGridDisplayRow[] = [];

  for (const [label, groupRows] of groups) {
    const id = `group:${label}`;
    const expanded = !collapsedGroupIds.has(id);
    display.push({
      kind: "group",
      id,
      label,
      count: groupRows.length,
      expanded,
    });

    if (expanded) {
      for (const row of groupRows) {
        display.push({
          kind: "data",
          row,
          depth: 1,
          expandable: false,
          expanded: false,
          hasChildren: false,
        });
      }
    }
  }

  return display;
}

export function buildTreeDisplayRows(
  rows: DataGridRow[],
  expandedIds: Set<string>,
  depth = 0,
): DataGridDisplayRow[] {
  const display: DataGridDisplayRow[] = [];

  for (const row of rows) {
    const children = row.children ?? [];
    const hasChildren = children.length > 0;
    const expanded = hasChildren && expandedIds.has(row.id);

    display.push({
      kind: "data",
      row,
      depth,
      expandable: hasChildren,
      expanded,
      hasChildren,
    });

    if (expanded) {
      display.push(...buildTreeDisplayRows(children, expandedIds, depth + 1));
    }
  }

  return display;
}

export function buildFlatDisplayRows(rows: DataGridRow[]): DataGridDisplayRow[] {
  return rows.map((row) => ({
    kind: "data" as const,
    row,
    depth: 0,
    expandable: false,
    expanded: false,
    hasChildren: false,
  }));
}

export function collectTreeIds(rows: DataGridRow[]): string[] {
  const ids: string[] = [];

  for (const row of rows) {
    if (row.children?.length) {
      ids.push(row.id);
      ids.push(...collectTreeIds(row.children));
    }
  }

  return ids;
}

export function flattenTreeRows(rows: DataGridRow[]): DataGridRow[] {
  const flat: DataGridRow[] = [];

  for (const row of rows) {
    flat.push(row);
    if (row.children?.length) {
      flat.push(...flattenTreeRows(row.children));
    }
  }

  return flat;
}
