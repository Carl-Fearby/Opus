import Link from "next/link";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./ConsumptionLedger.module.css";

const steps = [
  { title: "consumption.step1.title", body: "consumption.step1.body" },
  { title: "consumption.step2.title", body: "consumption.step2.body" },
  { title: "consumption.step3.title", body: "consumption.step3.body" },
] as const;

export async function ConsumptionLedger() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <section className={styles.section} aria-labelledby="consumption-ledger-title">
      <div className={styles.inner}>
        <div>
          <p className={styles.eyebrow}>{t("consumption.eyebrow")}</p>
          <h2 className={styles.title} id="consumption-ledger-title">
            {t("consumption.title")}
          </h2>
          <p className={styles.body}>{t("consumption.body")}</p>
          <Link className={styles.link} href="/news/opus-0-17-1-consumption">
            {t("consumption.link")} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li className={styles.step} key={step.title}>
              <span className={styles.stepNumber} aria-hidden="true">
                0{index + 1}
              </span>
              <div>
                <h3>{t(step.title)}</h3>
                <p>{t(step.body)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
