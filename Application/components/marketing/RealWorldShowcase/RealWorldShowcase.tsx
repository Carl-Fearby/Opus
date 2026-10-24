"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ContactCard,
  DealsOverTime,
  PipelineOverview,
  defaultContact,
  type ContactDetailsAction,
} from "opus-react";
import { getDealsOverTimeDemoData } from "@/lib/controls/dealsOverTimeDemoData";
import { demoPipelineStages, demoPipelineTotalValue } from "@/lib/controls/pipelineDemoData";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./RealWorldShowcase.module.css";

export function RealWorldShowcase() {
  const { t } = useLocale();
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  const catalogueLinks = [
    { href: "/documentation/components/lab-contact-card", label: t("marketing.real.contact") },
    { href: "/documentation/components/pipeline-overview", label: t("marketing.real.pipeline") },
    { href: "/documentation/components/deals-over-time", label: t("marketing.real.deals") },
  ];

  const handleContactAction = (action: ContactDetailsAction) => {
    // The marketing example is deliberately live; applications provide their
    // own navigation, modal, or mutation handler here.
    console.info(`Contact action: ${action}`);
  };

  return (
    <section className={styles.section} aria-labelledby="real-world-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>{t("marketing.real.eyebrow")}</p>
          <h2 id="real-world-heading">{t("marketing.real.title")}</h2>
          <p>{t("marketing.real.description")}</p>
        </div>

        <div className={styles.demoShell}>
          <div className={styles.demoBar}>
            <div>
              <span className={styles.liveDot} aria-hidden="true" />
              {t("marketing.real.live")}
            </div>
            <span>opus-react</span>
          </div>

          <div className={styles.contactPreview}>
            <ContactCard contact={defaultContact} onAction={handleContactAction} />
          </div>

          <div className={styles.dashboardGrid}>
            <div className={styles.chartPreview}>
              {chartsReady ? (
                <PipelineOverview
                  stages={demoPipelineStages}
                  totalValue={demoPipelineTotalValue}
                />
              ) : (
                <div className={styles.chartLoading}>{t("marketing.real.loadingPipeline")}</div>
              )}
            </div>
            <div className={styles.chartPreview}>
              {chartsReady ? (
                <DealsOverTime data={getDealsOverTimeDemoData("This Year")} period="This Year" />
              ) : (
                <div className={styles.chartLoading}>{t("marketing.real.loadingDeals")}</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.links} aria-label={t("marketing.real.linksAria")}>
          {catalogueLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label} <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
