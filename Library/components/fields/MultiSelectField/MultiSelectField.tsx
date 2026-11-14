"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { ControlRadius, FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { createTypeaheadState, resolveTypeaheadIndex } from "../shared/typeahead";
import styles from "./MultiSelectField.module.css";
import { useDismissOnBlur } from "@/lib/ui/useDismissOnBlur";

type MultiSelectFieldProps = {
  radius?: ControlRadius;
  transparency?: import("../types").ControlTransparency;
  gradient?: boolean;
  disabled?: boolean;
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  options: string[];
  placeholder?: string;
  required?: boolean;
  size?: InputControlSize;
  value: string[];
  onChange: (value: string[]) => void;
};

export function MultiSelectField({
  disabled = false,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  options,
  placeholder = "Select options…",
  required,
  radius,
  transparency,
  gradient,
  size = "md",
  value,
  onChange,
}: MultiSelectFieldProps) {
  const shellAria = useFieldShellAria();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLInputElement | null>>([]);
  const typeaheadRef = useRef(createTypeaheadState());
  const pendingFocusRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useDismissOnBlur({ open, onDismiss: () => setOpen(false), refs: [rootRef] });

  // Move focus into the list once the panel has rendered.
  useEffect(() => {
    if (!open) {
      pendingFocusRef.current = null;
      return;
    }

    const pending = pendingFocusRef.current;
    if (pending === null) {
      return;
    }
    pendingFocusRef.current = null;

    const input = optionRefs.current[pending];
    if (!input) {
      return;
    }
    input.focus({ preventScroll: true });
    input.parentElement?.scrollIntoView?.({ block: "nearest" });
  }, [open]);

  const summary = useMemo(() => {
    if (value.length === 0) {
      return placeholder;
    }
    if (value.length <= 2) {
      return value.join(", ");
    }
    return `${value.length} selected`;
  }, [placeholder, value]);

  function toggleOption(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  }

  function selectedStartIndex() {
    const index = options.findIndex((option) => value.includes(option));
    return index >= 0 ? index : 0;
  }

  function focusOption(index: number) {
    if (options.length === 0) {
      return;
    }

    const next = Math.min(Math.max(index, 0), options.length - 1);
    setHighlight(next);

    const input = optionRefs.current[next];
    if (!input) {
      return;
    }
    input.focus({ preventScroll: true });
    input.parentElement?.scrollIntoView?.({ block: "nearest" });
  }

  function openList(focusIndex: number) {
    setHighlight(focusIndex);
    pendingFocusRef.current = focusIndex;
    setOpen(true);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    const { key } = event;
    const lastIndex = Math.max(options.length - 1, 0);

    if (key === "Escape") {
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
      return;
    }

    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      if (options.length === 0) {
        return;
      }
      if (!open) {
        openList(key === "End" ? lastIndex : key === "Home" ? 0 : selectedStartIndex());
        return;
      }
      focusOption(
        key === "Home"
          ? 0
          : key === "End"
            ? lastIndex
            : key === "ArrowDown"
              ? Math.min(highlight + 1, lastIndex)
              : Math.max(highlight - 1, 0),
      );
      return;
    }

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (open) {
        focusOption(highlight);
      } else {
        openList(selectedStartIndex());
      }
      return;
    }

    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      const index = resolveTypeaheadIndex(
        options,
        key,
        typeaheadRef.current,
        open ? highlight : selectedStartIndex(),
      );
      if (index === null) {
        return;
      }
      event.preventDefault();
      if (open) {
        focusOption(index);
      } else {
        openList(index);
      }
    }
  }

  function handleListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const { key } = event;
    const lastIndex = Math.max(options.length - 1, 0);

    if (key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      focusOption(
        key === "Home"
          ? 0
          : key === "End"
            ? lastIndex
            : key === "ArrowDown"
              ? Math.min(highlight + 1, lastIndex)
              : Math.max(highlight - 1, 0),
      );
      return;
    }

    if (key === "Enter") {
      event.preventDefault();
      const option = options[highlight];
      if (option) {
        toggleOption(option);
      }
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const index = resolveTypeaheadIndex(options, key, typeaheadRef.current, highlight);
    if (index === null) {
      return;
    }
    event.preventDefault();
    focusOption(index);
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
          aria-controls={open ? listId : undefined}
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
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleTriggerKeyDown}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        >
          <span className={value.length ? "" : shared.placeholder}>{summary}</span>
          <span aria-hidden="true" className={shared.chevron} />
        </button>
        {open ? (
          <div className={shared.panel}>
            <div
              aria-label={label}
              aria-multiselectable="true"
              className={shared.list}
              id={listId}
              onKeyDown={handleListKeyDown}
              role="listbox"
            >
              {options.map((option, index) => (
                <label
                  className={[shared.option, highlight === index ? styles.optionHighlighted : ""]
                    .filter(Boolean)
                    .join(" ")}
                  key={option}
                  onMouseEnter={() => setHighlight(index)}
                >
                  <input
                    checked={value.includes(option)}
                    disabled={disabled}
                    ref={(node) => {
                      optionRefs.current[index] = node;
                    }}
                    type="checkbox"
                    onChange={() => toggleOption(option)}
                    onFocus={() => setHighlight(index)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
