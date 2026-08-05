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
import styles from "./RealWorldShowcase.module.css";

const catalogueLinks = [
  { href: "/documentation/components/lab-contact-card", label: "Contact card" },
  { href: "/documentation/components/pipeline-overview", label: "Pipeline overview" },
  { href: "/documentation/components/deals-over-time", label: "Deals over time" },
];

export function RealWorldShowcase() {
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  const handleContactAction = (action: ContactDetailsAction) => {
    // The marketing example is deliberately live; applications provide their
    // own navigation, modal, or mutation handler here.
    console.info(`Contact action: ${action}`);
  };

  return (
    <section className={styles.section} aria-labelledby="real-world-heading">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Real-world compositions</p>
          <h2 id="real-world-heading">Production UI, not placeholder blocks.</h2>
          <p>
            These are live Opus components from the npm package—the same contact and dashboard
            patterns available in the catalogue and editable Playground.
          </p>
        </div>

        <div className={styles.demoShell}>
          <div className={styles.demoBar}>
            <div>
              <span className={styles.liveDot} aria-hidden="true" />
              Live component composition
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
                <div className={styles.chartLoading}>Loading pipeline preview…</div>
              )}
            </div>
            <div className={styles.chartPreview}>
              {chartsReady ? (
                <DealsOverTime data={getDealsOverTimeDemoData("This Year")} period="This Year" />
              ) : (
                <div className={styles.chartLoading}>Loading deals preview…</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.links} aria-label="View showcased components">
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
