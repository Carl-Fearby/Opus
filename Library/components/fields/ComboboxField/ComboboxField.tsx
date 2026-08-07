"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { FieldShell } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import {
  resolveFieldListPortalStyle,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import styles from "./ComboboxField.module.css";

export type ComboboxOption = { label: string; value: string };

export type ComboboxFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  options: ComboboxOption[];
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function ComboboxField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  options,
  placeholder,
  required,
  value,
  onChange,
}: ComboboxFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query),
    );
  }, [options, value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setHighlight(0);
  }, [filtered]);

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
  }, [open, filtered.length, value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, [open]);

  function selectOption(option: ComboboxOption) {
    onChange(option.value);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (filtered.length === 0) return;
      setHighlight((current) => (current + 1) % filtered.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (filtered.length === 0) return;
      setHighlight((current) => (current - 1 + filtered.length) % filtered.length);
      return;
    }

    if (event.key === "Enter" && open && filtered[highlight]) {
      event.preventDefault();
      selectOption(filtered[highlight]);
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  }

  const activeOption = open && filtered[highlight] ? `${listId}-option-${highlight}` : undefined;
  const showList = open && portalReady && portalStyle && filtered.length > 0;

  const panel = showList
    ? createPortal(
        <div
          className={styles.portal}
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
          <div
            aria-label={label}
            className={styles.list}
            id={listId}
            role="listbox"
          >
            {filtered.map((option, index) => {
              const active = index === highlight;
              return (
                <button
                  aria-selected={active}
                  className={[styles.option, active ? styles.optionActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  id={`${listId}-option-${index}`}
                  key={`${option.value}:${option.label}`}
                  role="option"
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlight(index)}
                >
                  {option.label}
                </button>
              );
            })}
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
      required={required}
    >
      <div className={styles.root} ref={rootRef}>
        <input
          aria-activedescendant={activeOption}
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-expanded={open}
          aria-invalid={error ? "true" : undefined}
          autoComplete="off"
          className={[styles.input, error ? styles.inputError : ""].filter(Boolean).join(" ")}
          id={id}
          placeholder={placeholder}
          ref={inputRef}
          role="combobox"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {panel}
      </div>
    </FieldShell>
  );
}
