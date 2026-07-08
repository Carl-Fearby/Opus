import Link from "next/link";
import styles from "./CtaBand.module.css";

export function CtaBand() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>Ready when you are</p>
          <h2>Start with Opus today.</h2>
          <p>
            Install the library, explore the documentation, and bring a cohesive design system to
            your next product surface.
          </p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/pricing">
            View plans
          </Link>
          <a className={styles.secondary} href="https://www.npmjs.com/package/opus-react" rel="noreferrer" target="_blank">
            npm package
          </a>
        </div>
      </div>
    </section>
  );
}
