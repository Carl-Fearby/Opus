"use client";

import { useCallback, useEffect, useState } from "react";
import { AccentColorPicker, useAccentPreference } from "opus-react";
import { OpusThemeProvider } from "opus-react";
import { ThemeToggleField } from "opus-react";
import type { Theme } from "opus-react";
import { currentVersion, versionLog } from "@/lib/documentation/versionLog";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import styles from "./documentation.module.css";

const THEME_STORAGE_KEY = "opus-components-theme";

function formatReleasedDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

export function VersionPage() {
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
          current="version"
          trailing={
            <>
              <AccentColorPicker id="version-accent-picker" value={accent} onChange={setAccent} />
              <ThemeToggleField
                id="version-theme-toggle"
                label="Theme"
                labelPosition="left"
                mode="flagged"
                value={theme}
                onChange={setTheme}
              />
            </>
          }
        />
        <div className={styles.versionPage}>
          <div className={styles.versionIntro}>
            <p className={styles.versionEyebrow}>Release history</p>
            <h1 className={styles.versionTitle}>Version {currentVersion}</h1>
            <p className={styles.versionDescription}>
              Opus versions are generated from git commits. Run{" "}
              <code className={styles.versionInlineCode}>npm run sync-versions</code> after shipping
              changes to refresh this log.
            </p>
          </div>
          <ol className={styles.versionList}>
            {versionLog.map((entry) => (
              <li className={styles.versionItem} key={entry.commit}>
                <div className={styles.versionItemHeader}>
                  <span className={styles.versionBadge}>v{entry.version}</span>
                  <time className={styles.versionDate} dateTime={entry.releasedAt}>
                    {formatReleasedDate(entry.releasedAt)}
                  </time>
                </div>
                <p className={styles.versionSummary}>{entry.summary}</p>
                <p className={styles.versionCommit}>
                  Commit{" "}
                  <code className={styles.versionInlineCode}>{entry.commitShort}</code>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </OpusThemeProvider>
  );
}
