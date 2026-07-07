import styles from "./ProgressBar.module.css";

type ProgressBarProps = {
  label: string;
  max?: number;
  value: number;
};

export function ProgressBar({ label, max = 100, value }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = (clamped / Math.max(1, max)) * 100;

  return (
    <figure className={styles.bar}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{Math.round(percent)}%</span>
      </div>
      <div className={styles.track}>
        <span className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </figure>
  );
}
