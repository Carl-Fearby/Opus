"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import type { ModalSize } from "@/components/fields/types";
import { Button } from "@/components/fields/Button";
import { useOverlayAccessibility } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./Modal.module.css";

type ModalPhase = "opening" | "closing";

const EXIT_ANIMATION_MS = 180;

type ModalProps = {
  actions?: ReactNode;
  children: ReactNode;
  closeButton?: boolean;
  description?: string;
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  size?: ModalSize;
  title: string;
};

export function Modal({
  actions,
  children,
  closeButton = true,
  description,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  footer,
  onClose,
  open,
  size = "medium",
  title,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [rendered, setRendered] = useState(open);
  const [phase, setPhase] = useState<ModalPhase>("opening");

  useOverlayAccessibility(open && rendered, panelRef, {
    initialFocusRef: closeButton ? closeRef : undefined,
  });

  useEffect(() => {
    let timeout: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (open) {
        setRendered(true);
        setPhase("opening");
        return;
      }

      setPhase("closing");
      timeout = window.setTimeout(() => setRendered(false), EXIT_ANIMATION_MS);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !dismissOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissOnEscape, onClose, open]);

  if (!rendered) {
    return null;
  }

  return (
    <div
      className={styles.backdrop}
      data-dismissible={dismissOnBackdrop}
      data-phase={phase}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && dismissOnBackdrop) {
          onClose();
        }
      }}
    >
      <section
        ref={panelRef}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={styles.modal}
        data-phase={phase}
        data-size={size}
        role="dialog"
      >
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
              aria-label="Close modal"
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
  );
}

export function ModalDefaultActions({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onClose}>
        Save changes
      </Button>
    </>
  );
}
