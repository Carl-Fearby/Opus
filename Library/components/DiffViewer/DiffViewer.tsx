"use client";

import { useState } from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./DiffViewer.module.css";

export type DiffViewerView = "unified" | "split";

export type DiffViewerProps = {
  before: string;
  after: string;
  /** Legacy initial view. Prefer `defaultView`. */
  split?: boolean;
  defaultView?: DiffViewerView;
  view?: DiffViewerView;
  showViewToggle?: boolean;
  heading?: string;
  beforeLabel?: string;
  afterLabel?: string;
  onViewChange?: (view: DiffViewerView) => void;
};
type Line = { text: string; kind: "same" | "add" | "remove"; beforeLine?: number; afterLine?: number };

function diff(before: string, after: string): Line[] {
  const left = before.split("\n"), right = after.split("\n");
  const table = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));
  for (let i = left.length - 1; i >= 0; i -= 1) for (let j = right.length - 1; j >= 0; j -= 1) table[i][j] = left[i] === right[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  const lines: Line[] = []; let i = 0, j = 0;
  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) { lines.push({ text: left[i], kind: "same", beforeLine: ++i, afterLine: ++j }); }
    else if (j < right.length && (i === left.length || table[i][j + 1] >= table[i + 1][j])) { lines.push({ text: right[j], kind: "add", afterLine: ++j }); }
    else { lines.push({ text: left[i], kind: "remove", beforeLine: ++i }); }
  }
  return lines;
}

function Lines({ lines, side }: { lines: Line[]; side?: "before" | "after" }) {
  const visible = lines.filter((line) => !side || line.kind === "same" || (side === "before" ? line.kind === "remove" : line.kind === "add"));
  return <pre>{visible.map((line, index) => <span data-kind={line.kind} key={`${line.kind}-${index}`}><i>{side === "before" ? line.beforeLine ?? "" : side === "after" ? line.afterLine ?? "" : line.beforeLine ?? line.afterLine ?? ""}</i><b>{line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " "}</b>{line.text || " "}</span>)}</pre>;
}

export function DiffViewer({
  before,
  after,
  split = false,
  defaultView,
  view,
  showViewToggle = true,
  heading = "Differences",
  beforeLabel = "Before",
  afterLabel = "After",
  onViewChange,
}: DiffViewerProps) {
  const lines = diff(before, after);
  const [internalView, setInternalView] = useState<DiffViewerView>(defaultView ?? (split ? "split" : "unified"));
  const activeView = view ?? internalView;

  function changeView(nextView: DiffViewerView) {
    if (view === undefined) setInternalView(nextView);
    onViewChange?.(nextView);
  }

  return <section aria-label="Difference viewer" className={styles.viewer}>
    <header className={styles.toolbar}>
      <span>{heading}</span>
      {showViewToggle ? <div aria-label="Diff layout" className={styles.viewOptions} role="group">
        <button aria-label="Unified diff" aria-pressed={activeView === "unified"} onClick={() => changeView("unified")} title="Unified diff" type="button">
          <CatalogIcon iconName="bars" />
        </button>
        <button aria-label="Side-by-side diff" aria-pressed={activeView === "split"} onClick={() => changeView("split")} title="Side-by-side diff" type="button">
          <CatalogIcon iconName="table-columns" />
        </button>
      </div> : null}
    </header>
    {activeView === "split" ? <div className={styles.split}>
      <section className={styles.root}><header>{beforeLabel}</header><Lines lines={lines} side="before" /></section>
      <section className={styles.root}><header>{afterLabel}</header><Lines lines={lines} side="after" /></section>
    </div> : <section className={styles.root}><Lines lines={lines} /></section>}
  </section>;
}
