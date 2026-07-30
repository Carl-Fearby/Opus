"use client";

import { useMemo, useState } from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./TreeMenu.module.css";

export type TreeMenuNode = {
  children?: TreeMenuNode[];
  disabled?: boolean;
  icon?: string;
  id: string;
  label: string;
  meta?: string | number;
};

export type TreeMenuProps = {
  ariaLabel?: string;
  className?: string;
  defaultExpandedIds?: string[];
  defaultSelectedId?: string;
  expandedIds?: string[];
  indent?: number;
  nodes: TreeMenuNode[];
  onExpandedChange?: (expandedIds: string[], node: TreeMenuNode, expanded: boolean) => void;
  onSelect?: (node: TreeMenuNode) => void;
  selectedId?: string;
  showMeta?: boolean;
};

function TreeMenuBranch({
  depth,
  expanded,
  indent,
  node,
  onSelect,
  onToggle,
  selectedId,
  showMeta,
}: {
  depth: number;
  expanded: Set<string>;
  indent: number;
  node: TreeMenuNode;
  onSelect: (node: TreeMenuNode) => void;
  onToggle: (node: TreeMenuNode) => void;
  selectedId?: string;
  showMeta: boolean;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = hasChildren && expanded.has(node.id);
  const selected = selectedId === node.id;

  return (
    <li
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={selected}
      className={styles.node}
      role="treeitem"
    >
      <div className={styles.row} data-selected={selected ? "true" : undefined}>
        <button
          aria-label={hasChildren ? `${isExpanded ? "Collapse" : "Expand"} ${node.label}` : undefined}
          className={styles.toggle}
          disabled={!hasChildren || node.disabled}
          onClick={() => onToggle(node)}
          style={{ marginLeft: depth * indent }}
          tabIndex={hasChildren ? 0 : -1}
          type="button"
        >
          {hasChildren ? <CatalogIcon iconName={isExpanded ? "chevron-down" : "chevron-right"} /> : null}
        </button>
        <button
          className={styles.item}
          disabled={node.disabled}
          onClick={() => onSelect(node)}
          type="button"
        >
          <span aria-hidden="true" className={styles.icon}>
            <CatalogIcon iconName={node.icon ?? (hasChildren ? isExpanded ? "folder-open" : "folder" : "file")} />
          </span>
          <span className={styles.label}>{node.label}</span>
          {showMeta && node.meta !== undefined ? <span className={styles.meta}>{node.meta}</span> : null}
        </button>
      </div>
      {hasChildren && isExpanded ? (
        <ul className={styles.children} role="group">
          {node.children!.map((child) => (
            <TreeMenuBranch
              depth={depth + 1}
              expanded={expanded}
              indent={indent}
              key={child.id}
              node={child}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedId={selectedId}
              showMeta={showMeta}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function TreeMenu({
  ariaLabel = "Tree menu",
  className,
  defaultExpandedIds = [],
  defaultSelectedId,
  expandedIds,
  indent = 16,
  nodes,
  onExpandedChange,
  onSelect,
  selectedId,
  showMeta = true,
}: TreeMenuProps) {
  const [internalExpanded, setInternalExpanded] = useState(() => new Set(defaultExpandedIds));
  const [internalSelectedId, setInternalSelectedId] = useState(defaultSelectedId);
  const expanded = useMemo(
    () => expandedIds === undefined ? internalExpanded : new Set(expandedIds),
    [expandedIds, internalExpanded],
  );
  const activeId = selectedId ?? internalSelectedId;

  const selectNode = (node: TreeMenuNode) => {
    if (selectedId === undefined) {
      setInternalSelectedId(node.id);
    }
    onSelect?.(node);
  };

  const toggleNode = (node: TreeMenuNode) => {
    if (!node.children?.length) return;
    const next = new Set(expanded);
    const willExpand = !next.has(node.id);
    if (willExpand) next.add(node.id);
    else next.delete(node.id);
    if (expandedIds === undefined) {
      setInternalExpanded(next);
    }
    onExpandedChange?.([...next], node, willExpand);
  };

  return (
    <ul
      aria-label={ariaLabel}
      className={[styles.tree, className].filter(Boolean).join(" ")}
      role="tree"
    >
      {nodes.map((node) => (
        <TreeMenuBranch
          depth={0}
          expanded={expanded}
          indent={Math.max(8, indent)}
          key={node.id}
          node={node}
          onSelect={selectNode}
          onToggle={toggleNode}
          selectedId={activeId}
          showMeta={showMeta}
        />
      ))}
    </ul>
  );
}
