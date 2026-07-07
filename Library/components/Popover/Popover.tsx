"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import type { PopoverPlacement } from "@/components/fields/types";
import { Button } from "@/components/fields/Button";
import { useOverlayAccessibility } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./Popover.module.css";

type PopoverProps = {
  children: ReactNode;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
  defaultOpen?: boolean;
  label?: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  placement?: PopoverPlacement;
  showArrow?: boolean;
  title?: string;
  trigger: ReactNode;
};

type TriggerProps = {
  "aria-controls": string;
  "aria-expanded": boolean;
  "aria-haspopup": "dialog";
  onClick: () => void;
};

function mergeTrigger(trigger: ReactNode, triggerProps: TriggerProps, label: string) {
  if (isValidElement(trigger)) {
    const element = trigger as ReactElement<{ onClick?: () => void }>;
    return cloneElement(element, {
      ...triggerProps,
      onClick: () => {
        element.props.onClick?.();
        triggerProps.onClick();
      },
    });
  }

  return (
    <Button aria-label={label} {...triggerProps}>
      {trigger}
    </Button>
  );
}

export function Popover({
  children,
  closeOnEscape = true,
  closeOnOutside = true,
  defaultOpen = false,
  label = "Toggle popover",
  onOpenChange,
  open,
  placement = "bottom",
  showArrow = true,
  title,
  trigger,
}: PopoverProps) {
  const popoverId = useId();
  const titleId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const visible = controlled ? open : internalOpen;

  useOverlayAccessibility(visible, panelRef, {
    lockScroll: false,
    restoreFocus: true,
    trapFocus: false,
  });

  const setVisible = useCallback((nextOpen: boolean) => {
    if (!controlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }, [controlled, onOpenChange]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (closeOnOutside && !rootRef.current?.contains(event.target as Node)) {
        setVisible(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        setVisible(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeOnEscape, closeOnOutside, setVisible, visible]);

  return (
    <span className={styles.root} data-placement={placement} ref={rootRef}>
      {mergeTrigger(
        trigger,
        {
          "aria-controls": popoverId,
          "aria-expanded": visible,
          "aria-haspopup": "dialog",
          onClick: () => setVisible(!visible),
        },
        label,
      )}
      {visible ? (
        <span
          ref={panelRef}
          aria-labelledby={title ? titleId : undefined}
          className={styles.panel}
          data-placement={placement}
          id={popoverId}
          role="dialog"
          tabIndex={-1}
        >
          {showArrow ? <span aria-hidden="true" className={styles.arrow} /> : null}
          {title ? (
            <span className={styles.title} id={titleId} role="heading" aria-level={3}>
              {title}
            </span>
          ) : null}
          <span className={styles.content}>{children}</span>
        </span>
      ) : null}
    </span>
  );
}
