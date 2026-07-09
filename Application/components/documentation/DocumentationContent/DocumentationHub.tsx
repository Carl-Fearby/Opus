"use client";

import Link from "next/link";
import { AccentColorPicker, useAccentPreference } from "opus-react";
import { OpusThemeProvider } from "opus-react";
import { ThemeToggleField } from "opus-react";
import { COMPONENTS_BASE_PATH, GUIDE_BASE_PATH, VERSION_BASE_PATH } from "@/lib/documentation/routes";
import { libraryVersion } from "@/lib/documentation/libraryVersion";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { useStoredTheme } from "@/lib/theme/useStoredTheme";
import styles from "./documentation.module.css";

export function DocumentationHub() {
  const [theme, setTheme] = useStoredTheme();
  const { accent, accentStyle, setAccent } = useAccentPreference();

  return (
    <OpusThemeProvider theme={theme}>
      <div className={styles.shell} style={accentStyle}>
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
          <DocumentationBreadcrumbs currentLabel="Home" />
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
              <h3 className={styles.hubCardTitle}>Version {libraryVersion}</h3>
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
