import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./FeatureGrid.module.css";

const featureNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export async function FeatureGrid() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <section className={styles.section} id="features">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{t("marketing.features.eyebrow")}</p>
          <h2>{t("marketing.features.title")}</h2>
          <p>{t("marketing.features.intro")}</p>
        </div>

        <div className={styles.grid}>
          {featureNumbers.map((number) => (
            <article key={number} className={styles.card}>
              <h3>{t(`marketing.features.${number}.title` as Parameters<typeof translate>[1])}</h3>
              <p>{t(`marketing.features.${number}.description` as Parameters<typeof translate>[1])}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
