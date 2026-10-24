"use client";

import { useOpusI18n } from "@/components/OpusI18n";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createThemedPortal as createPortal } from "@/lib/theme/createThemedPortal";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import { inputControlSizeClassName } from "@/components/fields/shared/inputControlSizes";
import type { ControlRadius, ControlTransparency, FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import {
  resolveFieldListPortalStyle,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import styles from "./AsyncMultiSelectField.module.css";

export type AsyncMultiSelectOption = {
  description?: string;
  label: string;
  value: string;
};

export type AsyncMultiSelectFieldProps = {
  debounceMs?: number;
  defaultOptions?: AsyncMultiSelectOption[];
  disabled?: boolean;
  emptyMessage?: string;
  error?: string;
  gradient?: boolean;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  loadingMessage?: string;
  loadOptions: (query: string) => Promise<AsyncMultiSelectOption[]>;
  /** Limits how many values can be selected. */
  max?: number;
  minQueryLength?: number;
  mode?: FieldMode;
  /** Renders hidden inputs so selected values submit with a native form. */
  name?: string;
  onChange: (options: AsyncMultiSelectOption[]) => void;
  placeholder?: string;
  radius?: ControlRadius;
  required?: boolean;
  size?: InputControlSize;
  transparency?: ControlTransparency;
  value: AsyncMultiSelectOption[];
};

export function AsyncMultiSelectField({
  debounceMs = 250,
  defaultOptions = [],
  disabled = false,
  emptyMessage = "No options found",
  error,
  gradient,
  help,
  id,
  label,
  labelPosition = "left",
  loadingMessage = "Loading options…",
  loadOptions,
  max,
  minQueryLength = 0,
  mode = "stacked",
  name,
  onChange,
  placeholder = "Search…",
  radius,
  required,
  size = "md",
  transparency,
  value,
}: AsyncMultiSelectFieldProps) {
  const { t } = useOpusI18n();
  const shellAria = useFieldShellAria();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<AsyncMultiSelectOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);

  const atLimit = max !== undefined && value.length >= max;
  const selectedValues = new Set(value.map((option) => option.value));
  const available = query.trim() ? options : defaultOptions;

  useEffect(() => {
    if (!open || disabled) return;

    const term = query.trim();
    if (!term || term.length < minQueryLength) {
      requestRef.current += 1;
      setOptions([]);
      setHighlight(0);
      setLoading(false);
      return;
    }

    const request = ++requestRef.current;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const next = await loadOptions(term);
        if (request === requestRef.current) {
          setOptions(next);
          setHighlight(0);
        }
      } finally {
        if (request === requestRef.current) setLoading(false);
      }
    }, debounceMs);

    return () => window.clearTimeout(timeout);
  }, [debounceMs, disabled, loadOptions, minQueryLength, open, query]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPortalStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = rootRef.current;
      if (!anchor) return;
      setPortalStyle(
        resolveFieldListPortalStyle(
          anchor.getBoundingClientRect(),
          panelRef.current?.getBoundingClientRect() ?? null,
        ),
      );
    };

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, value.length]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function removeOption(option: AsyncMultiSelectOption) {
    if (disabled) return;
    onChange(value.filter((item) => item.value !== option.value));
    inputRef.current?.focus();
  }

  function toggleOption(option: AsyncMultiSelectOption) {
    if (disabled) return;

    if (selectedValues.has(option.value)) {
      onChange(value.filter((item) => item.value !== option.value));
    } else {
      if (atLimit) return;
      onChange([...value, option]);
    }

    setQuery("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((current) => (available.length ? Math.min(current + 1, available.length - 1) : 0));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      if (!open) return;
      event.preventDefault();
      setHighlight(event.key === "Home" ? 0 : Math.max(available.length - 1, 0));
      return;
    }

    if (event.key === "Enter" && open && available[highlight]) {
      event.preventDefault();
      toggleOption(available[highlight]);
      return;
    }

    if (event.key === "Backspace" && !query && value.length) {
      event.preventDefault();
      onChange(value.slice(0, -1));
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  function handleFieldMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      inputRef.current?.focus();
    }
  }

  const panel =
    open && !disabled && portalStyle
      ? createPortal(
          <div
            className={styles.portal}
            data-control-radius={radius}
            data-portaled="true"
            ref={panelRef}
            style={
              {
                left: portalStyle.left,
                top: portalStyle.top,
                width: portalStyle.width,
              } as CSSProperties
            }
          >
            <div aria-label={label} className={styles.list} id={listId} role="listbox">
              {loading ? (
                <p className={styles.message} role="status">
                  {loadingMessage}
                </p>
              ) : available.length ? (
                available.map((option, index) => {
                  const selected = selectedValues.has(option.value);
                  return (
                    <button
                      aria-selected={selected}
                      className={[styles.option, selected ? styles.optionSelected : ""].filter(Boolean).join(" ")}
                      id={`${listId}-option-${index}`}
                      key={option.value}
                      role="option"
                      type="button"
                      onClick={() => toggleOption(option)}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setHighlight(index)}
                    >
                      <span className={styles.optionCopy}>
                        <strong>{option.label}</strong>
                        {option.description ? <small>{option.description}</small> : null}
                      </span>
                      <span aria-hidden="true" className={styles.check}>
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className={styles.message} role="status">
                  {emptyMessage}
                </p>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      radius={radius}
      required={required}
      transparency={transparency}
      gradient={gradient}
    >
      <div className={styles.root} ref={rootRef}>
        {name
          ? value.map((option) => (
              <input key={option.value} name={name} type="hidden" value={option.value} />
            ))
          : null}
        <div
          className={[inputControlSizeClassName[size], styles.field, error ? styles.errorField : ""]
            .filter(Boolean)
            .join(" ")}
          data-disabled={disabled || undefined}
          onMouseDown={handleFieldMouseDown}
        >
          {value.map((option) => (
            <span className={styles.chip} key={option.value}>
              <span className={styles.chipLabel}>{option.label}</span>
              <button
                aria-label={t("asyncMultiSelect.remove", "Remove {label}", { label: option.label })}
                className={styles.remove}
                disabled={disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  removeOption(option);
                }}
                onMouseDown={(event) => event.preventDefault()}
                type="button"
              >
                ×
              </button>
            </span>
          ))}
          <input
            aria-activedescendant={open && available[highlight] ? `${listId}-option-${highlight}` : undefined}
            aria-autocomplete="list"
            aria-controls={open ? listId : undefined}
            aria-expanded={open}
            aria-invalid={error ? "true" : undefined}
            autoComplete="off"
            className={styles.input}
            disabled={disabled}
            id={id}
            placeholder={value.length ? undefined : placeholder}
            ref={inputRef}
            role="combobox"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
          />
        </div>
        {panel}
      </div>
    </FieldShell>
  );
}
