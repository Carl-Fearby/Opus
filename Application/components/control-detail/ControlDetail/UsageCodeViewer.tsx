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

type UsageSectionProps = {
  copied: boolean;
  description: string;
  onCopy: () => void;
  title: string;
  code: string;
};

function UsageSection({ copied, code, description, onCopy, title }: UsageSectionProps) {
  if (!code) {
    return null;
  }

  return (
    <section className={styles.usageSection}>
      <div className={styles.usageSectionHeading}>
        <div className={styles.usageSectionCopy}>
          <h3 className={styles.usageSectionTitle}>{title}</h3>
          <p className={styles.usageSectionHint}>{description}</p>
        </div>
        <button
          aria-label={copied ? `Copied ${title.toLowerCase()}` : `Copy ${title.toLowerCase()}`}
          className={`${styles.usageCopyButton} ${copied ? styles.usageCopyButtonCopied : ""}`}
          onClick={onCopy}
          type="button"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <UsageCodeEditor code={code} />
    </section>
  );
}

export function UsageCodeViewer({ slug, settings }: UsageCodeViewerProps) {
  const usage = generateUsageCode(slug, settings);
  const [copiedSection, setCopiedSection] = useState<"imports" | "jsx" | null>(null);

  const handleCopy = async (section: "imports" | "jsx", code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedSection(section);
      window.setTimeout(() => setCopiedSection(null), 1600);
    } catch {
      setCopiedSection(null);
    }
  };

  return (
    <section className={`${styles.panel} ${styles.sourcePanel}`}>
      <div className="opus-panel-heading">
        <h2 className="opus-panel-title">Usage</h2>
      </div>
      <p className={styles.usageHint}>
        Copy imports and JSX separately. Put imports, state, and data at the top of your file, then paste the JSX where
        you want the component to render.
      </p>
      <UsageSection
        copied={copiedSection === "imports"}
        code={usage.imports}
        description="Imports, hooks, constants, and demo data for this preview."
        title="Imports"
        onCopy={() => handleCopy("imports", usage.imports)}
      />
      <UsageSection
        copied={copiedSection === "jsx"}
        code={usage.jsx}
        description="JSX to render the component with your current settings."
        title="JSX"
        onCopy={() => handleCopy("jsx", usage.jsx)}
      />
    </section>
  );
}
