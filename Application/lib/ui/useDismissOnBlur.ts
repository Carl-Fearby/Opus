"use client";

import { useEffect, useRef, type RefObject } from "react";

type DismissOnBlurOptions = {
  /** Elements that belong to the field. Pointer presses and focus inside them keep it open. */
  refs: Array<RefObject<HTMLElement | null>>;
  onDismiss: () => void;
  open: boolean;
};

/**
 * Closes a dropdown when it loses focus: an outside pointer press, focus moving
 * to another control (so tabbing away dismisses it), or Escape. Fields whose
 * panel is portalled pass that panel's ref too.
 */
export function useDismissOnBlur({ refs, onDismiss, open }: DismissOnBlurOptions) {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) {
      return;
    }

    const isInside = (target: EventTarget | null) =>
      target instanceof Node && refsRef.current.some((ref) => ref.current?.contains(target));

    const handlePointerDown = (event: PointerEvent) => {
      if (!isInside(event.target)) dismissRef.current();
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isInside(event.target)) dismissRef.current();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismissRef.current();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);
}
