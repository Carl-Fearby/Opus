import Image from "next/image";
import Link from "next/link";
import { componentPath } from "@/lib/controls/routes";
import styles from "./DesktopShowcase.module.css";

const desktopEnvironmentPath = componentPath("lab-desktop-environment");

const capabilities = [
  "Draggable, resizable, focus-aware application windows",
  "Desktop shortcuts and a resizable, auto-hiding dock",
  "Minimise, maximise, restore, and application callbacks",
  "User-defined React content for every window and app",
];

export function DesktopShowcase() {
  return (
    <section className={styles.section} aria-labelledby="desktop-showcase-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Desktop applications</p>
          <h2 id="desktop-showcase-title">Build a complete workspace in the browser.</h2>
          <p className={styles.description}>
            Compose desktop-style products from the same accessible, typed React primitives as the
            rest of Opus. You define the apps and content; Opus provides the polished workspace and
            interaction model.
          </p>
          <ul className={styles.capabilities}>
            {capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
          <Link className={styles.cta} href={desktopEnvironmentPath}>
            Explore desktop components
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <Link
          aria-label="Explore desktop components in the component catalogue"
          className={styles.preview}
          href={desktopEnvironmentPath}
        >
          <Image
            alt="Opus browser desktop with draggable application windows, shortcuts, and dock"
            className={styles.image}
            height={900}
            priority={false}
            src="/marketing/desktop.png"
            width={1440}
          />
        </Link>
      </div>
    </section>
  );
}
