"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

export function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.getAttribute("aria-hidden") !== "true",
  );
}

type OverlayAccessibilityOptions = {
  initialFocusRef?: RefObject<HTMLElement | null>;
  lockScroll?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
};

export function useOverlayAccessibility(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  {
    initialFocusRef,
    lockScroll = true,
    restoreFocus = true,
    trapFocus = true,
  }: OverlayAccessibilityOptions = {},
) {
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    if (!lockScroll) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active, lockScroll]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const initialTarget = initialFocusRef?.current;
      if (initialTarget) {
        initialTarget.focus();
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      getFocusableElements(container)[0]?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [active, containerRef, initialFocusRef]);

  useEffect(() => {
    if (!active || !restoreFocus) {
      return;
    }

    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [active, restoreFocus]);

  useEffect(() => {
    if (!active || !trapFocus) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !containerRef.current) {
        return;
      }

      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      const current = document.activeElement;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef, trapFocus]);
}
