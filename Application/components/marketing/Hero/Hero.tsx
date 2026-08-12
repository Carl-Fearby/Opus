import Link from "next/link";
import { controls } from "@/lib/controls/registry";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Design system · React 19 · AI-assisted Playground · browser verified</p>
          <h1 className={styles.title}>
            Ship polished business apps with a component library built for real workflows.
          </h1>
          <p className={styles.lead}>
            Opus brings together forms, overlays, navigation, charts, application shells, desktop
            primitives, and production-ready compositions in one themeable system. Its AI-assisted
            Playground gives ChatGPT the live component source, preview context, and runtime errors
            so it can help you move from catalogue example to a better production result.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primary} href={docsComponentsUrl}>
              Explore components
            </Link>
            <Link className={styles.secondary} href={docsPlaygroundUrl}>
              Try the AI Playground
            </Link>
          </div>
          <div className={styles.meta}>
            <span>npm install opus-react</span>
            <span>{controls.length.toLocaleString("en-GB")} live catalogue entries</span>
            <span>270 browser interaction checks</span>
            <span>AI-assisted Playground</span>
            <span>Accessible foundations</span>
          </div>
        </div>

        <div className={styles.preview} aria-hidden="true">
          <div className={styles.previewGlow} />
          <div className={styles.previewCard}>
            <div className={styles.previewTop}>
              <span />
              <span />
              <span />
              <Link className={styles.previewTab} href={docsComponentsUrl} tabIndex={-1}>
                Component catalogue
              </Link>
              <span className={styles.previewTab} data-active="true">
                AI Playground
              </span>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewPane}>
                <div className={styles.previewPaneLabel}>Source</div>
                <div className={styles.previewCode}>
                  <span />
                  <span />
                  <span data-accent="true" />
                  <span />
                </div>
              </div>
              <div className={styles.previewHandle} />
              <div className={styles.previewPane}>
                <div className={styles.previewPaneLabel}>Preview</div>
                <div className={styles.previewWidget}>
                  <div className={styles.previewAvatar} />
                  <div className={styles.previewProfile}>
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
            <Link className={styles.previewLink} href={docsComponentsUrl} tabIndex={-1}>
              Open any component with source and context ready for ChatGPT
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
