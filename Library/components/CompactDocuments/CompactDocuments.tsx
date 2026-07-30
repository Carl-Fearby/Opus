"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { CatalogIcon } from "@/components/CatalogIcon";
import { TextField } from "@/components/fields/TextField";
import styles from "./CompactDocuments.module.css";

export type CompactDocumentView = "list" | "grid" | "columns";

export type CompactDocumentNode = {
  children?: CompactDocumentNode[];
  id: string;
  kind: "folder" | "file";
  meta?: string;
  name: string;
  status?: string;
};

export type CompactDocumentsProps = {
  ariaLabel?: string;
  className?: string;
  defaultView?: CompactDocumentView;
  documents: CompactDocumentNode[];
  onFileOpen?: (document: CompactDocumentNode) => void;
  onFolderOpen?: (folder: CompactDocumentNode) => void;
  onViewChange?: (view: CompactDocumentView) => void;
  showSearch?: boolean;
  showViewOptions?: boolean;
};

function findNode(nodes: CompactDocumentNode[], id: string): CompactDocumentNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const match = findNode(node.children ?? [], id);
    if (match) return match;
  }
  return null;
}

function buildBreadcrumb(
  nodes: CompactDocumentNode[],
  id: string,
  path: CompactDocumentNode[] = [],
): CompactDocumentNode[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (node.id === id) return nextPath;
    const match = buildBreadcrumb(node.children ?? [], id, nextPath);
    if (match) return match;
  }
  return null;
}

function statusTone(status = ""): "accent" | "info" | "success" | "warning" {
  const value = status.toLowerCase();
  if (value.includes("signed") || value.includes("approved") || value.includes("current")) return "success";
  if (value.includes("review") || value.includes("draft")) return "warning";
  return value ? "accent" : "info";
}

export function CompactDocuments({
  ariaLabel = "Documents",
  className,
  defaultView = "list",
  documents,
  onFileOpen,
  onFolderOpen,
  onViewChange,
  showSearch = true,
  showViewOptions = true,
}: CompactDocumentsProps) {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<CompactDocumentView>(defaultView);
  const breadcrumb = folderId ? buildBreadcrumb(documents, folderId) ?? [] : [];
  const current = folderId ? findNode(documents, folderId) : null;
  const visible = useMemo(() => {
    const nodes = current?.kind === "folder" ? current.children ?? [] : documents;
    const search = query.trim().toLowerCase();
    return search ? nodes.filter((node) => node.name.toLowerCase().includes(search)) : nodes;
  }, [current, documents, query]);
  const columnLevels = useMemo(() => {
    const levels: CompactDocumentNode[][] = [documents];
    breadcrumb.forEach((node, index) => {
      levels.push(index === breadcrumb.length - 1 ? visible : node.children ?? []);
    });
    return levels;
  }, [breadcrumb, documents, visible]);

  const openFolder = (node: CompactDocumentNode) => {
    setFolderId(node.id);
    setQuery("");
    onFolderOpen?.(node);
  };
  const openNode = (node: CompactDocumentNode) =>
    node.kind === "folder" ? openFolder(node) : onFileOpen?.(node);
  const changeView = (nextView: CompactDocumentView) => {
    setView(nextView);
    onViewChange?.(nextView);
  };

  const nodeIcon = (node: CompactDocumentNode) => (
    <span className={styles.nodeIcon}>
      <CatalogIcon iconName={node.kind === "folder" ? "folder" : "file-lines"} />
    </span>
  );

  return (
    <section
      aria-label={ariaLabel}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-component="compact-documents"
    >
      <div className={styles.toolbar}>
        <nav aria-label="Document path" className={styles.breadcrumb}>
          <button onClick={() => { setFolderId(null); setQuery(""); }} type="button">Documents</button>
          {breadcrumb.map((node) => (
            <span key={node.id}>
              <CatalogIcon iconName="chevron-right" />
              <button onClick={() => openFolder(node)} type="button">{node.name}</button>
            </span>
          ))}
        </nav>
        <div className={styles.controls}>
          {showSearch ? (
            <TextField
              id="compact-documents-search"
              label="Search documents"
              labelVisuallyHidden
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search this folder..."
              type="search"
              value={query}
            />
          ) : null}
          {showViewOptions ? (
            <div aria-label="Document view" className={styles.viewOptions} role="group">
              {([
                ["list", "bars", "List view"],
                ["grid", "table-cells-large", "Grid view"],
                ["columns", "table-columns", "Columns view"],
              ] as const).map(([value, icon, label]) => (
                <button
                  aria-label={label}
                  aria-pressed={view === value}
                  key={value}
                  onClick={() => changeView(value)}
                  title={label}
                  type="button"
                >
                  <CatalogIcon iconName={icon} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.viewport}>
        {view === "list" ? (
          <div aria-label="Folder contents" className={styles.list}>
            {visible.map((node) => (
              <button className={styles.listRow} key={node.id} onClick={() => openNode(node)} type="button">
                {nodeIcon(node)}
                <span className={styles.nodeCopy}>
                  <strong>{node.name}</strong>
                  <small>{node.kind === "folder" ? `${node.children?.length ?? 0} items` : node.meta}</small>
                </span>
                {node.status ? <Badge label={node.status} size="sm" tone={statusTone(node.status)} /> : null}
                <CatalogIcon iconName="chevron-right" />
              </button>
            ))}
          </div>
        ) : null}

        {view === "grid" ? (
          <div aria-label="Folder contents" className={styles.grid}>
            {visible.map((node) => (
              <button className={styles.card} key={node.id} onClick={() => openNode(node)} type="button">
                <span className={styles.cardTop}>
                  {nodeIcon(node)}
                  <CatalogIcon iconName="chevron-right" />
                </span>
                <strong>{node.name}</strong>
                <small>{node.kind === "folder" ? `${node.children?.length ?? 0} items` : node.meta}</small>
                {node.status ? <Badge label={node.status} size="sm" tone={statusTone(node.status)} /> : null}
              </button>
            ))}
          </div>
        ) : null}

        {view === "columns" ? (
          <div aria-label="Folder contents" className={styles.columns}>
            {columnLevels.map((level, index) => (
              <div className={styles.column} key={`${index}-${breadcrumb[index - 1]?.id ?? "root"}`}>
                <strong className={styles.columnTitle}>{index === 0 ? "Documents" : breadcrumb[index - 1]?.name}</strong>
                {level.map((node) => (
                  <button
                    aria-current={breadcrumb.some((item) => item.id === node.id) ? "page" : undefined}
                    className={styles.columnRow}
                    key={node.id}
                    onClick={() => openNode(node)}
                    type="button"
                  >
                    {nodeIcon(node)}
                    <span>{node.name}</span>
                    {node.kind === "folder" ? <CatalogIcon iconName="chevron-right" /> : null}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : null}
        {!visible.length ? <p className={styles.empty}>This folder is empty.</p> : null}
      </div>
    </section>
  );
}
