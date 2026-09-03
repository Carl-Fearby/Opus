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
          <p>Install the package, browse the catalogue, then try a component in the Playground.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href={docsComponentsUrl}>
            Explore components
          </Link>
          <Link className={styles.secondary} href={docsPlaygroundUrl}>
            Open Playground
          </Link>
          <a className={styles.secondary} href={npmPackageUrl} rel="noreferrer" target="_blank">
            npm package
          </a>
        </div>
      </div>
    </section>
  );
}
