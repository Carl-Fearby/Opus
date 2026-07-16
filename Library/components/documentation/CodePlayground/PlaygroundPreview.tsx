"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useMemo } from "react";
import type { ComponentType, ErrorInfo, ReactNode } from "react";
import type { Theme } from "@/components/fields/types";
import { PreviewThemeBoundary } from "@/components/control-detail/ControlDetail/PreviewThemeBoundary";
import { compilePlaygroundCode } from "@/lib/playground/compilePlaygroundCode";
import styles from "./CodePlayground.module.css";

const UsageCodeEditor = dynamic(
  () => import("@/components/control-detail/UsageCodeEditor").then((module) => module.UsageCodeEditor),
  { ssr: false },
);

type PlaygroundPreviewProps = {
  code: string;
  padded?: boolean;
  theme: Theme;
  onErrorChange?: (error: string | null) => void;
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

type PreviewErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string;
  onError: (error: string) => void;
};

type PreviewErrorBoundaryState = {
  error: string | null;
  resetKey: string;
};

class PreviewErrorBoundary extends Component<PreviewErrorBoundaryProps, PreviewErrorBoundaryState> {
  state: PreviewErrorBoundaryState = {
    error: null,
    resetKey: this.props.resetKey,
  };

  static getDerivedStateFromError(error: Error): Partial<PreviewErrorBoundaryState> {
    return { error: error.message };
  }

  static getDerivedStateFromProps(
    props: PreviewErrorBoundaryProps,
    state: PreviewErrorBoundaryState,
  ): Partial<PreviewErrorBoundaryState> | null {
    if (props.resetKey !== state.resetKey) {
      return {
        error: null,
        resetKey: props.resetKey,
      };
    }

    return null;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const details = `${error.message}${errorInfo.componentStack ? `\n\n${errorInfo.componentStack}` : ""}`;
    this.props.onError(details);
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.previewErrorEditor}>
          <UsageCodeEditor code={this.state.error} fillHeight />
        </div>
      );
    }

    return this.props.children;
  }
}

export function PlaygroundPreview({ code, padded = true, theme, onErrorChange }: PlaygroundPreviewProps) {
  const preview = useMemo(() => computePreview(code), [code]);

  useEffect(() => {
    if (preview.error) {
      onErrorChange?.(preview.error);
    }
  }, [onErrorChange, preview.error]);

  if (preview.error) {
    return (
      <div className={styles.previewErrorEditor}>
        <UsageCodeEditor code={preview.error} fillHeight />
      </div>
    );
  }

  const PreviewComponent = preview.PreviewComponent!;

  return (
    <PreviewThemeBoundary
      key={theme}
      theme={theme}
      className={styles.previewSurface}
      data-padded={padded ? "true" : "false"}
    >
      <PreviewErrorBoundary
        resetKey={`${theme}:${code}`}
        onError={(error) => onErrorChange?.(error)}
      >
        <div className={styles.previewCanvas}>
          <PreviewComponent />
        </div>
      </PreviewErrorBoundary>
    </PreviewThemeBoundary>
  );
}
