"use client";

import { ThemeToggleField } from "@/components/fields";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./ControlDetail.module.css";

type PreviewThemeControlsProps = {
  id?: string;
  variant?: "panel" | "toolbar";
};

export function PreviewThemeControls({
  id = "preview-theme-toggle",
  variant = "panel",
}: PreviewThemeControlsProps) {
  const { previewTheme, setPreviewTheme } = useComponentsTheme();

  return (
    <div
      className={
        variant === "toolbar"
          ? `${styles.previewThemeControls} ${styles.previewThemeControlsToolbar}`
          : styles.previewThemeControls
      }
    >
      <span className={styles.previewThemeLabel} id={`${id}-label`}>
        Preview theme
      </span>
      <ThemeToggleField
        className={styles.previewThemeField}
        id={id}
        label="Preview theme"
        labelVisuallyHidden
        labelPosition="left"
        mode="flagged"
        value={previewTheme}
        onChange={setPreviewTheme}
      />
    </div>
  );
}
