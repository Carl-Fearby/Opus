"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
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
  formatTimeDisplay,
  formatTimeValue,
  parseTimeValue,
} from "./datePickerUtils";
import triggerStyles from "./OpusDateInput.module.css";
import styles from "./OpusTimeInput.module.css";

export type OpusTimeInputProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  className?: string;
  disabled?: boolean;
  id: string;
  label: string;
  name?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value: string;
};

const hourOptions = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const minuteOptions = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0"));

function TimeColumn({
  label: columnLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, [value]);

  return (
    <div className={styles.column}>
      <span className={styles.columnLabel}>{columnLabel}</span>
      <div aria-label={columnLabel} className={styles.columnList} role="listbox">
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              aria-selected={selected}
              className={[styles.option, selected ? styles.optionSelected : ""]
                .filter(Boolean)
                .join(" ")}
              key={option}
              ref={selected ? selectedRef : undefined}
              role="option"
              type="button"
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OpusTimeInput({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  className,
  disabled,
  id,
  label,
  name,
  onChange,
  placeholder = "Select time",
  readOnly,
  required,
  value,
}: OpusTimeInputProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const parsed = parseTimeValue(value);
  const [draftHours, setDraftHours] = useState(parsed.hours);
  const [draftMinutes, setDraftMinutes] = useState(parsed.minutes);
  const display = formatTimeDisplay(value);
  const canOpen = !disabled && !readOnly;

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) {
      const next = parseTimeValue(value);
      setDraftHours(next.hours);
      setDraftMinutes(next.minutes);
    }
  }, [open, value]);

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
  }, [open, draftHours, draftMinutes]);

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

  function commit(hours: string, minutes: string) {
    emitDateInputChange(onChange, formatTimeValue(hours, minutes), name);
  }

  function toggle() {
    if (!canOpen) return;
    setOpen((current) => !current);
  }

  function handleNow() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setDraftHours(hours);
    setDraftMinutes(minutes);
    commit(hours, minutes);
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
              <p className={styles.preview} aria-live="polite">
                {formatTimeValue(draftHours, draftMinutes)}
              </p>
              <div className={styles.columns}>
                <TimeColumn
                  label="Hour"
                  options={hourOptions}
                  value={draftHours}
                  onChange={(hours) => {
                    setDraftHours(hours);
                    commit(hours, draftMinutes);
                  }}
                />
                <TimeColumn
                  label="Minute"
                  options={minuteOptions}
                  value={draftMinutes}
                  onChange={(minutes) => {
                    setDraftMinutes(minutes);
                    commit(draftHours, minutes);
                  }}
                />
              </div>
              <div className={styles.footer}>
                <button
                  className={styles.footerAction}
                  type="button"
                  onClick={() => {
                    setDraftHours("09");
                    setDraftMinutes("00");
                    emitDateInputChange(onChange, "", name);
                    setOpen(false);
                  }}
                >
                  Clear
                </button>
                <button className={styles.footerAction} type="button" onClick={handleNow}>
                  Now
                </button>
                <button
                  className={styles.footerActionPrimary}
                  type="button"
                  onClick={() => {
                    commit(draftHours, draftMinutes);
                    setOpen(false);
                  }}
                >
                  Done
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
          <CatalogIcon iconName="clock" />
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
