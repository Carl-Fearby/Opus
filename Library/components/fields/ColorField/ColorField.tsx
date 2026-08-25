"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import styles from "./ColorField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import {
  resolveEmojiPickerPortalStyle,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import { ColorPickerPanel } from "../ColorPickerPanel";
import { normalizeHex } from "../ColorPickerPanel/colorPickerUtils";

type ColorFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  size?: InputControlSize;
  value: string;
};

function emitColorChange(
  onChange: ChangeEventHandler<HTMLInputElement>,
  nextValue: string,
) {
  const target = {
    name: "",
    type: "color",
    value: nextValue,
  } as HTMLInputElement;
  onChange({
    target,
    currentTarget: target,
  } as ChangeEvent<HTMLInputElement>);
}

export function ColorField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  onChange,
  size = "md",
  value,
}: ColorFieldProps) {
  const shellAria = useFieldShellAria();
  const ariaProps = fieldInputAriaProps(shellAria, { invalid: Boolean(error) });
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const hex = (normalizeHex(value) ?? "#8f6cff").toUpperCase();

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
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const panel =
    open && portalReady && portalStyle
      ? createPortal(
          <div
            className={styles.portal}
            data-portaled="true"
            id={panelId}
            ref={panelRef}
            style={{ left: portalStyle.left, top: portalStyle.top } as CSSProperties}
          >
            <ColorPickerPanel
              value={hex}
              onClose={() => setOpen(false)}
              onSelect={(next) => emitColorChange(onChange, next)}
            />
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
      labelTag="div"
      mode={mode}
    >
      <div className={styles.root} ref={rootRef}>
        <button
          aria-controls={open ? panelId : undefined}
          aria-describedby={ariaProps["aria-describedby"]}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={label}
          className={[
            styles.picker,
            inputControlSizeClassName[size],
            error ? styles.error : "",
          ]
            .filter(Boolean)
            .join(" ")}
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
        >
          <span aria-hidden="true" className={styles.swatch} style={{ background: hex }} />
          <span className={styles.value}>{hex}</span>
          <span aria-hidden="true" className={styles.icon}>
            <span />
            <span />
          </span>
        </button>
        {panel}
      </div>
    </FieldShell>
  );
}
