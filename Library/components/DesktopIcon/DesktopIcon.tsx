"use client";

import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./DesktopIcon.module.css";

export type DesktopIconTone = "purple" | "blue";

export type DesktopIconProps = {
  active?: boolean;
  className?: string;
  icon: string;
  label: string;
  onOpen?: () => void;
  onSelect?: () => void;
  openOnSingleClick?: boolean;
  selected?: boolean;
  tone?: DesktopIconTone;
};

export function DesktopIcon({
  active,
  className,
  icon,
  label,
  onOpen,
  onSelect,
  openOnSingleClick = false,
  selected,
  tone = "purple",
}: DesktopIconProps) {
  return (
    <button
      aria-label={`Open ${label}`}
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-active={active || undefined}
      data-selected={selected || undefined}
      data-tone={tone}
      onClick={() => {
        onSelect?.();
        if (openOnSingleClick) onOpen?.();
      }}
      onDoubleClick={openOnSingleClick ? undefined : onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen?.();
      }}
      type="button"
    >
      <span aria-hidden="true" className={styles.icon}>
        <CatalogIcon iconName={icon} />
      </span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
