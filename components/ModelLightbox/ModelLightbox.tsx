"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ModelAsset } from "@/components/fields/types";
import { ModelViewer } from "@/components/ModelViewer";
import "@/lib/fontawesome";
import { useOverlayAccessibility } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./ModelLightbox.module.css";

type ModelLightboxProps = {
  asset: ModelAsset;
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  open?: boolean;
  showCaption?: boolean;
  trigger?: ReactNode;
  triggerLabel?: string;
  onOpenChange?: (open: boolean) => void;
};

export function ModelLightbox({
  asset,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  open,
  showCaption = true,
  trigger,
  triggerLabel = "Open 3D asset",
  onOpenChange,
}: ModelLightboxProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const [isRendered, setIsRendered] = useState(isOpen);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const setOpen = useCallback((nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }, [isControlled, onOpenChange]);

  useOverlayAccessibility(isOpen && isRendered, panelRef, {
    initialFocusRef: closeRef,
    restoreFocus: true,
  });

  useEffect(() => {
    if (!isOpen || !dismissOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissOnEscape, isOpen, setOpen]);

  useEffect(() => {
    if (isOpen) {
      const timeout = window.setTimeout(() => setIsRendered(true), 0);

      return () => window.clearTimeout(timeout);
    }

    if (!isRendered) {
      return;
    }

    const timeout = window.setTimeout(() => setIsRendered(false), 180);

    return () => window.clearTimeout(timeout);
  }, [isOpen, isRendered]);

  return (
    <div className={styles.lightbox}>
      <button
        aria-label={trigger ? triggerLabel : undefined}
        className={styles.trigger}
        data-custom={trigger ? "true" : "false"}
        type="button"
        onClick={() => setOpen(true)}
      >
        {trigger ?? <span>{triggerLabel}</span>}
      </button>

      {isOpen || isRendered ? (
        <div
          className={styles.overlay}
          data-state={isOpen ? "open" : "closing"}
          onMouseDown={(event) => {
            if (dismissOnBackdrop && event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            ref={panelRef}
            aria-label={asset.name}
            aria-modal="true"
            className={styles.frame}
            role="dialog"
          >
            <button
              ref={closeRef}
              aria-label="Close 3D asset preview"
              className={styles.close}
              type="button"
              onClick={() => setOpen(false)}
            >
              <FontAwesomeIcon aria-hidden="true" className={styles.closeIcon} icon={faXmark} />
            </button>
            <ModelViewer asset={asset} height="lightbox" showCaption={showCaption} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
