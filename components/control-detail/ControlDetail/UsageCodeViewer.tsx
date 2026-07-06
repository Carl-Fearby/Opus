"use client";

import { useState } from "react";
import type { ControlSettings, ControlSlug } from "@/lib/controls/types";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import styles from "./ControlDetail.module.css";
import { UsageCodeEditor } from "@/components/control-detail/UsageCodeEditor";

type UsageCodeViewerProps = {
  slug: ControlSlug;
  settings: ControlSettings;
};

export function UsageCodeViewer({ slug, settings }: UsageCodeViewerProps) {
  const code = generateUsageCode(slug, settings);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className={`${styles.panel} ${styles.sourcePanel}`}>
      <div className="opus-panel-heading">
        <h2 className="opus-panel-title">Usage</h2>
        <button
          aria-label={copied ? "Copied usage code" : "Copy usage code to clipboard"}
          className={`${styles.usageCopyButton} ${copied ? styles.usageCopyButtonCopied : ""}`}
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className={styles.usageHint}>Paste this into your app to replicate the current preview.</p>
      <UsageCodeEditor code={code} />
    </section>
  );
}
