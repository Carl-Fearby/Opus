"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/lib/fontawesome";
import { FieldShell } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import {
  filterFontAwesomeIcons,
  getFontAwesomeIconOption,
} from "@/lib/fontAwesomeIconCatalog";
import styles from "./IconPicker.module.css";

type IconPickerProps = {
  help?: string;
  id: string;
  label?: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  searchPlaceholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export function IconPicker({
  help,
  id,
  label = "Icon",
  labelPosition = "left",
  mode = "stacked",
  onChange,
  searchPlaceholder = "Search icons",
  value,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const selected = getFontAwesomeIconOption(value);
  const filteredIcons = useMemo(() => filterFontAwesomeIcons(query), [query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = window.setTimeout(() => searchRef.current?.focus(), 0);

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <FieldShell help={help} id={id} label={label} labelPosition={labelPosition} mode={mode}>
      <div className={styles.root} ref={rootRef}>
        <button
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={styles.trigger}
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
        >
          <span aria-hidden="true" className={styles.triggerIcon}>
            <FontAwesomeIcon icon={selected.icon} />
          </span>
          <span className={styles.triggerLabel}>{selected.label}</span>
        </button>
        <span aria-hidden="true" className={styles.chevron} />
        {open ? (
          <div className={styles.menu}>
            <input
              aria-label={searchPlaceholder}
              className={styles.search}
              placeholder={searchPlaceholder}
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className={styles.grid} id={listboxId} role="listbox">
              {filteredIcons.length ? (
                filteredIcons.map((entry) => (
                  <button
                    aria-label={entry.label}
                    aria-selected={entry.iconName === value}
                    className={styles.option}
                    data-selected={entry.iconName === value ? "true" : undefined}
                    key={entry.iconName}
                    role="option"
                    title={entry.label}
                    type="button"
                    onClick={() => {
                      onChange(entry.iconName);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span aria-hidden="true" className={styles.optionIcon}>
                      <FontAwesomeIcon icon={entry.icon} />
                    </span>
                  </button>
                ))
              ) : (
                <p className={styles.empty}>No icons match your search.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
