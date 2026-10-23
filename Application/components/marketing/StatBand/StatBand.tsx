import { controls } from "@/lib/controls/registry";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./StatBand.module.css";

export async function StatBand() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const stats = [
    {
      value: new Intl.NumberFormat(locale).format(controls.length),
      label: t("stat.documented"),
    },
    { value: "270", label: t("stat.browserChecks") },
    { value: "npm", label: t("stat.published") },
  ];

  return (
    <section className={styles.band} aria-label={t("stat.aria")}>
      <div className={styles.inner}>
        <p className={styles.audience}>{t("stat.audience")}</p>
        <div className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
