"use client";

import "@/lib/fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./ComponentIcon.module.css";

type ComponentIconProps = {
  compact?: boolean;
  icon: IconDefinition;
};

export function ComponentIcon({ compact = false, icon }: ComponentIconProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.icon, compact ? styles.iconCompact : ""].filter(Boolean).join(" ")}
    >
      <FontAwesomeIcon icon={icon} />
    </span>
  );
}
