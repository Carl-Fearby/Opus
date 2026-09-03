import { controls } from "@/lib/controls/registry";
import styles from "./StatBand.module.css";

const stats = [
  { value: controls.length.toLocaleString("en-GB"), label: "Documented components" },
  { value: "270", label: "Browser interaction checks" },
  { value: "npm", label: "Published as opus-react" },
];

export function StatBand() {
  return (
    <section className={styles.band} aria-label="Who Opus is for">
      <div className={styles.inner}>
        <p className={styles.audience}>
          Built for teams shipping internal tools, CRM, and operations apps—not another kit of
          unstyled primitives.
        </p>
        <div className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
