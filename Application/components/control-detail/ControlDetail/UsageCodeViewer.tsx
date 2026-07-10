"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import { ControlDetailPanel } from "./ControlDetailPanel";
import { OpenInPlaygroundLink } from "./OpenInPlaygroundLink";
import styles from "./ControlDetail.module.css";

const UsageCodeEditor = dynamic(
  () => import("@/components/control-detail/UsageCodeEditor").then((module) => module.UsageCodeEditor),
  {
    loading: () => <pre className={styles.usageCodeFallback}>Loading editor…</pre>,
    ssr: false,
  },
);

type UsageCodeViewerProps = {
  category?: ComponentCategory;
  slug: ControlSlug;
  settings: ControlSettings;
};

export function UsageCodeViewer({ category, slug, settings }: UsageCodeViewerProps) {
  const usage = useMemo(() => generateUsageCode(slug, settings, category), [category, slug, settings]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(usage.full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (!usage.full) {
    return null;
  }

  return (
    <ControlDetailPanel
      actions={<OpenInPlaygroundLink category={category} settings={settings} slug={slug} />}
      className={styles.sourcePanel}
      title="Usage"
    >
      <p className={styles.usageHint}>
        Copy this complete component into a page file. Edit and run it in the Playground.
      </p>
      <section className={styles.usageSection}>
        <div className={styles.usageSectionHeading}>
          <div className={styles.usageSectionCopy}>
            <h3 className={styles.usageSectionTitle}>Component</h3>
            <p className={styles.usageSectionHint}>
              A working example with imports, state, and render logic for your current settings.
            </p>
          </div>
          <button
            aria-label={copied ? "Copied component code" : "Copy component code"}
            className={`${styles.usageCopyButton} ${copied ? styles.usageCopyButtonCopied : ""}`}
            onClick={() => void handleCopy()}
            type="button"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <UsageCodeEditor code={usage.full} />
      </section>
    </ControlDetailPanel>
  );
}
