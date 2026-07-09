"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./FloatingActionButton.module.css";

export type FloatingActionButtonSize = "sm" | "md" | "lg";
export type FloatingActionButtonPosition = "end" | "start" | "inline";

export type FloatingActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  extended?: boolean;
  icon?: ReactNode;
  label: string;
  position?: FloatingActionButtonPosition;
  size?: FloatingActionButtonSize;
};

export function FloatingActionButton({
  className,
  extended = false,
  icon,
  label,
  position = "inline",
  size = "md",
  type = "button",
  ...props
}: FloatingActionButtonProps) {
  return (
    <button
      aria-label={extended ? undefined : label}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-extended={extended || undefined}
      data-position={position}
      data-size={size}
      type={type}
      {...props}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      {extended || !icon ? <span className={styles.label}>{label}</span> : null}
      {!extended && icon ? <span className={styles.srOnly}>{label}</span> : null}
    </button>
  );
}
