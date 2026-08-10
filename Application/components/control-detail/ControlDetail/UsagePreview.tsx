"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { compilePlaygroundCode } from "@/lib/playground/compilePlaygroundCode";
import { JsonViewer } from "opus-react";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import type { ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import styles from "./ControlDetail.module.css";

type UsagePreviewProps = {
  category?: ComponentCategory;
  settings: ControlSettings;
  showActionStatus?: boolean;
  slug: ControlSlug;
};

const CompiledPreview = memo(function CompiledPreview({
  component: Component,
}: {
  component: ComponentType;
}) {
  return <Component />;
});

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

function collectPreviewOutput(root: HTMLElement): Record<string, unknown> | null {
  const controls = [...root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input:not([type='button']):not([type='submit']):not([type='reset']), select, textarea",
  )];
  if (!controls.length) return null;

  const flatOutput: Record<string, unknown> = {};
  for (const control of controls) {
    if (control.disabled || !control.id && !control.name) continue;
    const key = control.name || control.id;
    if (control instanceof HTMLInputElement && control.type === "radio") {
      if (control.checked) flatOutput[key] = control.value;
      continue;
    }
    if (control instanceof HTMLInputElement && control.type === "checkbox") {
      flatOutput[key] = control.checked;
      continue;
    }
    if (control instanceof HTMLSelectElement && control.multiple) {
      flatOutput[key] = [...control.selectedOptions].map((option) => option.value);
      continue;
    }
    const value = control instanceof HTMLInputElement
      && ["numeric", "decimal"].includes(control.inputMode)
      && control.value !== ""
      && Number.isFinite(Number(control.value))
      ? Number(control.value)
      : control.value;
    if (key in flatOutput) {
      flatOutput[key] = Array.isArray(flatOutput[key])
        ? [...flatOutput[key] as unknown[], value]
        : [flatOutput[key], value];
    } else {
      flatOutput[key] = value;
    }
  }
  if (!Object.keys(flatOutput).length) return null;

  const output: Record<string, unknown> = {};
  for (const [path, value] of Object.entries(flatOutput)) {
    const segments = path.split(".").filter(Boolean);
    let target = output;
    for (const segment of segments.slice(0, -1)) {
      const current = target[segment];
      if (!current || typeof current !== "object" || Array.isArray(current)) {
        target[segment] = {};
      }
      target = target[segment] as Record<string, unknown>;
    }
    target[segments.at(-1) ?? path] = value;
  }
  return output;
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
  const previewRefCache = useRef<{
    Component?: ComponentType;
    error?: string;
    source: string;
  } | undefined>(undefined);

  if (!previewRefCache.current || previewRefCache.current.source !== source) {
    if (!source.trim()) {
      previewRefCache.current = {
        error:
          `No usage example is registered for ${slug}.`,
        source,
      };
    } else {
      try {
        previewRefCache.current = {
          Component: compilePlaygroundCode(source),
          source,
        };
      } catch (error) {
        previewRefCache.current = {
          error:
            error instanceof Error
              ? error.message
              : `Unable to compile the ${slug} usage example.`,
          source,
        };
      }
    }
  }
  const preview = previewRefCache.current;
  const [lastAction, setLastAction] = useState("Waiting for action");
  const [dataOutput, setDataOutput] = useState<Record<string, unknown> | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLastAction("Waiting for action");
    setDataOutput(null);
  }, [source]);

  useEffect(() => {
    const previewElement = previewRef.current;
    if (!previewElement || !showActionStatus) return;

    const reportAction = (event: Event) => {
      const label = getActionLabel(event);
      queueMicrotask(() => {
        if (label) setLastAction(`Last action: ${label}`);
        const formOutput = collectPreviewOutput(previewElement);
        setDataOutput(formOutput ?? (label ? { action: label } : null));
      });
    };

    previewElement.addEventListener("change", reportAction, true);
    previewElement.addEventListener("click", reportAction, true);
    previewElement.dataset.hydrated = "true";
    const frame = requestAnimationFrame(() => {
      setDataOutput(collectPreviewOutput(previewElement));
    });
    return () => {
      cancelAnimationFrame(frame);
      delete previewElement.dataset.hydrated;
      previewElement.removeEventListener("change", reportAction, true);
      previewElement.removeEventListener("click", reportAction, true);
    };
  }, [showActionStatus]);

  return (
    <div
      className={styles.globalActionPreview}
      data-testid="usage-preview"
      ref={previewRef}
    >
      {preview.Component ? (
        <CompiledPreview component={preview.Component} />
      ) : (
        <p className={styles.globalActionStatus} role="alert">
          {preview.error}
        </p>
      )}
      {showActionStatus ? (
        <div className={styles.globalActionStatus} aria-live="polite">
          <p data-testid="usage-preview-action">{lastAction}</p>
          {dataOutput ? (
            <div className={styles.globalDataOutput} data-testid="usage-preview-data">
              <strong>Data output</strong>
              <JsonViewer collapsedDepth={2} value={dataOutput} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
