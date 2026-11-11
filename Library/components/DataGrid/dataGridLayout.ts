import { isValidElement } from "react";
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

const MAX_CELL_TEXT_DEPTH = 8;

/** Props that render visible text without children, such as Badge's `label`. */
const CELL_TEXT_PROPS = ["label", "aria-label", "title", "alt", "count", "value"] as const;

type CellTextProps = {
  children?: ReactNode;
} & Partial<Record<(typeof CELL_TEXT_PROPS)[number], unknown>>;

/**
 * Resolves the readable text of a cell, including cells that render elements
 * such as badges, pills, or icons with a label.
 */
function cellText(value: ReactNode, depth = 0): string {
  if (depth > MAX_CELL_TEXT_DEPTH || value === null || value === undefined || typeof value === "boolean") {
    return "";
  }

  if (typeof value === "number" || typeof value === "string" || typeof value === "bigint") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => cellText(item, depth + 1)).join(" ");
  }

  if (isValidElement(value)) {
    const props = value.props as CellTextProps;
    const childText = cellText(props.children, depth + 1).trim();

    if (childText) {
      return childText;
    }

    for (const key of CELL_TEXT_PROPS) {
      const propText = cellText(props[key] as ReactNode, depth + 1).trim();

      if (propText) {
        return propText;
      }
    }
  }

  return "";
}

export function getRowCellText(row: DataGridRow, key: string): string {
  const value = key === "team" ? (row.values.team ?? row.label) : row.values[key];
  return cellText(value).replace(/\s+/g, " ").trim();
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
