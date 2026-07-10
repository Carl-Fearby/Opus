"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./FilterSelectField.module.css";

export type FilterSelectGroup = {
  label: string;
  options: string[];
};

type FilterSelectFieldProps = {
  error?: string;
  groups: FilterSelectGroup[];
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  placeholder?: string;
  required?: boolean;
  searchPlaceholder?: string;
  size?: InputControlSize;
  value: string[];
  onChange: (value: string[]) => void;
};

export function FilterSelectField({
  error,
  groups,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  placeholder = "Select filters…",
  required,
  searchPlaceholder = "Search…",
  size = "md",
  value,
  onChange,
}: FilterSelectFieldProps) {
  const shellAria = useFieldShellAria();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setQuery("");
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

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
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const filteredGroups = useMemo(() => {
    const normalised = query.trim().toLowerCase();
    if (!normalised) {
      return groups;
    }

    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) => option.toLowerCase().includes(normalised)),
      }))
      .filter((group) => group.options.length > 0);
  }, [groups, query]);

  const summary =
    value.length === 0 ? placeholder : value.length === 1 ? value[0] : `${value.length} selected`;

  function toggleOption(option: string) {
    setDraft((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
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
      <div className={styles.root} ref={rootRef}>
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          className={[
            inputControlSizeClassName[size],
            shared.trigger,
            open ? shared.triggerOpen : "",
            error ? shared.triggerError : "",
          ]
            .filter(Boolean)
            .join(" ")}
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        >
          <span className={value.length ? "" : shared.placeholder}>{summary}</span>
          <span aria-hidden="true" className={shared.chevron}>
            ▾
          </span>
        </button>
        {open ? (
          <div className={shared.panel}>
            <input
              aria-label="Search filters"
              className={shared.search}
              placeholder={searchPlaceholder}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className={shared.list} role="listbox">
              {filteredGroups.map((group) => (
                <div key={group.label}>
                  <div className={shared.groupLabel}>{group.label}</div>
                  {group.options.map((option) => (
                    <label className={shared.option} key={option}>
                      <input
                        checked={draft.includes(option)}
                        type="checkbox"
                        onChange={() => toggleOption(option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <div className={shared.panelFooter}>
              <button
                className={shared.actionButton}
                type="button"
                onClick={() => {
                  setDraft([]);
                  onChange([]);
                  setOpen(false);
                }}
              >
                Reset
              </button>
              <button
                className={`${shared.actionButton} ${shared.actionButtonPrimary}`}
                type="button"
                onClick={() => {
                  onChange(draft);
                  setOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
