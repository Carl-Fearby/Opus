"use client";

import { useMemo } from "react";
import type { ComponentType } from "react";
import { PreviewThemeBoundary } from "@/components/control-detail/ControlDetail/PreviewThemeBoundary";
import { compilePlaygroundCode } from "@/lib/playground/compilePlaygroundCode";
import styles from "./CodePlayground.module.css";

type PlaygroundPreviewProps = {
  code: string;
};

type PreviewState = {
  PreviewComponent?: ComponentType;
  error?: string;
};

function computePreview(code: string): PreviewState {
  try {
    return { PreviewComponent: compilePlaygroundCode(code) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to render preview.",
    };
  }
}

export function PlaygroundPreview({ code }: PlaygroundPreviewProps) {
  const preview = useMemo(() => computePreview(code), [code]);

  if (preview.error) {
    return <pre className={styles.previewError}>{preview.error}</pre>;
  }

  const PreviewComponent = preview.PreviewComponent!;

  return (
    <PreviewThemeBoundary className={styles.previewSurface}>
      <PreviewComponent />
    </PreviewThemeBoundary>
  );
}
