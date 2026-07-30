"use client";

import { useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import { compilePlaygroundCode } from "@/lib/playground/compilePlaygroundCode";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import type { ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import styles from "./ControlDetail.module.css";

type UsagePreviewProps = {
  category?: ComponentCategory;
  settings: ControlSettings;
  showActionStatus?: boolean;
  slug: ControlSlug;
};

function getActionLabel(event: SyntheticEvent<HTMLElement>) {
  const target = event.target as HTMLElement;
  const action = target.closest<HTMLElement>(
    "button, a[href], [role='button'], input, select, textarea",
  );

  if (!action || action.hasAttribute("disabled")) return null;

  return (
    action.getAttribute("aria-label")
    ?? action.getAttribute("title")
    ?? (action instanceof HTMLInputElement ? action.name || action.type : action.textContent?.trim())
    ?? action.tagName.toLowerCase()
  );
}

/**
 * The catalogue preview deliberately compiles the same source shown in Usage
 * and passed to Playground/External. Keep preview-only instrumentation here,
 * outside the example source, so it can never make those surfaces drift.
 */
export function UsagePreview({
  category,
  settings,
  showActionStatus = true,
  slug,
}: UsagePreviewProps) {
  const source = useMemo(
    () => generateUsageCode(slug, settings, category).full,
    [category, settings, slug],
  );
  const PreviewComponent = useMemo(() => compilePlaygroundCode(source), [source]);
  const [lastAction, setLastAction] = useState("Waiting for action");

  const reportAction = (event: SyntheticEvent<HTMLElement>) => {
    const label = getActionLabel(event);
    if (label) setLastAction(`Last action: ${label}`);
  };

  return (
    <div
      className={styles.globalActionPreview}
      onChangeCapture={showActionStatus ? reportAction : undefined}
      onClickCapture={showActionStatus ? reportAction : undefined}
    >
      <PreviewComponent />
      {showActionStatus ? (
        <p className={styles.globalActionStatus} aria-live="polite">
          {lastAction}
        </p>
      ) : null}
    </div>
  );
}
