import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./PlaygroundSection.module.css";

export async function PlaygroundSection() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const highlights = [
    t("marketing.playground.highlight1"),
    t("marketing.playground.highlight2"),
    t("marketing.playground.highlight3"),
    t("marketing.playground.highlight4"),
    t("marketing.playground.highlight5"),
  ];

  return (
    <section className={styles.section} id="playground">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("marketing.playground.eyebrow")}</p>
          <h2>{t("marketing.playground.title")}</h2>
          <p>{t("marketing.playground.description")}</p>

          <p className={styles.keyNote}>{t("marketing.playground.keyNote")}</p>

          <ul className={styles.list}>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link className={styles.primary} href={docsPlaygroundUrl}>
              {t("marketing.playground.open")}
            </Link>
            <Link className={styles.secondary} href={docsComponentsUrl}>
              {t("marketing.playground.browse")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
