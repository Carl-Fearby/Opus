"use client";

import { AccentColorPicker } from "opus-react";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./ComponentsShell.module.css";

export function ComponentsShellHeader() {
  const { accent, setAccent } = useComponentsTheme();

  return (
    <DocumentationTopBar
      current="components"
      trailing={
        <div className={styles.themeControl}>
          <AccentColorPicker id="global-accent-picker" value={accent} onChange={setAccent} />
        </div>
      }
    />
  );
}
