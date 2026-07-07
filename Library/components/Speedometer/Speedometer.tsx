import styles from "./Speedometer.module.css";

type SpeedometerProps = {
  label: string;
  max?: number;
  value: number;
};

export function Speedometer({ label, max = 100, value }: SpeedometerProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = (clamped / Math.max(1, max)) * 100;
  const angle = -90 + (percent / 100) * 180;

  return (
    <figure className={styles.speedometer} data-fit-content="true">
      <svg aria-hidden="true" className={styles.svg} viewBox="0 0 220 130">
        <path className={styles.track} d="M 22 118 A 88 88 0 0 1 198 118" pathLength={100} />
        <path
          className={styles.value}
          d="M 22 118 A 88 88 0 0 1 198 118"
          pathLength={100}
          strokeDasharray={`${percent} 100`}
        />
        <g transform={`rotate(${angle} 110 118)`}>
          <line className={styles.needle} x1="110" x2="110" y1="118" y2="42" />
          <circle className={styles.hub} cx="110" cy="118" r="6" />
        </g>
      </svg>
      <div className={styles.center}>
        <strong>{Math.round(clamped)}</strong>
        <span>{label}</span>
      </div>
    </figure>
  );
}
