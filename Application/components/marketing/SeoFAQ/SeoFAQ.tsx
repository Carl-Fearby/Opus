import Link from "next/link";
import { categoryPath, componentPath } from "@/lib/controls/routes";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./SeoFAQ.module.css";

const questionNumbers = [1, 2, 3, 4, 5] as const;

export async function SeoFAQ() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const questions = questionNumbers.map((number) => ({
    question: t(`marketing.faq.q${number}` as Parameters<typeof translate>[1]),
    answer: t(`marketing.faq.a${number}` as Parameters<typeof translate>[1]),
  }));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section className={styles.section} aria-labelledby="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{t("marketing.faq.eyebrow")}</p>
          <h2 id="faq-title">{t("marketing.faq.title")}</h2>
          <p>
            {t("marketing.faq.introBefore")}{" "}
            <Link href={categoryPath("forms")}>{t("marketing.faq.introForm")}</Link>
            {t("marketing.faq.introMiddle")}{" "}
            <Link href={categoryPath("dashboard")}>{t("marketing.faq.introData")}</Link>
            {t("marketing.faq.introMiddle2")}{" "}
            <Link href={componentPath("lab-desktop-environment")}>{t("marketing.faq.introLab")}</Link>
            {t("marketing.faq.introAfter")}
          </p>
        </div>
        <dl className={styles.list}>
          {questions.map((item) => (
            <div className={styles.item} key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
