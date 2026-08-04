"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
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

function getActionLabel(event: Event) {
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
  const preview = useMemo<{
    Component?: ComponentType;
    error?: string;
  }>(() => {
    if (!source.trim()) {
      return { error: `No usage example is registered for ${slug}.` };
    }

    try {
      return { Component: compilePlaygroundCode(source) };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : `Unable to compile the ${slug} usage example.`,
      };
    }
  }, [slug, source]);
  const [lastAction, setLastAction] = useState("Waiting for action");
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previewElement = previewRef.current;
    if (!previewElement || !showActionStatus) return;

    const reportAction = (event: Event) => {
      const label = getActionLabel(event);
      if (label) queueMicrotask(() => setLastAction(`Last action: ${label}`));
    };

    previewElement.addEventListener("change", reportAction, true);
    previewElement.addEventListener("click", reportAction, true);
    previewElement.addEventListener("input", reportAction, true);
    previewElement.dataset.hydrated = "true";
    return () => {
      delete previewElement.dataset.hydrated;
      previewElement.removeEventListener("change", reportAction, true);
      previewElement.removeEventListener("click", reportAction, true);
      previewElement.removeEventListener("input", reportAction, true);
    };
  }, [showActionStatus]);

  return (
    <div
      className={styles.globalActionPreview}
      data-testid="usage-preview"
      ref={previewRef}
    >
      {preview.Component ? (
        <preview.Component />
      ) : (
        <p className={styles.globalActionStatus} role="alert">
          {preview.error}
        </p>
      )}
      {showActionStatus ? (
        <p
          className={styles.globalActionStatus}
          data-testid="usage-preview-action"
          aria-live="polite"
        >
          {lastAction}
        </p>
      ) : null}
    </div>
  );
}
