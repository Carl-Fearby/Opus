"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./TreeTable.module.css";

export type TreeTableNode<T = unknown> = {
  children?: TreeTableNode<T>[];
  data?: T;
  disabled?: boolean;
  id: string;
  label: ReactNode;
};

export type TreeTableColumnRenderContext<T = unknown> = {
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
  node: TreeTableNode<T>;
  toggle: () => void;
};

export type TreeTableColumn<T = unknown> = {
  align?: "center" | "left" | "right";
  header: ReactNode;
  id: string;
  render: (node: TreeTableNode<T>, context: TreeTableColumnRenderContext<T>) => ReactNode;
  /** Renders the disclosure control next to this column's content. Defaults to the first column. */
  tree?: boolean;
  width?: string;
};

export type TreeTableDensity = "compact" | "comfortable" | "standard";

export type TreeTableProps<T = unknown> = {
  ariaLabel: string;
  caption?: ReactNode;
  className?: string;
  columns: TreeTableColumn<T>[];
  /** Initial expansion for uncontrolled usage. */
  defaultExpandedIds?: string[];
  density?: TreeTableDensity;
  /** Controlled expansion. Pair with `onExpandedChange`. */
  expandedIds?: string[];
  emptyMessage?: ReactNode;
  onExpandedChange?: (ids: string[]) => void;
  onRowClick?: (node: TreeTableNode<T>) => void;
  nodes: TreeTableNode<T>[];
  stickyHeader?: boolean;
};

type FlatRow<T> = {
  depth: number;
  hasChildren: boolean;
  node: TreeTableNode<T>;
};

function flattenNodes<T>(nodes: TreeTableNode<T>[], expanded: Set<string>, depth = 0, output: FlatRow<T>[] = []) {
  for (const node of nodes) {
    const hasChildren = Boolean(node.children?.length);
    output.push({ depth, hasChildren, node });

    if (hasChildren && expanded.has(node.id)) {
      flattenNodes(node.children!, expanded, depth + 1, output);
    }
  }

  return output;
}

function collectIds<T>(nodes: TreeTableNode<T>[], output: string[] = []) {
  for (const node of nodes) {
    output.push(node.id);
    if (node.children?.length) collectIds(node.children, output);
  }

  return output;
}

export function TreeTable<T = unknown>({
  ariaLabel,
  caption,
  className,
  columns,
  defaultExpandedIds = [],
  density = "standard",
  emptyMessage = "No rows to display.",
  expandedIds,
  nodes,
  onExpandedChange,
  onRowClick,
  stickyHeader = false,
}: TreeTableProps<T>) {
  const { t } = useOpusI18n();
  const controlled = expandedIds !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(() => new Set(defaultExpandedIds));
  const expanded = useMemo(
    () => (controlled ? new Set(expandedIds) : internalExpanded),
    [controlled, expandedIds, internalExpanded],
  );
  const rows = useMemo(() => flattenNodes(nodes, expanded), [expanded, nodes]);
  const treeColumnId = columns.find((column) => column.tree)?.id ?? columns[0]?.id;
  const allIds = useMemo(() => collectIds(nodes), [nodes]);
  const hasNestedNodes = useMemo(() => nodes.some((node) => Boolean(node.children?.length)) || allIds.length > nodes.length, [allIds.length, nodes]);
  const allExpanded = allIds.length > 0 && allIds.every((id) => expanded.has(id));

  function setExpansion(next: Set<string>) {
    if (!controlled) setInternalExpanded(next);
    onExpandedChange?.(Array.from(next));
  }

  function toggle(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpansion(next);
  }

  function toggleAll() {
    setExpansion(allExpanded ? new Set() : new Set(allIds));
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-density={density}>
      <div className={styles.scroller} data-sticky={stickyHeader || undefined}>
        <table aria-label={ariaLabel} className={styles.table} role="treegrid">
          {caption ? <caption className={styles.caption}>{caption}</caption> : null}
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  className={styles.heading}
                  data-align={column.align}
                  key={column.id}
                  scope="col"
                  style={column.width ? ({ width: column.width } as CSSProperties) : undefined}
                >
                  {index === 0 ? (
                    <span className={styles.headingContent}>
                      {hasNestedNodes ? (
                        <button
                          aria-label={allExpanded ? "Collapse all rows" : "Expand all rows"}
                          className={styles.expandAll}
                          onClick={toggleAll}
                          type="button"
                        >
                          <span
                            aria-hidden="true"
                            className={styles.chevron}
                            data-expanded={allExpanded || undefined}
                          />
                        </button>
                      ) : null}
                      {column.header}
                    </span>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map(({ depth, hasChildren, node }) => {
                const isExpanded = expanded.has(node.id);
                return (
                  <tr
                    aria-expanded={hasChildren ? isExpanded : undefined}
                    aria-level={depth + 1}
                    className={styles.row}
                    data-clickable={onRowClick && !node.disabled ? "true" : undefined}
                    data-disabled={node.disabled || undefined}
                    data-parent={depth > 0 || undefined}
                    key={node.id}
                    onClick={
                      onRowClick && !node.disabled
                        ? () => onRowClick(node)
                        : undefined
                    }
                    onKeyDown={
                      onRowClick && !node.disabled
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(node);
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick && !node.disabled ? 0 : undefined}
                  >
                    {columns.map((column) => {
                      const isTreeColumn = column.id === treeColumnId;
                      return (
                        <td
                          className={styles.cell}
                          data-align={column.align}
                          data-tree={isTreeColumn || undefined}
                          key={column.id}
                        >
                          {isTreeColumn ? (
                            <span
                              className={styles.treeCell}
                              style={{ "--tree-depth": depth } as CSSProperties}
                            >
                              {hasChildren ? (
                                <button
                                  aria-expanded={isExpanded}
                                  aria-label={`${
                                    isExpanded
                                      ? t("common.collapse", "Collapse")
                                      : t("common.expand", "Expand")
                                  } ${
                                    typeof node.label === "string" ? node.label : node.id
                                  }`}
                                  className={styles.toggle}
                                  disabled={node.disabled}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggle(node.id);
                                  }}
                                  type="button"
                                >
                                  <span
                                    aria-hidden="true"
                                    className={styles.chevron}
                                    data-expanded={isExpanded || undefined}
                                  />
                                </button>
                              ) : (
                                <span aria-hidden="true" className={styles.toggleSpacer} />
                              )}
                              <span className={styles.label}>{node.label}</span>
                            </span>
                          ) : (
                            column.render(node, {
                              depth,
                              expanded: isExpanded,
                              hasChildren,
                              node,
                              toggle: () => toggle(node.id),
                            })
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
