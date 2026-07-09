"use client";

import { useMemo, useState } from "react";
import styles from "./DualListBuilder.module.css";

export type DualListItem = {
  id: string;
  label: string;
};

export type DualListBuilderProps = {
  available: DualListItem[];
  availableTitle?: string;
  onChange: (selectedIds: string[]) => void;
  selectedIds: string[];
  selectedTitle?: string;
};

export function DualListBuilder({
  available,
  availableTitle = "Available",
  onChange,
  selectedIds,
  selectedTitle = "Selected",
}: DualListBuilderProps) {
  const [query, setQuery] = useState("");
  const [activeAvailable, setActiveAvailable] = useState<string[]>([]);
  const [activeSelected, setActiveSelected] = useState<string[]>([]);

  const byId = useMemo(() => new Map(available.map((item) => [item.id, item])), [available]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const availableItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return available.filter((item) => {
      if (selectedSet.has(item.id)) return false;
      if (!needle) return true;
      return item.label.toLowerCase().includes(needle);
    });
  }, [available, query, selectedSet]);

  const selectedItems = selectedIds.map((id) => byId.get(id)).filter(Boolean) as DualListItem[];

  const expression = useMemo(() => {
    if (selectedItems.length === 0) return "Nothing selected";
    return selectedItems.map((item) => item.label).join(" → ");
  }, [selectedItems]);

  const payload = useMemo(
    () => selectedItems.map(({ id, label }) => ({ id, label })),
    [selectedItems],
  );

  function toggle(id: string, side: "available" | "selected") {
    const setter = side === "available" ? setActiveAvailable : setActiveSelected;
    setter((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  function moveRight() {
    onChange([...selectedIds, ...activeAvailable.filter((id) => !selectedSet.has(id))]);
    setActiveAvailable([]);
  }

  function moveLeft() {
    onChange(selectedIds.filter((id) => !activeSelected.includes(id)));
    setActiveSelected([]);
  }

  function moveAllRight() {
    onChange(available.map((item) => item.id));
    setActiveAvailable([]);
  }

  function moveAllLeft() {
    onChange([]);
    setActiveSelected([]);
  }

  return (
    <div className={styles.root} aria-label="Dual list builder">
      <div className={styles.searchRow}>
        <input
          aria-label="Search available items"
          className={styles.search}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search available…"
          type="search"
          value={query}
        />
      </div>
      <div className={styles.columns}>
        <ListColumn
          active={activeAvailable}
          items={availableItems}
          title={availableTitle}
          onToggle={(id) => toggle(id, "available")}
        />
        <div className={styles.controls}>
          <button className={styles.control} onClick={moveRight} type="button">
            ›
          </button>
          <button className={styles.control} onClick={moveAllRight} type="button">
            »
          </button>
          <button className={styles.control} onClick={moveLeft} type="button">
            ‹
          </button>
          <button className={styles.control} onClick={moveAllLeft} type="button">
            «
          </button>
        </div>
        <ListColumn
          active={activeSelected}
          items={selectedItems}
          title={selectedTitle}
          onToggle={(id) => toggle(id, "selected")}
        />
      </div>
      <div className={styles.output} aria-label="Dual list output">
        <div className={styles.outputLabel}>Output</div>
        <p className={styles.expression}>{expression}</p>
        <pre className={styles.payload}>{JSON.stringify(payload, null, 2)}</pre>
      </div>
    </div>
  );
}

function ListColumn({
  active,
  items,
  onToggle,
  title,
}: {
  active: string[];
  items: DualListItem[];
  onToggle: (id: string) => void;
  title: string;
}) {
  return (
    <div className={styles.column}>
      <div className={styles.columnTitle}>
        {title}
        <span className={styles.count}>{items.length}</span>
      </div>
      <ul className={styles.list}>
        {items.map((item) => {
          const isActive = active.includes(item.id);
          return (
            <li key={item.id}>
              <button
                aria-pressed={isActive}
                className={isActive ? `${styles.item} ${styles.itemActive}` : styles.item}
                onClick={() => onToggle(item.id)}
                type="button"
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
