import type { BadgeSize, BadgeTone, BadgeVariant } from "@/components/fields/types";
import styles from "./Badge.module.css";

type BadgeProps = {
  dot?: boolean;
  label: string;
  size?: BadgeSize;
  tone?: BadgeTone;
  variant?: BadgeVariant;
};

export function Badge({
  dot = false,
  label,
  size = "md",
  tone = "neutral",
  variant = "soft",
}: BadgeProps) {
  return (
    <span className={styles.badge} data-size={size} data-tone={tone} data-variant={variant}>
      {dot ? <span aria-hidden="true" className={styles.dot} /> : null}
      {label}
    </span>
  );
}
