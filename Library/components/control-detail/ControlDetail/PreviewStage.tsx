"use client";

import type { ReactNode } from "react";
import { PreviewThemeBoundary } from "./PreviewThemeBoundary";
import styles from "./ControlDetail.module.css";

type PreviewStageProps = {
  children: ReactNode;
};

export function PreviewStage({ children }: PreviewStageProps) {
  return <PreviewThemeBoundary className={styles.previewStage}>{children}</PreviewThemeBoundary>;
}
