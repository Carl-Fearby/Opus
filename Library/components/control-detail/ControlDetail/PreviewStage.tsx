"use client";

import type { ReactNode } from "react";
import { PreviewThemeBoundary } from "./PreviewThemeBoundary";
import styles from "./ControlDetail.module.css";

type PreviewStageProps = {
  borderless?: boolean;
  children: ReactNode;
};

export function PreviewStage({ borderless = false, children }: PreviewStageProps) {
  return (
    <PreviewThemeBoundary
      className={[styles.previewStage, borderless ? styles.previewStageBorderless : undefined].filter(Boolean).join(" ")}
    >
      {children}
    </PreviewThemeBoundary>
  );
}
