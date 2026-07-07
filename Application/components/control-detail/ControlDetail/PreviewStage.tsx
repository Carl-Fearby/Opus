"use client";

import type { ReactNode } from "react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./ControlDetail.module.css";

type PreviewStageProps = {
  children: ReactNode;
};

export function PreviewStage({ children }: PreviewStageProps) {
  const { theme } = useComponentsTheme();

  return (
    <div className={styles.previewStage} data-theme={theme}>
      {children}
    </div>
  );
}
