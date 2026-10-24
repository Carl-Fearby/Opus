import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./ContributorsCallout.module.css";

export async function ContributorsCallout() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const contributionAreas = [
    t("marketing.contributors.area1"),
    t("marketing.contributors.area2"),
    t("marketing.contributors.area3"),
    t("marketing.contributors.area4"),
    t("marketing.contributors.area5"),
    t("marketing.contributors.area6"),
    t("marketing.contributors.area7"),
  ];

  return (
    <section className={styles.section} aria-labelledby="contributors-title" id="contributors">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{t("marketing.contributors.eyebrow")}</p>
          <h2 id="contributors-title">{t("marketing.contributors.title")}</h2>
          <p>{t("marketing.contributors.description")}</p>
          <ul className={styles.areas} aria-label={t("marketing.contributors.areasAria")}>
            {contributionAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>

        <aside className={styles.contact} aria-label={t("marketing.contributors.contactAria")}>
          <p>{t("marketing.contributors.interested")}</p>
          <span>{t("marketing.contributors.tellUs")}</span>
          <div className={styles.actions}>
            <a
              className={styles.primary}
              href="https://github.com/Carl-Fearby/Opus"
              rel="noreferrer"
              target="_blank"
            >
              {t("marketing.contributors.viewGithub")}
            </a>
            <a className={styles.secondary} href="mailto:carlfearby@me.com?subject=Contributing%20to%20Opus">
              {t("marketing.contributors.emailCarl")}
            </a>
            <a
              className={styles.secondary}
              href="https://wa.me/447940147138?text=Hi%20Carl%2C%20I%27m%20interested%20in%20contributing%20to%20Opus."
              rel="noreferrer"
              target="_blank"
            >
              {t("marketing.contributors.whatsapp")}
            </a>
          </div>
          <small>
            <a href="https://github.com/Carl-Fearby/Opus" rel="noreferrer" target="_blank">
              Carl-Fearby/Opus
            </a>
            <span aria-hidden="true"> · </span>
            <a href="mailto:carlfearby@me.com">carlfearby@me.com</a>
            <span aria-hidden="true"> · </span>
            <a href="https://wa.me/447940147138" rel="noreferrer" target="_blank">
              +44 7940 147138
            </a>
          </small>
        </aside>
      </div>
    </section>
  );
}
