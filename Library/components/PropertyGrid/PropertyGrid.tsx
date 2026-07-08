"use client";

import { useState } from "react";
import styles from "./PropertyGrid.module.css";

export type PropertyGridItem = {
  copyable?: boolean;
  label: string;
  value: string;
};

type PropertyGridProps = {
  items: PropertyGridItem[];
};

export function PropertyGrid({ items }: PropertyGridProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function copyValue(value: string, index: number) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1200);
    } catch {
      setCopiedIndex(null);
    }
  }

  return (
    <div className={styles.grid} role="table" aria-label="Properties">
      {items.map((item, index) => (
        <div className={styles.row} key={`${item.label}-${index}`} role="row">
          <div className={styles.label} role="rowheader">
            {item.label}
          </div>
          <div className={styles.valueCell} role="cell">
            <span className={styles.value}>{item.value}</span>
            {item.copyable ? (
              <button
                aria-label={`Copy ${item.label}`}
                className={styles.copy}
                onClick={() => void copyValue(item.value, index)}
                type="button"
              >
                {copiedIndex === index ? "Copied" : "Copy"}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
