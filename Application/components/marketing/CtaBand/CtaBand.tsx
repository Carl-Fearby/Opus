import Link from "next/link";
import { docsComponentsUrl, docsPlaygroundUrl, npmPackageUrl } from "@/lib/siteLinks";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./CtaBand.module.css";

export async function CtaBand() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>{t("cta.eyebrow")}</p>
          <h2>{t("cta.title")}</h2>
          <p>{t("cta.body")}</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primary} href={docsComponentsUrl}>
            {t("cta.explore")}
          </Link>
          <Link className={styles.secondary} href={docsPlaygroundUrl}>
            {t("cta.playground")}
          </Link>
          <a className={styles.secondary} href={npmPackageUrl} rel="noreferrer" target="_blank">
            {t("cta.npm")}
          </a>
        </div>
      </div>
    </section>
  );
}
