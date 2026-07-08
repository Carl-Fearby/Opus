"use client";

import { useMemo, useState } from "react";
import styles from "./JsonViewer.module.css";

type JsonViewerProps = {
  collapsedDepth?: number;
  value: unknown;
};

type JsonNodeProps = {
  collapsedDepth: number;
  depth: number;
  name?: string;
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

function JsonNode({ collapsedDepth, depth, name, value }: JsonNodeProps) {
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
        onClick={() => setOpen((current) => !current)}
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
              value={childValue}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function JsonViewer({ collapsedDepth = 1, value }: JsonViewerProps) {
  const parsed = useMemo(() => value, [value]);

  return (
    <div className={styles.root} role="tree">
      <JsonNode collapsedDepth={Math.max(0, collapsedDepth)} depth={0} value={parsed} />
    </div>
  );
}
