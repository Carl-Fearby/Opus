import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import styles from "./PlaygroundSection.module.css";

const highlights = [
  "Edit complete component examples with syntax highlighting",
  "Live preview updates as you type",
  "Open in Playground from any component page with your current settings",
  "Resizable source and preview panes powered by Splitter",
];

export function PlaygroundSection() {
  return (
    <section className={styles.section} id="playground">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Code Playground</p>
          <h2>Explore components in a live editor, not just a static catalog.</h2>
          <p>
            Jump from any component page into the Playground with generated JSX for your current
            settings, then tweak imports, state, and render logic before you paste it into your app.
          </p>

          <ul className={styles.list}>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link className={styles.primary} href={docsPlaygroundUrl}>
              Open Playground
            </Link>
            <Link className={styles.secondary} href={docsComponentsUrl}>
              Component catalog
            </Link>
          </div>
        </div>

        <div className={styles.mock} aria-hidden="true">
          <div className={styles.mockTop}>
            <span />
            <span />
            <span />
            <span className={styles.mockTab} data-active="true">
              Playground
            </span>
          </div>
          <div className={styles.mockBody}>
            <div className={styles.mockPane}>
              <div className={styles.mockPaneLabel}>Source</div>
              <div className={styles.mockCode}>
                <span />
                <span />
                <span data-accent="true" />
                <span />
                <span />
              </div>
            </div>
            <div className={styles.mockHandle} />
            <div className={styles.mockPane}>
              <div className={styles.mockPaneLabel}>Preview</div>
              <div className={styles.mockPreview}>
                <div className={styles.mockAvatar} />
                <div className={styles.mockProfile}>
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
