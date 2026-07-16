"use client";

import { useMemo, useState } from "react";
import styles from "./TreeView.module.css";

export type TreeViewNode = {
  children?: TreeViewNode[];
  id: string;
  label: string;
};

type TreeViewProps = {
  defaultExpandedIds?: string[];
  nodes: TreeViewNode[];
};

function collectExpandableIds(nodes: TreeViewNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.children?.length) {
      ids.push(node.id);
      ids.push(...collectExpandableIds(node.children));
    }
  }
  return ids;
}

function TreeNode({
  depth,
  expandedIds,
  node,
  onToggle,
}: {
  depth: number;
  expandedIds: Set<string>;
  node: TreeViewNode;
  onToggle: (id: string) => void;
}) {
  const hasChildren = Boolean(node.children?.length);
  const expanded = expandedIds.has(node.id);

  return (
    <li className={styles.node}>
      <div className={styles.row} style={{ paddingLeft: `${depth * 16 + 8}px` }}>
        {hasChildren ? (
          <button
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${node.label}`}
            className={styles.toggle}
            onClick={() => onToggle(node.id)}
            type="button"
          >
            <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
          </button>
        ) : (
          <span aria-hidden="true" className={styles.leafMark} />
        )}
        <span className={styles.label}>{node.label}</span>
      </div>
      {hasChildren && expanded ? (
        <ul className={styles.children}>
          {node.children!.map((child) => (
            <TreeNode
              depth={depth + 1}
              expandedIds={expandedIds}
              key={child.id}
              node={child}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function TreeView({ defaultExpandedIds, nodes }: TreeViewProps) {
  const fallbackIds = useMemo(() => collectExpandableIds(nodes).slice(0, 2), [nodes]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds ?? fallbackIds),
  );

  function toggle(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <ul aria-label="Tree" className={styles.tree}>
      {nodes.map((node) => (
        <TreeNode
          depth={0}
          expandedIds={expandedIds}
          key={node.id}
          node={node}
          onToggle={toggle}
        />
      ))}
    </ul>
  );
}
