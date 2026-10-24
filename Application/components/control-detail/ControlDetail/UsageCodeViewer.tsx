"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import { useOpusI18n } from "@/components/OpusI18n";
import { ControlDetailPanel } from "./ControlDetailPanel";
import { OpenInPlaygroundLink } from "./OpenInPlaygroundLink";
import styles from "./ControlDetail.module.css";

function UsageEditorLoading() {
  const { t } = useOpusI18n();
  return <pre className={styles.usageCodeFallback}>{t("usage.loadingEditor", "Loading editor…")}</pre>;
}

const UsageCodeEditor = dynamic(
  () => import("@/components/control-detail/UsageCodeEditor").then((module) => module.UsageCodeEditor),
  {
    loading: () => <UsageEditorLoading />,
    ssr: false,
  },
);

type UsageCodeViewerProps = {
  category?: ComponentCategory;
  slug: ControlSlug;
  settings: ControlSettings;
};

export function UsageCodeViewer({ category, slug, settings }: UsageCodeViewerProps) {
  const { t } = useOpusI18n();
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
      actions={
        <>
          <button
            aria-label={copied ? t("usage.copiedAria", "Copied usage code") : t("usage.copyAria", "Copy usage code")}
            className={`${styles.panelActionButton} ${copied ? styles.usageCopyButtonCopied : ""}`}
            onClick={() => void handleCopy()}
            type="button"
          >
            {copied ? t("usage.copied", "Copied") : t("usage.copy", "Copy")}
          </button>
          <OpenInPlaygroundLink category={category} settings={settings} slug={slug} />
        </>
      }
      className={styles.sourcePanel}
      title={t("usage.title", "Usage")}
      tourTarget="component-usage"
    >
      <p className={styles.usageHint}>
        {t("usage.hint", "Copy this complete component into a page file. Edit and run it in the Playground.")}
      </p>
      <UsageCodeEditor code={usage.full} />
    </ControlDetailPanel>
  );
}
