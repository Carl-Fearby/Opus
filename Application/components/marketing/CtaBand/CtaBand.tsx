import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl, npmPackageUrl } from "@/lib/siteLinks";
import styles from "./CtaBand.module.css";

export function CtaBand() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>Ready when you are</p>
          <h2>Start with Opus today.</h2>
          <p>
            Install the library, browse the documentation, and experiment in the Playground before
            you bring a cohesive design system to your next product surface.
          </p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/pricing">
            View plans
          </Link>
          <Link className={styles.secondary} href={docsPlaygroundUrl}>
            Open Playground
          </Link>
          <Link className={styles.secondary} href={docsComponentsUrl}>
            Component catalog
          </Link>
          <a className={styles.secondary} href={npmPackageUrl} rel="noreferrer" target="_blank">
            npm package
          </a>
        </div>
      </div>
    </section>
  );
}
