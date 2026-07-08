"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { getFocusableElements } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./FocusTrap.module.css";

type FocusTrapProps = {
  active?: boolean;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
};

export function FocusTrap({
  active = true,
  children,
  initialFocusRef,
  restoreFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => {
      const preferred = initialFocusRef?.current;
      if (preferred) {
        preferred.focus();
        return;
      }
      const container = containerRef.current;
      if (!container) {
        return;
      }
      getFocusableElements(container)[0]?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (restoreFocus) {
        previouslyFocusedRef.current?.focus?.();
      }
    };
  }, [active, initialFocusRef, restoreFocus]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const focusable = getFocusableElements(container);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (activeElement === first || !container.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (activeElement === last || !container.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);

  return (
    <div className={styles.trap} data-active={active} ref={containerRef}>
      {children}
    </div>
  );
}
