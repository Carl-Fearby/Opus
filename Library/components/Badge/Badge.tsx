import type { BadgeSize, BadgeTone, BadgeVariant } from "@/components/fields/types";
import styles from "./Badge.module.css";

type BadgeProps = {
  /** Trailing numeric pill, for counts that qualify the label. */
  count?: number;
  dot?: boolean;
  label: string;
  size?: BadgeSize;
  tone?: BadgeTone;
  variant?: BadgeVariant;
};

export function Badge({
  count,
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
      {count === undefined ? null : <span className={styles.count}>{count}</span>}
    </span>
  );
}
