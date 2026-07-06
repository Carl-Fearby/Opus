"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { GalleryImage } from "@/components/fields/types";
import "@/lib/fontawesome";
import { useOverlayAccessibility } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./Lightbox.module.css";

type LightboxProps = {
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  image: GalleryImage;
  open?: boolean;
  showCaption?: boolean;
  trigger?: ReactNode;
  triggerLabel?: string;
  triggerVariant?: "button" | "image";
  onOpenChange?: (open: boolean) => void;
};

export function Lightbox({
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  image,
  open,
  showCaption = true,
  trigger,
  triggerLabel = "Open lightbox",
  triggerVariant = "button",
  onOpenChange,
}: LightboxProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const [isRendered, setIsRendered] = useState(isOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);
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

    const timeout = window.setTimeout(() => {
      setIsRendered(false);
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [isOpen, isRendered]);

  const dialogLabel = image.caption ?? image.alt ?? triggerLabel;

  return (
    <div className={styles.lightbox} data-trigger-variant={triggerVariant}>
      <button
        ref={triggerRef}
        aria-label={trigger ? triggerLabel : undefined}
        className={styles.trigger}
        data-variant={triggerVariant}
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
            aria-label={dialogLabel}
            aria-modal="true"
            className={styles.frame}
            role="dialog"
          >
            <button
              ref={closeRef}
              aria-label="Close lightbox"
              className={styles.close}
              type="button"
              onClick={() => setOpen(false)}
            >
              <FontAwesomeIcon aria-hidden="true" className={styles.closeIcon} icon={faXmark} />
            </button>
            <figure className={styles.panel}>
              <img alt={image.alt} className={styles.image} src={image.src} />
              {showCaption && image.caption ? (
                <figcaption className={styles.caption}>{image.caption}</figcaption>
              ) : null}
            </figure>
          </div>
        </div>
      ) : null}
    </div>
  );
}
