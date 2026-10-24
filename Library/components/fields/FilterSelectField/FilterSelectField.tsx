"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import { useOpusI18n } from "@/components/OpusI18n";
import type { ControlRadius, FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./FilterSelectField.module.css";

export type FilterSelectGroup = {
  label: string;
  options: string[];
};

type FilterSelectFieldProps = {
  radius?: ControlRadius;
  transparency?: import("../types").ControlTransparency;
  gradient?: boolean;
  disabled?: boolean;
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
  selectionMode?: "multiple" | "single";
  size?: InputControlSize;
  value: string[];
  onChange: (value: string[]) => void;
};

export function FilterSelectField({
  disabled = false,
  error,
  groups,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  placeholder,
  required,
  radius,
  transparency,
  gradient,
  searchPlaceholder,
  selectionMode = "multiple",
  size = "md",
  value,
  onChange,
}: FilterSelectFieldProps) {
  const { t } = useOpusI18n();
  const displayPlaceholder = placeholder ?? t("field.selectFilters", "Select filters…");
  const displaySearchPlaceholder = searchPlaceholder ?? t("field.search", "Search…");
  const shellAria = useFieldShellAria();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

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
    value.length === 0
      ? displayPlaceholder
      : value.length === 1
        ? value[0]
        : t("field.itemsSelected", "{count} selected", { count: value.length });

  function toggleOption(option: string) {
    if (selectionMode === "single") {
      setDraft([option]);
      return;
    }
    setDraft((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    );
  }

  function toggleMenu() {
    if (open) {
      setOpen(false);
      return;
    }

    const triggerBounds = rootRef.current?.getBoundingClientRect();
    let scrollParent = rootRef.current?.parentElement ?? null;
    while (scrollParent && scrollParent !== document.body) {
      const overflowY = window.getComputedStyle(scrollParent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") break;
      scrollParent = scrollParent.parentElement;
    }
    const boundary = scrollParent?.getBoundingClientRect();
    const top = boundary?.top ?? 0;
    const bottom = boundary?.bottom ?? window.innerHeight;
    const spaceBelow = (bottom ?? window.innerHeight) - (triggerBounds?.bottom ?? 0);
    const spaceAbove = (triggerBounds?.top ?? 0) - (top ?? 0);

    setOpenUpward(spaceBelow < 280 && spaceAbove > spaceBelow);
    setOpen(true);
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
      radius={radius}
      transparency={transparency}
      gradient={gradient}
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
          disabled={disabled}
          id={id}
          type="button"
          onClick={toggleMenu}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        >
          <span className={value.length ? "" : shared.placeholder}>{summary}</span>
          <span aria-hidden="true" className={shared.chevron} />
        </button>
        {open ? (
          <div className={[shared.panel, openUpward ? styles.panelUpward : ""].filter(Boolean).join(" ")}>
            <input
              aria-label={t("field.searchFilters", "Search filters")}
              className={shared.search}
              disabled={disabled}
              placeholder={displaySearchPlaceholder}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className={shared.list} role="listbox">
              {filteredGroups.map((group) => (
                <div key={group.label}>
                  <div className={shared.groupLabel}>{group.label}</div>
                  {group.options.map((option) => (
                    selectionMode === "single" ? (
                      <button
                        aria-selected={value.includes(option)}
                        className={shared.option}
                        disabled={disabled}
                        key={option}
                        role="option"
                        type="button"
                        onClick={() => {
                          onChange([option]);
                          setOpen(false);
                        }}
                      >
                        <span>{option}</span>
                      </button>
                    ) : (
                      <label className={shared.option} key={option}>
                        <input
                          checked={draft.includes(option)}
                          disabled={disabled}
                          type="checkbox"
                          onChange={() => toggleOption(option)}
                        />
                        <span>{option}</span>
                      </label>
                    )
                  ))}
                </div>
              ))}
            </div>
            {selectionMode === "multiple" ? <div className={shared.panelFooter}>
              <button
                className={shared.actionButton}
                type="button"
                onClick={() => {
                  setDraft([]);
                  onChange([]);
                  setOpen(false);
                }}
              >
                {t("common.reset", "Reset")}
              </button>
              <button
                className={`${shared.actionButton} ${shared.actionButtonPrimary}`}
                type="button"
                onClick={() => {
                  onChange(draft);
                  setOpen(false);
                }}
              >
                {t("common.apply", "Apply")}
              </button>
            </div> : null}
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
