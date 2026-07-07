"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AccentColorPicker, useAccentPreference } from "@/components/AccentColorPicker";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import { ThemeToggleField } from "@/components/fields";
import type { Theme } from "@/components/fields/types";
import { COMPONENTS_BASE_PATH, GUIDE_BASE_PATH, VERSION_BASE_PATH } from "@/lib/documentation/routes";
import { currentVersion } from "@/lib/documentation/versionLog";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import styles from "./documentation.module.css";

const THEME_STORAGE_KEY = "opus-components-theme";

export function DocumentationHub() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const { accent, accentStyle, setAccent } = useAccentPreference();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  return (
    <OpusThemeProvider theme={theme}>
      <div className={styles.shell} data-theme={theme} style={accentStyle}>
        <DocumentationTopBar
          current="home"
          trailing={
            <>
              <AccentColorPicker
                id="documentation-accent-picker"
                value={accent}
                onChange={setAccent}
              />
              <ThemeToggleField
                id="documentation-theme-toggle"
                label="Theme"
                labelPosition="left"
                mode="flagged"
                value={theme}
                onChange={setTheme}
              />
            </>
          }
        />
        <div className={styles.hub}>
          <p className={styles.hubDescription}>
            Explore the component library, read the project guide, and copy usage examples for every
            control.
          </p>
          <div className={styles.hubGrid}>
            <Link className={styles.hubCard} href={GUIDE_BASE_PATH}>
              <h3 className={styles.hubCardTitle}>Guide</h3>
              <p className={styles.hubCardDescription}>
                Architecture, theming, development site notes, and how to add new components.
              </p>
            </Link>
            <Link className={styles.hubCard} href={COMPONENTS_BASE_PATH}>
              <h3 className={styles.hubCardTitle}>Components</h3>
              <p className={styles.hubCardDescription}>
                Browse all 47 controls with live previews, settings, and generated usage code.
              </p>
            </Link>
            <Link className={styles.hubCard} href={VERSION_BASE_PATH}>
              <h3 className={styles.hubCardTitle}>Version {currentVersion}</h3>
              <p className={styles.hubCardDescription}>
                Release history generated from git commits, with summaries for each shipped change.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </OpusThemeProvider>
  );
}
