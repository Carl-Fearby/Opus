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
  const { theme, setTheme } = useComponentsTheme();

  return (
    <div
      className={
        variant === "toolbar"
          ? `${styles.previewThemeControls} ${styles.previewThemeControlsToolbar}`
          : styles.previewThemeControls
      }
    >
      <span className={styles.previewThemeLabel} id={`${id}-label`}>
        Theme
      </span>
      <ThemeToggleField
        className={styles.previewThemeField}
        id={id}
        label="Theme"
        labelVisuallyHidden
        labelPosition="left"
        mode="flagged"
        value={theme}
        onChange={setTheme}
      />
    </div>
  );
}
