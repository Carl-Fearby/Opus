import Link from "next/link";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Design system · React · npm</p>
          <h1 className={styles.title}>
            Ship polished business apps with a component library built for real workflows.
          </h1>
          <p className={styles.lead}>
            Opus brings together forms, overlays, navigation, charts, and dashboard widgets in one
            themeable system — with light and dark modes, accent colours, and documentation that
            stays in sync with the code.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/pricing">
              Start building
            </Link>
            <Link className={styles.secondary} href="/#components">
              Explore components
            </Link>
          </div>
          <div className={styles.meta}>
            <span>npm install opus-react</span>
            <span>TypeScript-first</span>
            <span>Accessible by default</span>
          </div>
        </div>

        <div className={styles.preview} aria-hidden="true">
          <div className={styles.previewGlow} />
          <div className={styles.previewCard}>
            <div className={styles.previewTop}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewSidebar}>
                <div className={styles.previewNavItem} data-active="true" />
                <div className={styles.previewNavItem} />
                <div className={styles.previewNavItem} />
                <div className={styles.previewNavItem} />
              </div>
              <div className={styles.previewMain}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewTitle} />
                  <div className={styles.previewButton} />
                </div>
                <div className={styles.previewGrid}>
                  <div className={styles.previewMetric} />
                  <div className={styles.previewMetric} />
                  <div className={styles.previewMetric} />
                </div>
                <div className={styles.previewForm}>
                  <div className={styles.previewField} />
                  <div className={styles.previewField} />
                  <div className={styles.previewFieldWide} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
