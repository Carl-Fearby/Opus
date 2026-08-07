"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEventHandler,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { CatalogIcon } from "@/components/CatalogIcon";
import {
  resolveEmojiPickerPortalStyle,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import {
  emitDateInputChange,
  formatWeekDisplay,
  formatWeekRangeLabel,
  formatWeekValue,
  getISOWeekParts,
  getISOWeeksInYear,
  parseWeekValue,
} from "./datePickerUtils";
import triggerStyles from "./OpusDateInput.module.css";
import styles from "./OpusWeekInput.module.css";

export type OpusWeekInputProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  className?: string;
  disabled?: boolean;
  id: string;
  label: string;
  max?: string;
  min?: string;
  name?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value: string;
};

function isWeekDisabled(year: number, week: number, min?: string, max?: string) {
  const key = formatWeekValue(year, week);
  if (min && key < min) return true;
  if (max && key > max) return true;
  return false;
}

export function OpusWeekInput({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className,
  disabled,
  id,
  label,
  max,
  min,
  name,
  onChange,
  placeholder = "Select week",
  readOnly,
  required,
  value,
}: OpusWeekInputProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const selected = parseWeekValue(value);
  const today = useMemo(() => new Date(), []);
  const thisWeek = useMemo(() => getISOWeekParts(today), [today]);
  const thisWeekKey = formatWeekValue(thisWeek.year, thisWeek.week);
  const [cursorYear, setCursorYear] = useState(() => selected?.year ?? thisWeek.year);
  const display = formatWeekDisplay(value);
  const canOpen = !disabled && !readOnly;
  const weeksInYear = getISOWeeksInYear(cursorYear);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) {
      setCursorYear(selected?.year ?? thisWeek.year);
    }
  }, [open, selected?.year, thisWeek.year]);

  useEffect(() => {
    if (!open) return;
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [open, cursorYear, value]);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPortalStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = rootRef.current;
      if (!anchor) return;
      setPortalStyle(
        resolveEmojiPickerPortalStyle(
          anchor.getBoundingClientRect(),
          panelRef.current?.getBoundingClientRect() ?? null,
          "bottom",
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
  }, [open, cursorYear, value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function commit(next: string) {
    emitDateInputChange(onChange, next, name);
  }

  function toggle() {
    if (!canOpen) return;
    setOpen((current) => !current);
  }

  function selectWeek(week: number) {
    if (isWeekDisabled(cursorYear, week, min, max)) return;
    commit(formatWeekValue(cursorYear, week));
    setOpen(false);
  }

  const panel =
    open && portalReady && portalStyle
      ? createPortal(
          <div
            className={triggerStyles.portal}
            data-portaled="true"
            id={panelId}
            ref={panelRef}
            style={
              {
                left: portalStyle.left,
                top: portalStyle.top,
              } as CSSProperties
            }
          >
            <div className={styles.panel} role="dialog" aria-label={label}>
              <div className={styles.toolbar}>
                <button
                  aria-label="Previous year"
                  className={styles.nav}
                  type="button"
                  onClick={() => setCursorYear((year) => year - 1)}
                >
                  ‹
                </button>
                <strong className={styles.year}>{cursorYear}</strong>
                <button
                  aria-label="Next year"
                  className={styles.nav}
                  type="button"
                  onClick={() => setCursorYear((year) => year + 1)}
                >
                  ›
                </button>
              </div>
              <div className={styles.list} role="listbox" aria-label={`${cursorYear} weeks`}>
                {Array.from({ length: weeksInYear }, (_, index) => {
                  const week = index + 1;
                  const key = formatWeekValue(cursorYear, week);
                  const isSelected = value === key;
                  const isCurrent = key === thisWeekKey;
                  const weekDisabled = isWeekDisabled(cursorYear, week, min, max);
                  return (
                    <button
                      aria-current={isCurrent ? "date" : undefined}
                      aria-selected={isSelected}
                      className={[
                        styles.week,
                        isSelected ? styles.selected : "",
                        isCurrent ? styles.current : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={weekDisabled}
                      key={key}
                      ref={isSelected ? selectedRef : undefined}
                      role="option"
                      type="button"
                      onClick={() => selectWeek(week)}
                    >
                      <span className={styles.weekNumber}>W{String(week).padStart(2, "0")}</span>
                      <span className={styles.weekRange}>{formatWeekRangeLabel(cursorYear, week)}</span>
                    </button>
                  );
                })}
              </div>
              <div className={styles.footer}>
                <button
                  className={styles.footerAction}
                  type="button"
                  onClick={() => {
                    commit("");
                    setOpen(false);
                  }}
                >
                  Clear
                </button>
                <button
                  className={styles.footerAction}
                  disabled={isWeekDisabled(thisWeek.year, thisWeek.week, min, max)}
                  type="button"
                  onClick={() => {
                    setCursorYear(thisWeek.year);
                    commit(thisWeekKey);
                    setOpen(false);
                  }}
                >
                  This week
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={triggerStyles.root} ref={rootRef}>
      <button
        aria-controls={open ? panelId : undefined}
        aria-describedby={ariaDescribedBy}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-invalid={ariaInvalid}
        aria-label={label}
        className={[triggerStyles.control, className].filter(Boolean).join(" ")}
        disabled={disabled}
        id={id}
        type="button"
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggle();
          }
        }}
      >
        <span className={display ? triggerStyles.value : triggerStyles.placeholder}>
          {display || placeholder}
        </span>
        <span aria-hidden="true" className={triggerStyles.icon}>
          <CatalogIcon iconName="calendar-week" />
        </span>
      </button>
      <input
        aria-hidden="true"
        className={triggerStyles.hiddenInput}
        disabled={disabled}
        name={name}
        readOnly
        required={required}
        tabIndex={-1}
        type="text"
        value={value}
      />
      {panel}
    </div>
  );
}
