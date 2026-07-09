"use client";

import { CatalogIcon } from "@/components/CatalogIcon";
import type { IconSize, IconTone } from "@/components/Icon/Icon";
import styles from "./IconBadge.module.css";

export type IconBadgeUrgency = "standard" | "danger" | "warning" | "success" | "info";

export type IconBadgeProps = {
  className?: string;
  count?: number;
  iconName: string;
  label: string;
  max?: number;
  onClick?: () => void;
  showZero?: boolean;
  size?: IconSize;
  tone?: IconTone;
  urgency?: IconBadgeUrgency;
};

function formatCount(count: number, max: number) {
  if (count > max) {
    return `${max}+`;
  }

  return String(count);
}

function shouldShowBadge(count: number, showZero: boolean) {
  return count > 0 || showZero;
}

function buildAccessibleLabel(label: string, count: number, max: number, showZero: boolean) {
  if (!shouldShowBadge(count, showZero)) {
    return label;
  }

  if (count > max) {
    return `${label}, more than ${max}`;
  }

  if (count === 1) {
    return `${label}, 1 notification`;
  }

  return `${label}, ${count} notifications`;
}

export function IconBadge({
  className,
  count = 0,
  iconName,
  label,
  max = 99,
  onClick,
  showZero = false,
  size = "md",
  tone = "muted",
  urgency = "standard",
}: IconBadgeProps) {
  const showBadge = shouldShowBadge(count, showZero);
  const accessibleLabel = buildAccessibleLabel(label, count, max, showZero);
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");

  const content = (
    <span aria-hidden="true" className={styles.icon} data-size={size} data-tone={tone}>
      <CatalogIcon iconName={iconName} />
      {showBadge ? (
        <span className={styles.badge} data-urgency={urgency}>
          {formatCount(count, max)}
        </span>
      ) : null}
    </span>
  );

  if (onClick) {
    return (
      <button
        aria-label={accessibleLabel}
        className={rootClassName}
        data-size={size}
        onClick={onClick}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <span aria-label={accessibleLabel} className={rootClassName} data-size={size} role="img">
      {content}
    </span>
  );
}
