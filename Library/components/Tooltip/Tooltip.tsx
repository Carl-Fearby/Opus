"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

const GAP = 8;
const VIEWPORT_PADDING = 8;
const ARROW_HALF = 6;

type TooltipProps = {
  content: string;
  /** Accessible label for the default info trigger (ignored when children are provided). */
  label?: string;
  /** Optional trigger to wrap. When omitted, a default "i" info button is rendered. */
  children?: ReactNode;
  /** Preferred side the tooltip appears on relative to its trigger. Defaults to "top". */
  placement?: TooltipPlacement;
  /** Prevents the tooltip from opening (trigger still renders). */
  disabled?: boolean;
  /** Extra class for the wrapper element. */
  className?: string;
};

type Position = {
  left: number;
  top: number;
  arrowOffset: number;
};

export function Tooltip({
  content,
  label = "More information",
  children,
  placement = "top",
  disabled = false,
  className,
}: TooltipProps) {
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);

  const isVisible = open && !disabled && content.length > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    const trigger = rootRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const centerX = triggerRect.left + triggerRect.width / 2;
    const centerY = triggerRect.top + triggerRect.height / 2;

    let left = 0;
    let top = 0;
    let arrowOffset = 0;

    if (placement === "top" || placement === "bottom") {
      top =
        placement === "top"
          ? triggerRect.top - popupRect.height - GAP
          : triggerRect.bottom + GAP;

      const rawLeft = centerX - popupRect.width / 2;
      const maxLeft = vw - popupRect.width - VIEWPORT_PADDING;
      left = Math.min(Math.max(rawLeft, VIEWPORT_PADDING), Math.max(maxLeft, VIEWPORT_PADDING));

      arrowOffset = Math.min(
        Math.max(centerX - left, ARROW_HALF + 2),
        popupRect.width - ARROW_HALF - 2,
      );
    } else {
      left =
        placement === "left"
          ? triggerRect.left - popupRect.width - GAP
          : triggerRect.right + GAP;

      const rawTop = centerY - popupRect.height / 2;
      const maxTop = vh - popupRect.height - VIEWPORT_PADDING;
      top = Math.min(Math.max(rawTop, VIEWPORT_PADDING), Math.max(maxTop, VIEWPORT_PADDING));

      arrowOffset = Math.min(
        Math.max(centerY - top, ARROW_HALF + 2),
        popupRect.height - ARROW_HALF - 2,
      );
    }

    setPosition({ left, top, arrowOffset });
  }, [placement]);

  useLayoutEffect(() => {
    if (!isVisible) {
      setPosition(null);
      return;
    }

    updatePosition();

    const handleReflow = () => updatePosition();
    window.addEventListener("scroll", handleReflow, true);
    window.addEventListener("resize", handleReflow);
    return () => {
      window.removeEventListener("scroll", handleReflow, true);
      window.removeEventListener("resize", handleReflow);
    };
  }, [isVisible, updatePosition]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  const handleBlur = (event: React.FocusEvent<HTMLSpanElement | HTMLButtonElement>) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
    }
  };

  const isHorizontal = placement === "left" || placement === "right";
  const arrowStyle = position
    ? isHorizontal
      ? { top: position.arrowOffset }
      : { left: position.arrowOffset }
    : undefined;

  const popup =
    isVisible && mounted
      ? createPortal(
          <span
            ref={popupRef}
            className={[styles.popup, styles[placement]].join(" ")}
            id={tooltipId}
            role="tooltip"
            style={
              position
                ? { left: position.left, top: position.top, visibility: "visible" }
                : { left: 0, top: 0, visibility: "hidden" }
            }
          >
            {content}
            <span aria-hidden="true" className={styles.arrow} style={arrowStyle} />
          </span>,
          document.body,
        )
      : null;

  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  if (children) {
    return (
      <span
        ref={rootRef}
        className={rootClassName}
        onBlur={handleBlur}
        onFocus={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <span aria-describedby={isVisible ? tooltipId : undefined} className={styles.triggerWrap}>
          {children}
        </span>
        {popup}
      </span>
    );
  }

  return (
    <span
      ref={rootRef}
      className={rootClassName}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-describedby={isVisible ? tooltipId : undefined}
        aria-expanded={isVisible}
        aria-label={label}
        className={styles.trigger}
        onBlur={handleBlur}
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
        type="button"
      >
        i
      </button>
      {popup}
    </span>
  );
}
