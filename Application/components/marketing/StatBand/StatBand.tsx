import styles from "./StatBand.module.css";

const stats = [
  { value: "267", label: "Audited live examples" },
  { value: "270", label: "Browser interaction checks" },
  { value: "276", label: "Unit assertions" },
  { value: "npm", label: "Published as opus-react" },
];

export function StatBand() {
  return (
    <section className={styles.band} aria-label="Key facts">
      <div className={styles.inner}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
