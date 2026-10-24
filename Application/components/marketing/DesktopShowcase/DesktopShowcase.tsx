import Image from "next/image";
import Link from "next/link";
import { componentPath } from "@/lib/controls/routes";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./DesktopShowcase.module.css";

const desktopEnvironmentPath = componentPath("lab-desktop-environment");

export async function DesktopShowcase() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const capabilities = [
    t("marketing.desktop.capability1"),
    t("marketing.desktop.capability2"),
    t("marketing.desktop.capability3"),
    t("marketing.desktop.capability4"),
  ];

  return (
    <section className={styles.section} aria-labelledby="desktop-showcase-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("marketing.desktop.eyebrow")}</p>
          <h2 id="desktop-showcase-title">{t("marketing.desktop.title")}</h2>
          <p className={styles.description}>{t("marketing.desktop.description")}</p>
          <ul className={styles.capabilities}>
            {capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
          <Link className={styles.cta} href={desktopEnvironmentPath}>
            {t("marketing.desktop.explore")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <Link
          aria-label={t("marketing.desktop.previewAria")}
          className={styles.preview}
          href={desktopEnvironmentPath}
        >
          <Image
            alt={t("marketing.desktop.imageAlt")}
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
