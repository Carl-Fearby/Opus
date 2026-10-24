import Link from "next/link";
import { categoryPath, componentPath } from "@/lib/controls/routes";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./ProductDepth.module.css";

const pillarNumbers = [1, 2, 3, 4] as const;

const pillarHrefs = [
  categoryPath("forms"),
  categoryPath("dashboard"),
  componentPath("lab-desktop-environment"),
  componentPath("chat-bubble"),
] as const;

export async function ProductDepth() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <section className={styles.section} aria-labelledby="product-depth-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{t("marketing.depth.eyebrow")}</p>
          <h2 id="product-depth-title">{t("marketing.depth.title")}</h2>
          <p>{t("marketing.depth.description")}</p>
        </div>

        <div className={styles.grid}>
          {pillarNumbers.map((number, index) => (
            <article className={styles.card} key={number}>
              <p className={styles.cardEyebrow}>
                {t(`marketing.depth.${number}.eyebrow` as Parameters<typeof translate>[1])}
              </p>
              <h3>{t(`marketing.depth.${number}.title` as Parameters<typeof translate>[1])}</h3>
              <p>{t(`marketing.depth.${number}.description` as Parameters<typeof translate>[1])}</p>
              <Link className={styles.link} href={pillarHrefs[index]}>
                {t(`marketing.depth.${number}.link` as Parameters<typeof translate>[1])}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
