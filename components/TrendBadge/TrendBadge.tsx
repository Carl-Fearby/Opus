import styles from "./TrendBadge.module.css";

export type TrendBadgeDirection = "down" | "up";

type TrendBadgeProps = {
  direction: TrendBadgeDirection;
  value: string;
};

export function TrendBadge({ direction, value }: TrendBadgeProps) {
  return (
    <span className={styles.badge} data-direction={direction}>
      {direction === "up" ? "↑" : "↓"} {value}
    </span>
  );
}
