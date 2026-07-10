"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import type { DrawerSide } from "@/components/fields/types";
import { Button } from "@/components/fields/Button";
import { Portal } from "@/components/Portal";
import { useOverlayAccessibility } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./Drawer.module.css";

type DrawerPhase = "opening" | "closing";

const EXIT_ANIMATION_MS = 180;

type DrawerProps = {
  actions?: ReactNode;
  children: ReactNode;
  closeButton?: boolean;
  description?: string;
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  footer?: ReactNode;
  onClose: () => void;
  open: boolean;
  side?: DrawerSide;
  title: string;
};

export function Drawer({
  actions,
  children,
  closeButton = true,
  description,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  footer,
  onClose,
  open,
  side = "right",
  title,
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [rendered, setRendered] = useState(open);
  const [phase, setPhase] = useState<DrawerPhase>("opening");

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
    <Portal>
      <div
        className={styles.backdrop}
        data-dismissible={dismissOnBackdrop}
        data-phase={phase}
        data-side={side}
        onMouseDown={(event) => {
          if (event.currentTarget === event.target && dismissOnBackdrop) {
            onClose();
          }
        }}
      >
        <aside
          ref={panelRef}
          aria-describedby={description ? descriptionId : undefined}
          aria-labelledby={titleId}
          aria-modal="true"
          className={styles.drawer}
          data-phase={phase}
          data-side={side}
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
                aria-label="Close drawer"
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
        </aside>
      </div>
    </Portal>
  );
}

export function DrawerDefaultActions({ onClose }: { onClose: () => void }) {
  return (
    <>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onClose}>
        Apply
      </Button>
    </>
  );
}
