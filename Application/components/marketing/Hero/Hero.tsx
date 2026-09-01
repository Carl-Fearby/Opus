import Link from "next/link";
import { controls } from "@/lib/controls/registry";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import { OpusModelShowcase } from "../OpusModelShowcase";
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

        <div className={styles.preview}>
          <OpusModelShowcase />
        </div>
      </div>
    </section>
  );
}
