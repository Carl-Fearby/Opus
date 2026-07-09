"use client";

import { useMemo, useState } from "react";
import styles from "./PropertyInspector.module.css";

export type PropertyInspectorValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { options: string[]; value: string };

export type PropertyInspectorItem = {
  group?: string;
  id: string;
  label: string;
  readOnly?: boolean;
  value: PropertyInspectorValue;
};

type PropertyInspectorProps = {
  items: PropertyInspectorItem[];
  onChange?: (id: string, value: PropertyInspectorValue) => void;
  searchable?: boolean;
};

function isSelectValue(value: PropertyInspectorValue): value is { options: string[]; value: string } {
  return Boolean(value && typeof value === "object" && "options" in value);
}

function formatDisplay(value: PropertyInspectorValue): string {
  if (isSelectValue(value)) return value.value;
  if (value === null || value === undefined) return "—";
  return String(value);
}

export function PropertyInspector({ items, onChange, searchable = false }: PropertyInspectorProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        item.group?.toLowerCase().includes(needle) ||
        formatDisplay(item.value).toLowerCase().includes(needle),
    );
  }, [items, query]);

  const groups = useMemo(() => {
    const map = new Map<string, PropertyInspectorItem[]>();
    for (const item of filtered) {
      const key = item.group ?? "General";
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered]);

  function toggleGroup(group: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  }

  return (
    <div className={styles.root} aria-label="Property inspector">
      {searchable ? (
        <div className={styles.searchRow}>
          <input
            aria-label="Filter properties"
            className={styles.search}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter properties…"
            type="search"
            value={query}
          />
        </div>
      ) : null}
      {groups.map(([group, groupItems]) => {
        const isCollapsed = collapsed.has(group);
        return (
          <section className={styles.group} key={group}>
            <button
              aria-expanded={!isCollapsed}
              className={styles.groupHeader}
              onClick={() => toggleGroup(group)}
              type="button"
            >
              <span aria-hidden="true">{isCollapsed ? "▸" : "▾"}</span>
              {group}
            </button>
            {!isCollapsed ? (
              <div className={styles.rows} role="table">
                {groupItems.map((item) => (
                  <div className={styles.row} key={item.id} role="row">
                    <div className={styles.label} role="rowheader">
                      {item.label}
                    </div>
                    <div className={styles.valueCell} role="cell">
                      {item.readOnly || !onChange ? (
                        <span className={styles.value}>{formatDisplay(item.value)}</span>
                      ) : typeof item.value === "boolean" ? (
                        <input
                          aria-label={item.label}
                          checked={item.value}
                          className={styles.checkbox}
                          onChange={(event) => onChange(item.id, event.target.checked)}
                          type="checkbox"
                        />
                      ) : isSelectValue(item.value) ? (
                        <select
                          aria-label={item.label}
                          className={styles.select}
                          onChange={(event) =>
                            onChange(item.id, { ...item.value as { options: string[]; value: string }, value: event.target.value })
                          }
                          value={item.value.value}
                        >
                          {item.value.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          aria-label={item.label}
                          className={styles.input}
                          onChange={(event) => {
                            const raw = event.target.value;
                            if (typeof item.value === "number") {
                              const next = Number(raw);
                              onChange(item.id, Number.isFinite(next) ? next : item.value);
                              return;
                            }
                            onChange(item.id, raw);
                          }}
                          type={typeof item.value === "number" ? "number" : "text"}
                          value={item.value == null ? "" : String(item.value)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
