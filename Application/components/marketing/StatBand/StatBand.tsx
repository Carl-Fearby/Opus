import styles from "./StatBand.module.css";

const stats = [
  { value: "100+", label: "Documented components" },
  { value: "2", label: "Built-in themes" },
  { value: "100%", label: "TypeScript coverage" },
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
