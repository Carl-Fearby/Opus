import styles from "./TileGradientDefs.module.css";

export function TileGradientDefs() {
  return (
    <svg
      aria-hidden="true"
      className={styles.defs}
      focusable="false"
      height="0"
      width="0"
    >
      <defs>
        <linearGradient id="opus-action-tile-purple" x1="0.5" x2="0.5" y1="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="48%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="opus-action-tile-blue" x1="0.5" x2="0.5" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="48%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
