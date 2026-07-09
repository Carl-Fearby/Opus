"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { ButtonVariant } from "@/components/fields/Button";
import styles from "./SplitButton.module.css";

export type SplitButtonAction = {
  disabled?: boolean;
  id: string;
  label: string;
};

export type SplitButtonProps = {
  actions: SplitButtonAction[];
  children: ReactNode;
  disabled?: boolean;
  onActionSelect?: (id: string) => void;
  onClick?: () => void;
  variant?: ButtonVariant;
};

export function SplitButton({
  actions,
  children,
  disabled = false,
  onActionSelect,
  onClick,
  variant = "primary",
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.root} data-variant={variant} ref={rootRef}>
      <button className={styles.main} disabled={disabled} onClick={onClick} type="button">
        {children}
      </button>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="More actions"
        className={styles.caret}
        disabled={disabled || actions.length === 0}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        ▾
      </button>
      {open ? (
        <ul className={styles.menu} id={menuId} role="menu">
          {actions.map((action) => (
            <li key={action.id} role="none">
              <button
                className={styles.menuItem}
                disabled={action.disabled}
                onClick={() => {
                  onActionSelect?.(action.id);
                  setOpen(false);
                }}
                role="menuitem"
                type="button"
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
