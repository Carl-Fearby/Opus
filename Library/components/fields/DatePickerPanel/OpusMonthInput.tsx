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
  formatMonthDisplay,
  formatMonthValue,
  parseMonthValue,
} from "./datePickerUtils";
import triggerStyles from "./OpusDateInput.module.css";
import styles from "./OpusMonthInput.module.css";

export type OpusMonthInputProps = {
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

const monthLabels = Array.from({ length: 12 }, (_, month) =>
  new Date(2000, month, 1).toLocaleString(undefined, { month: "short" }),
);

function isMonthDisabled(year: number, month: number, min?: string, max?: string) {
  const key = formatMonthValue(year, month);
  if (min && key < min) return true;
  if (max && key > max) return true;
  return false;
}

export function OpusMonthInput({
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
  placeholder = "Select month",
  readOnly,
  required,
  value,
}: OpusMonthInputProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const selected = parseMonthValue(value);
  const today = useMemo(() => new Date(), []);
  const [cursorYear, setCursorYear] = useState(() => selected?.year ?? today.getFullYear());
  const display = formatMonthDisplay(value);
  const canOpen = !disabled && !readOnly;
  const thisMonthKey = formatMonthValue(today.getFullYear(), today.getMonth() + 1);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) {
      setCursorYear(selected?.year ?? today.getFullYear());
    }
  }, [open, selected?.year, today]);

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

  function selectMonth(month: number) {
    if (isMonthDisabled(cursorYear, month, min, max)) return;
    commit(formatMonthValue(cursorYear, month));
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
              <div className={styles.grid}>
                {monthLabels.map((labelText, index) => {
                  const month = index + 1;
                  const key = formatMonthValue(cursorYear, month);
                  const isSelected = value === key;
                  const isCurrent = key === thisMonthKey;
                  const monthDisabled = isMonthDisabled(cursorYear, month, min, max);
                  return (
                    <button
                      aria-current={isCurrent ? "date" : undefined}
                      aria-pressed={isSelected}
                      className={[
                        styles.month,
                        isSelected ? styles.selected : "",
                        isCurrent ? styles.current : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={monthDisabled}
                      key={key}
                      type="button"
                      onClick={() => selectMonth(month)}
                    >
                      {labelText}
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
                  disabled={isMonthDisabled(today.getFullYear(), today.getMonth() + 1, min, max)}
                  type="button"
                  onClick={() => {
                    setCursorYear(today.getFullYear());
                    commit(thisMonthKey);
                    setOpen(false);
                  }}
                >
                  This month
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
          <CatalogIcon iconName="calendar" />
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
