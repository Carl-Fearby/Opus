"use client";

import { useMemo, useState } from "react";
import styles from "./JsonViewer.module.css";

export type JsonViewerProps = {
  collapsedDepth?: number;
  onToggle?: (path: string, open: boolean) => void;
  value: unknown;
};

type JsonNodeProps = {
  collapsedDepth: number;
  depth: number;
  name?: string;
  onToggle?: (path: string, open: boolean) => void;
  path: string;
  value: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className={styles.null}>null</span>;
  }
  if (typeof value === "string") {
    return <span className={styles.string}>&quot;{value}&quot;</span>;
  }
  if (typeof value === "number") {
    return <span className={styles.number}>{value}</span>;
  }
  if (typeof value === "boolean") {
    return <span className={styles.boolean}>{String(value)}</span>;
  }
  return <span className={styles.string}>{String(value)}</span>;
}

function JsonNode({ collapsedDepth, depth, name, onToggle, path, value }: JsonNodeProps) {
  const isExpandable = Array.isArray(value) || isPlainObject(value);
  const [open, setOpen] = useState(depth < collapsedDepth);

  if (!isExpandable) {
    return (
      <div className={styles.line} style={{ paddingLeft: `${depth * 14}px` }}>
        {name !== undefined ? <span className={styles.key}>{name}: </span> : null}
        <PrimitiveValue value={value} />
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((entry, index) => [String(index), entry] as const)
    : Object.entries(value);
  const summary = Array.isArray(value) ? `Array(${value.length})` : `Object(${entries.length})`;

  return (
    <div className={styles.block}>
      <button
        aria-expanded={open}
        className={styles.toggleLine}
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          onToggle?.(path, nextOpen);
        }}
        style={{ paddingLeft: `${depth * 14}px` }}
        type="button"
      >
        <span aria-hidden="true" className={styles.chevron}>
          {open ? "▾" : "▸"}
        </span>
        {name !== undefined ? <span className={styles.key}>{name}: </span> : null}
        <span className={styles.summary}>{summary}</span>
      </button>
      {open ? (
        <div className={styles.children}>
          {entries.map(([childName, childValue]) => (
            <JsonNode
              collapsedDepth={collapsedDepth}
              depth={depth + 1}
              key={childName}
              name={childName}
              onToggle={onToggle}
              path={`${path}.${childName}`}
              value={childValue}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function JsonViewer({ collapsedDepth = 1, onToggle, value }: JsonViewerProps) {
  const parsed = useMemo(() => value, [value]);

  return (
    <div className={styles.root}>
      <JsonNode
        collapsedDepth={Math.max(0, collapsedDepth)}
        depth={0}
        onToggle={onToggle}
        path="$"
        value={parsed}
      />
    </div>
  );
}
