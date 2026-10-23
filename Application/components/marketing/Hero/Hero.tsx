import Link from "next/link";
import { controls } from "@/lib/controls/registry";
import { docsComponentsUrl, docsPlaygroundUrl } from "@/lib/siteLinks";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import { OpusModelShowcase } from "../OpusModelShowcase";
import { InstallCommand } from "./InstallCommand";
import styles from "./Hero.module.css";

export async function Hero() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
    translate(locale, key, params);
  const catalogueCount = new Intl.NumberFormat(locale).format(controls.length);

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("hero.eyebrow")}</p>
          <h1 className={styles.title}>{t("hero.title")}</h1>
          <p className={styles.lead}>{t("hero.lead")}</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href={docsComponentsUrl}>
              {t("hero.explore")}
            </Link>
            <Link className={styles.secondary} href={docsPlaygroundUrl}>
              {t("hero.playground")}
            </Link>
          </div>
          <p>
            <Link href="/news/neumorphism-theme">{t("hero.newTheme")}</Link>
          </p>
          <InstallCommand />
          <div className={styles.meta}>
            <span>{t("hero.catalogueEntries", { count: catalogueCount })}</span>
            <span>{t("hero.mit")}</span>
            <span>{t("hero.installNpm")}</span>
          </div>
        </div>

        <div className={styles.preview}>
          <OpusModelShowcase />
        </div>
      </div>
    </section>
  );
}
