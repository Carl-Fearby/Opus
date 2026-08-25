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
import { DatePickerPanel } from "./DatePickerPanel";
import {
  emitDateInputChange,
  formatDateTimeDisplay,
  formatDateTimeLocal,
  parseDateTimeLocal,
} from "./datePickerUtils";
import triggerStyles from "./OpusDateInput.module.css";
import styles from "./OpusDateTimeInput.module.css";

export type OpusDateTimeInputProps = {
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

const hourOptions = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const minuteOptions = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0"));

export function OpusDateTimeInput({
  "aria-describedby": ariaDescribedBy,
  className,
  disabled,
  id,
  label,
  max,
  min,
  name,
  onChange,
  placeholder = "Select date and time",
  readOnly,
  required,
  value,
}: OpusDateTimeInputProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const parsed = parseDateTimeLocal(value);
  const [draftDate, setDraftDate] = useState(parsed.date);
  const [draftHours, setDraftHours] = useState(parsed.hours);
  const [draftMinutes, setDraftMinutes] = useState(parsed.minutes);
  const display = formatDateTimeDisplay(value);
  const canOpen = !disabled && !readOnly;
  const dateMin = min?.slice(0, 10);
  const dateMax = max?.slice(0, 10);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!open) {
      const next = parseDateTimeLocal(value);
      setDraftDate(next.date);
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
  }, [open, draftDate, draftHours, draftMinutes]);

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

  function commit(date: string, hours: string, minutes: string) {
    emitDateInputChange(onChange, formatDateTimeLocal(date, hours, minutes), name);
  }

  function toggle() {
    if (!canOpen) return;
    setOpen((current) => !current);
  }

  function handleNow() {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    setDraftDate(date);
    setDraftHours(hours);
    setDraftMinutes(minutes);
    commit(date, hours, minutes);
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
            <DatePickerPanel
              closeOnSelect={false}
              max={dateMax}
              min={dateMin}
              showFooter={false}
              value={draftDate}
              onSelect={(nextDate) => {
                setDraftDate(nextDate);
                commit(nextDate, draftHours, draftMinutes);
              }}
              extra={
                <>
                  <div className={styles.timeRow}>
                    <label className={styles.timeField}>
                      <span>Hour</span>
                      <select
                        aria-label="Hour"
                        className={styles.timeSelect}
                        value={draftHours}
                        onChange={(event) => {
                          const hours = event.target.value;
                          setDraftHours(hours);
                          if (draftDate) commit(draftDate, hours, draftMinutes);
                        }}
                      >
                        {hourOptions.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={styles.timeField}>
                      <span>Minute</span>
                      <select
                        aria-label="Minute"
                        className={styles.timeSelect}
                        value={draftMinutes}
                        onChange={(event) => {
                          const minutes = event.target.value;
                          setDraftMinutes(minutes);
                          if (draftDate) commit(draftDate, draftHours, minutes);
                        }}
                      >
                        {minuteOptions.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className={styles.footer}>
                    <button
                      className={styles.footerAction}
                      type="button"
                      onClick={() => {
                        setDraftDate("");
                        setDraftHours("09");
                        setDraftMinutes("00");
                        commit("", "09", "00");
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
                        if (draftDate) commit(draftDate, draftHours, draftMinutes);
                        setOpen(false);
                      }}
                    >
                      Done
                    </button>
                  </div>
                </>
              }
            />
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
