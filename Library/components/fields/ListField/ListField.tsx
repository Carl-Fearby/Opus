"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useOpusI18n } from "@/components/OpusI18n";
import { useEffect, useId, useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import styles from "./ListField.module.css";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { Button } from "../Button";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type {
  ControlRadius,
  ControlTransparency,
  FieldMode,
  InputControlSize,
  LabelPosition,
} from "@/components/fields/types";

const AUTO_SCROLL_EDGE = 28;
const AUTO_SCROLL_STEP = 14;

export type ListFieldProps = {
  addLabel?: string;
  disabled?: boolean;
  emptyMessage?: string;
  error?: string;
  gradient?: boolean;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  onChange: (value: string[]) => void;
  placeholder?: string;
  radius?: ControlRadius;
  readOnly?: boolean;
  reorderable?: boolean;
  required?: boolean;
  size?: InputControlSize;
  transparency?: ControlTransparency;
  value: string[];
};

export function ListField({
  addLabel,
  disabled = false,
  emptyMessage,
  error,
  gradient,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  onChange,
  placeholder = "Add an entry…",
  radius,
  readOnly = false,
  reorderable = true,
  required,
  size = "md",
  transparency,
  value,
}: ListFieldProps) {
  const { t } = useOpusI18n();
  const autoId = useId();
  const fieldId = id || `list-field-${autoId}`;
  const shellAria = useFieldShellAria();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const entriesRef = useRef(value);
  entriesRef.current = value;
  const autoScrollFrame = useRef<number | null>(null);
  const autoScrollDirection = useRef<-1 | 0 | 1>(0);
  const [draft, setDraft] = useState("");
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [dropAtEnd, setDropAtEnd] = useState(false);

  const locked = disabled || readOnly;
  const canAdd = !locked && draft.trim().length > 0;
  const canReorder = reorderable && !locked;

  const stopAutoScroll = () => {
    autoScrollDirection.current = 0;
    if (autoScrollFrame.current !== null) {
      window.cancelAnimationFrame(autoScrollFrame.current);
      autoScrollFrame.current = null;
    }
  };

  useEffect(() => stopAutoScroll, []);

  const startAutoScroll = (direction: -1 | 1, viewport: HTMLElement) => {
    if (autoScrollDirection.current === direction && autoScrollFrame.current !== null) {
      return;
    }

    stopAutoScroll();
    autoScrollDirection.current = direction;

    const step = () => {
      if (autoScrollDirection.current === 0) {
        autoScrollFrame.current = null;
        return;
      }

      const before = viewport.scrollTop;
      viewport.scrollBy({ top: autoScrollDirection.current * AUTO_SCROLL_STEP });

      if (viewport.scrollTop === before) {
        autoScrollDirection.current = 0;
        autoScrollFrame.current = null;
        return;
      }

      autoScrollFrame.current = window.requestAnimationFrame(step);
    };

    autoScrollFrame.current = window.requestAnimationFrame(step);
  };

  const addEntry = () => {
    const next = draft.trim();
    if (locked || !next) {
      return;
    }

    const current = entriesRef.current;
    if (!current.includes(next)) {
      onChange([...current, next]);
    }

    setDraft("");
    inputRef.current?.focus();
  };

  const removeEntry = (index: number) => {
    if (locked) {
      return;
    }

    onChange(entriesRef.current.filter((_, entryIndex) => entryIndex !== index));
    inputRef.current?.focus();
  };

  const moveEntry = (from: number, to: number) => {
    const current = entriesRef.current;
    if (locked || from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) {
      return;
    }

    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  /** Resolves the insertion point from the pointer, including the space past the final row. */
  const resolveDrop = (pointerY: number) => {
    const list = listRef.current;
    const rows = list ? (Array.from(list.children) as HTMLElement[]) : [];
    if (rows.length === 0) {
      return null;
    }

    for (let index = 0; index < rows.length; index += 1) {
      const rect = rows[index].getBoundingClientRect();
      if (pointerY < rect.top + rect.height / 2) {
        return { afterLast: false, index };
      }
    }

    return { afterLast: true, index: rows.length - 1 };
  };

  /** Keeps the list scrolling while the pointer is held near the top or bottom of the viewport. */
  const updateAutoScroll = (pointerY: number) => {
    const viewport = listRef.current
      ?.closest("[data-custom-scrollbar-root]")
      ?.querySelector<HTMLElement>('[role="region"]');

    if (!viewport || viewport.scrollHeight <= viewport.clientHeight) {
      stopAutoScroll();
      return;
    }

    const rect = viewport.getBoundingClientRect();
    if (pointerY < rect.top + AUTO_SCROLL_EDGE) {
      startAutoScroll(-1, viewport);
      return;
    }

    if (pointerY > rect.bottom - AUTO_SCROLL_EDGE) {
      startAutoScroll(1, viewport);
      return;
    }

    stopAutoScroll();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || locked) {
      return;
    }

    event.preventDefault();
    addEntry();
  };

  const handleDragStart = (index: number) => (event: DragEvent<HTMLLIElement>) => {
    if (!canReorder) {
      return;
    }

    setDraggingIndex(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", String(index));
    }
  };

  const handleListDragOver = (event: DragEvent<HTMLUListElement>) => {
    if (!canReorder) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }

    const target = resolveDrop(event.clientY);
    if (target) {
      setOverIndex(target.index);
      setDropAtEnd(target.afterLast);
    }

    updateAutoScroll(event.clientY);
  };

  const handleListDrop = (event: DragEvent<HTMLUListElement>) => {
    if (!canReorder) {
      return;
    }

    event.preventDefault();
    stopAutoScroll();

    const target = resolveDrop(event.clientY);
    const carried = event.dataTransfer?.getData("text/plain");
    const parsed = carried === undefined || carried === "" ? Number.NaN : Number(carried);
    const from = draggingIndex ?? (Number.isInteger(parsed) ? parsed : null);

    if (from !== null && target) {
      moveEntry(from, target.index);
    }

    setDraggingIndex(null);
    setOverIndex(null);
    setDropAtEnd(false);
  };

  const handleListDragLeave = (event: DragEvent<HTMLUListElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) {
      setOverIndex(null);
      setDropAtEnd(false);
      stopAutoScroll();
    }
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setOverIndex(null);
    setDropAtEnd(false);
    stopAutoScroll();
  };

  const entriesLabel = t("listField.entries", "{label} entries", { label });

  return (
    <FieldShell
      className={styles.shell}
      error={error}
      help={help}
      id={fieldId}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
      radius={radius}
      transparency={transparency}
      gradient={gradient}
    >
      <div
        aria-disabled={disabled ? "true" : undefined}
        className={styles.body}
        data-read-only={readOnly ? "true" : undefined}
      >
        {!readOnly ? (
          <div className={[styles.composer, inputControlSizeClassName[size]].join(" ")}>
            <input
              ref={inputRef}
              aria-invalid={error ? "true" : undefined}
              aria-label={t("listField.input", "{label} entry", { label })}
              className={[shared.input, error ? shared.error : ""].filter(Boolean).join(" ")}
              disabled={disabled}
              id={fieldId}
              placeholder={placeholder}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
            />
            <Button
              disabled={!canAdd}
              radius={radius}
              size={size}
              type="button"
              variant="secondary"
              onClick={addEntry}
            >
              {addLabel ?? t("listField.add", "Add")}
            </Button>
          </div>
        ) : null}

        <div className={styles.scrollArea}>
          <CustomScrollbar autoHide={false} label={entriesLabel} orientation="vertical">
            {value.length > 0 ? (
              <ul
                ref={listRef}
                aria-label={entriesLabel}
                className={styles.list}
                onDragLeave={handleListDragLeave}
                onDragOver={handleListDragOver}
                onDrop={handleListDrop}
              >
                {value.map((entry, index) => {
                  const isLast = index === value.length - 1;
                  const showTopEdge =
                    draggingIndex !== null && overIndex === index && !dropAtEnd && draggingIndex !== index;
                  const showBottomEdge =
                    draggingIndex !== null && dropAtEnd && overIndex === value.length - 1 && isLast;

                  return (
                    <li
                      className={[
                        styles.row,
                        draggingIndex === index ? styles.rowDragging : "",
                        showTopEdge ? styles.rowOver : "",
                        showBottomEdge ? styles.rowOverEnd : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      draggable={canReorder}
                      key={`${entry}-${index}`}
                      onDragEnd={handleDragEnd}
                      onDragStart={handleDragStart(index)}
                    >
                      {canReorder ? (
                        <span aria-hidden="true" className={styles.handle}>
                          <FontAwesomeIcon icon={faGripVertical} />
                        </span>
                      ) : null}
                      <span className={styles.rowLabel}>{entry}</span>
                      {!readOnly ? (
                        <Button
                          aria-label={t("listField.remove", "Remove {entry}", { entry })}
                          className={styles.removeButton}
                          disabled={disabled}
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={() => removeEntry(index)}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </Button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.empty}>{emptyMessage ?? t("listField.empty", "No entries yet")}</p>
            )}
          </CustomScrollbar>
        </div>
      </div>
    </FieldShell>
  );
}
