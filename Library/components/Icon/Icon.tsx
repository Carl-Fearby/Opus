"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/lib/fontawesome";
import { getFontAwesomeIconOption } from "@/lib/fontAwesomeIconCatalog";
import styles from "./Icon.module.css";

export type IconSize = "sm" | "md" | "lg";
export type IconTone = "default" | "muted" | "accent" | "success" | "warning" | "danger";

type IconProps = {
  label?: string;
  name: string;
  size?: IconSize;
  tone?: IconTone;
};

export function Icon({ label, name, size = "md", tone = "default" }: IconProps) {
  const option = getFontAwesomeIconOption(name);

  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={styles.icon}
      data-size={size}
      data-tone={tone}
      role={label ? "img" : undefined}
    >
      <FontAwesomeIcon icon={option.icon} />
    </span>
  );
}
