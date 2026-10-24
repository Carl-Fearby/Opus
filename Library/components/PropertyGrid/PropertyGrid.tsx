"use client";

import { useState } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./PropertyGrid.module.css";

export type PropertyGridItem = {
  copyable?: boolean;
  label: string;
  value: string;
};

export type PropertyGridProps = {
  bordered?: boolean;
  items: PropertyGridItem[];
  onCopy?: (item: PropertyGridItem, index: number) => void;
};

export function PropertyGrid({ bordered = false, items, onCopy }: PropertyGridProps) {
  const { t } = useOpusI18n();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function copyValue(value: string, index: number) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      onCopy?.(items[index]!, index);
      window.setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1200);
    } catch {
      setCopiedIndex(null);
    }
  }

  return (
    <div className={styles.grid} data-bordered={bordered} role="table" aria-label={t("propertyGrid.label", "Properties")}>
      {items.map((item, index) => (
        <div className={styles.row} key={`${item.label}-${index}`} role="row">
          <div className={styles.label} role="rowheader">
            {item.label}
          </div>
          <div className={styles.valueCell} role="cell">
            <span className={styles.value}>{item.value}</span>
            {item.copyable ? (
              <button
                aria-label={t("propertyGrid.copy", "Copy {label}", { label: item.label })}
                className={styles.copy}
                onClick={() => void copyValue(item.value, index)}
                type="button"
              >
                {copiedIndex === index
                  ? t("propertyGrid.copied", "Copied")
                  : t("propertyGrid.copyAction", "Copy")}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
