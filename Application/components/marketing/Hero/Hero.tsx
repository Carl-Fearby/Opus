import Link from "next/link";
import { controls } from "@/lib/controls/registry";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import { OpusModelShowcase } from "../OpusModelShowcase";
import { InstallCommand } from "./InstallCommand";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>React 19 design system for business apps</p>
          <h1 className={styles.title}>Ship polished internal tools without rebuilding the foundations.</h1>
          <p className={styles.lead}>
            Opus is a themeable component library for CRM, operations, and admin products—forms,
            dashboards, overlays, and application shells that already work together.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href={docsComponentsUrl}>
              Explore components
            </Link>
            <Link className={styles.secondary} href={docsPlaygroundUrl}>
              Try the Playground
            </Link>
          </div>
          <InstallCommand />
          <div className={styles.meta}>
            <span>{controls.length.toLocaleString("en-GB")} catalogue entries</span>
            <span>MIT licensed</span>
            <span>Install from npm</span>
          </div>
        </div>

        <div className={styles.preview}>
          <OpusModelShowcase />
        </div>
      </div>
    </section>
  );
}
