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
import { emitDateInputChange, formatDateDisplay } from "./datePickerUtils";
import styles from "./OpusDateInput.module.css";

export type OpusDateInputProps = {
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

export function OpusDateInput({
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
  placeholder = "Select date",
  readOnly,
  required,
  value,
}: OpusDateInputProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const display = formatDateDisplay(value);
  const canOpen = !disabled && !readOnly;

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

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
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggle() {
    if (!canOpen) return;
    setOpen((current) => !current);
  }

  function handleSelect(next: string) {
    emitDateInputChange(onChange, next, name);
  }

  const panel =
    open && portalReady && portalStyle
      ? createPortal(
          <div
            className={styles.portal}
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
              max={max}
              min={min}
              value={value}
              onClose={() => setOpen(false)}
              onSelect={handleSelect}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        aria-controls={open ? panelId : undefined}
        aria-describedby={ariaDescribedBy}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-invalid={ariaInvalid}
        aria-label={label}
        className={[styles.control, className].filter(Boolean).join(" ")}
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
        <span className={display ? styles.value : styles.placeholder}>
          {display || placeholder}
        </span>
        <span aria-hidden="true" className={styles.icon}>
          <CatalogIcon iconName="calendar" />
        </span>
      </button>
      {/* Keep a hidden input for native form posts / autofill semantics. */}
      <input
        aria-hidden="true"
        className={styles.hiddenInput}
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
