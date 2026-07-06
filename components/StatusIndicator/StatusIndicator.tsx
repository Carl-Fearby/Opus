import styles from "./StatusIndicator.module.css";

export type StatusIndicatorState = "error" | "neutral" | "success" | "warning";

type StatusIndicatorProps = {
  label: string;
  status: StatusIndicatorState;
};

export function StatusIndicator({ label, status }: StatusIndicatorProps) {
  return (
    <span className={styles.indicator} data-status={status}>
      <span className={styles.dot} />
      {label}
    </span>
  );
}
