"use client";

import { useOpusI18n } from "@/components/OpusI18n";
import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Portal } from "@/components/Portal";
import { useOverlayAccessibility } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./BottomSheet.module.css";

type SheetPhase = "opening" | "closing";
export type BottomSheetSize = "content" | "half" | "full";

const EXIT_ANIMATION_MS = 180;
const DISMISS_DRAG_DISTANCE = 88;

export type BottomSheetProps = {
  actions?: ReactNode;
  children: ReactNode;
  closeButton?: boolean;
  description?: string;
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  /** How much of the viewport the sheet is allowed to occupy. */
  size?: BottomSheetSize;
  title: string;
  /** Adds a draggable handle and enables swipe-down to dismiss. */
  showHandle?: boolean;
};

export function BottomSheet({
  actions,
  children,
  closeButton = true,
  description,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  footer,
  onClose,
  open,
  size = "content",
  title,
  showHandle = true,
}: BottomSheetProps) {
  const { t } = useOpusI18n();
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragStartRef = useRef<number | null>(null);
  const [rendered, setRendered] = useState(open);
  const [phase, setPhase] = useState<SheetPhase>("opening");
  const [dragOffset, setDragOffset] = useState(0);

  useOverlayAccessibility(open && rendered, panelRef, {
    initialFocusRef: closeButton ? closeRef : undefined,
  });

  useEffect(() => {
    let timeout: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (open) {
        setRendered(true);
        setPhase("opening");
        setDragOffset(0);
        return;
      }

      setPhase("closing");
      timeout = window.setTimeout(() => setRendered(false), EXIT_ANIMATION_MS);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !dismissOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissOnEscape, onClose, open]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!showHandle) return;
    dragStartRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current === null) return;
    setDragOffset(Math.max(0, event.clientY - dragStartRef.current));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current === null) return;
    const offset = Math.max(0, event.clientY - dragStartRef.current);
    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (offset >= DISMISS_DRAG_DISTANCE) {
      onClose();
      return;
    }

    setDragOffset(0);
  }

  if (!rendered) {
    return null;
  }

  return (
    <Portal>
      <div
        className={styles.backdrop}
        data-dismissible={dismissOnBackdrop}
        data-phase={phase}
        onMouseDown={(event) => {
          if (event.currentTarget === event.target && dismissOnBackdrop) onClose();
        }}
      >
        <section
          ref={panelRef}
          aria-describedby={description ? descriptionId : undefined}
          aria-labelledby={titleId}
          aria-modal="true"
          className={styles.sheet}
          data-dragging={dragOffset > 0 ? "true" : undefined}
          data-phase={phase}
          data-size={size}
          role="dialog"
          style={dragOffset > 0 ? { transform: `translateY(${dragOffset}px)` } : undefined}
        >
          {showHandle ? (
            <div
              aria-hidden="true"
              className={styles.handle}
              onPointerCancel={handlePointerUp}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <span className={styles.handleBar} />
            </div>
          ) : null}
          <header className={styles.header}>
            <div className={styles.heading}>
              <h2 className={styles.title} id={titleId}>
                {title}
              </h2>
              {description ? (
                <p className={styles.description} id={descriptionId}>
                  {description}
                </p>
              ) : null}
            </div>
            {closeButton ? (
              <button
                ref={closeRef}
                aria-label={t("bottomSheet.close", "Close sheet")}
                className={styles.close}
                onClick={onClose}
                type="button"
              >
                <svg aria-hidden="true" className={styles.closeIcon} viewBox="0 0 16 16">
                  <path
                    d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.75"
                  />
                </svg>
              </button>
            ) : null}
          </header>
          <div className={styles.body}>{children}</div>
          {footer || actions ? (
            <footer className={styles.footer}>
              {footer ? <div className={styles.footerContent}>{footer}</div> : null}
              {actions ? <div className={styles.actions}>{actions}</div> : null}
            </footer>
          ) : null}
        </section>
      </div>
    </Portal>
  );
}
