"use client";

import { useState } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./TransferListField.module.css";

type TransferListFieldProps = {
  available: string[];
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  required?: boolean;
  size?: InputControlSize;
  selected: string[];
  onChange: (selected: string[]) => void;
};

export function TransferListField({
  available,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  required,
  size = "md",
  selected,
  onChange,
}: TransferListFieldProps) {
  const shellAria = useFieldShellAria();
  const [activeAvailable, setActiveAvailable] = useState<string[]>([]);
  const [activeSelected, setActiveSelected] = useState<string[]>([]);

  const availableItems = available.filter((item) => !selected.includes(item));

  function moveToSelected() {
    onChange([...selected, ...activeAvailable.filter((item) => !selected.includes(item))]);
    setActiveAvailable([]);
  }

  function moveToAvailable() {
    onChange(selected.filter((item) => !activeSelected.includes(item)));
    setActiveSelected([]);
  }

  function moveAllToSelected() {
    onChange([...available]);
    setActiveAvailable([]);
  }

  function moveAllToAvailable() {
    onChange([]);
    setActiveSelected([]);
  }

  function toggleItem(item: string, list: "available" | "selected") {
    if (list === "available") {
      setActiveAvailable((current) =>
        current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
      );
      return;
    }

    setActiveSelected((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  }

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div
        className={`${styles.root} ${inputControlSizeClassName[size]}`}
        {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
      >
        <ListColumn
          active={activeAvailable}
          items={availableItems}
          title="Available"
          onToggle={(item) => toggleItem(item, "available")}
        />
        <div className={styles.controls}>
          <button className={styles.controlButton} type="button" onClick={moveToSelected}>
            ›
          </button>
          <button className={styles.controlButton} type="button" onClick={moveAllToSelected}>
            »
          </button>
          <button className={styles.controlButton} type="button" onClick={moveToAvailable}>
            ‹
          </button>
          <button className={styles.controlButton} type="button" onClick={moveAllToAvailable}>
            «
          </button>
        </div>
        <ListColumn
          active={activeSelected}
          items={selected}
          title="Selected"
          onToggle={(item) => toggleItem(item, "selected")}
        />
      </div>
    </FieldShell>
  );
}

function ListColumn({
  active,
  items,
  title,
  onToggle,
}: {
  active: string[];
  items: string[];
  title: string;
  onToggle: (item: string) => void;
}) {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>{title}</div>
      <ul aria-label={title} aria-multiselectable="true" className={styles.list} role="listbox">
        {items.map((item) => (
          <li key={item} role="presentation">
            <button
              aria-selected={active.includes(item)}
              className={[styles.item, active.includes(item) ? styles.itemActive : ""]
                .filter(Boolean)
                .join(" ")}
              role="option"
              type="button"
              onClick={() => onToggle(item)}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
