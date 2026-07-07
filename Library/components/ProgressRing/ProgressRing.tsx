import styles from "./ProgressRing.module.css";

type ProgressRingProps = {
  label: string;
  max?: number;
  value: number;
};

export function ProgressRing({ label, max = 100, value }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = (clamped / Math.max(1, max)) * 100;

  return (
    <figure className={styles.ring} data-fit-content="true">
      <svg aria-hidden="true" className={styles.svg} viewBox="0 0 220 220">
        <circle className={styles.track} cx="110" cy="110" pathLength={100} r="82" />
        <circle
          className={styles.value}
          cx="110"
          cy="110"
          pathLength={100}
          r="82"
          strokeDasharray={`${percent} 100`}
        />
      </svg>
      <div className={styles.center}>
        <strong>{Math.round(percent)}%</strong>
        <span>{label}</span>
      </div>
    </figure>
  );
}
