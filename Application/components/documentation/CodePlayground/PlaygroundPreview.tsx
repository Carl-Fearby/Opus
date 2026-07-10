"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ComponentType } from "react";
import type { Theme } from "opus-react";
import { PreviewThemeBoundary } from "@/components/control-detail/ControlDetail/PreviewThemeBoundary";
import { compilePlaygroundCode } from "@/lib/playground/compilePlaygroundCode";
import styles from "./CodePlayground.module.css";

const UsageCodeEditor = dynamic(
  () => import("@/components/control-detail/UsageCodeEditor").then((module) => module.UsageCodeEditor),
  { ssr: false },
);

type PlaygroundPreviewProps = {
  code: string;
  theme: Theme;
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

export function PlaygroundPreview({ code, theme }: PlaygroundPreviewProps) {
  const preview = useMemo(() => computePreview(code), [code]);

  if (preview.error) {
    return (
      <div className={styles.previewErrorEditor}>
        <UsageCodeEditor code={preview.error} fillHeight />
      </div>
    );
  }

  const PreviewComponent = preview.PreviewComponent!;

  return (
    <PreviewThemeBoundary key={theme} theme={theme} className={styles.previewSurface}>
      <PreviewComponent />
    </PreviewThemeBoundary>
  );
}
