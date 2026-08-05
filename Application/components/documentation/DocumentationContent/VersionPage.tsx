"use client";

import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { OpusThemeProvider } from "opus-react";
import type { VersionEntry } from "@/lib/documentation/versionLog";
import { libraryVersion } from "@/lib/documentation/libraryVersion";
import { versionLog } from "@/lib/documentation/versionLog";
import { roadmapMilestones } from "@/lib/documentation/roadmap";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import { useStoredTheme } from "@/lib/theme/useStoredTheme";
import styles from "./documentation.module.css";

function formatReleasedDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

function formatAlsoPublished(versions: string[]) {
  if (versions.length === 0) {
    return "";
  }

  if (versions.length === 1) {
    return `Also published as v${versions[0]}.`;
  }

  return `Also published as v${versions[0]}–v${versions.at(-1)}.`;
}

function VersionEntryBody({ entry }: { entry: VersionEntry }) {
  const changes = entry.changes ?? [];

  return (
    <>
      <p className={styles.versionSummary}>{entry.summary}</p>
      {changes.length > 1 ? (
        <ul className={styles.versionChanges}>
          {changes.map((change) => (
            <li key={change}>{change}</li>
          ))}
        </ul>
      ) : null}
      {entry.alsoPublished?.length ? (
        <p className={styles.versionAlsoPublished}>{formatAlsoPublished(entry.alsoPublished)}</p>
      ) : null}
    </>
  );
}

export function VersionPage() {
  const [theme, setTheme] = useStoredTheme();
  const { accent, accentSecondary, accentStyle, resetAccent, setAccent, setAccentSecondary } =
    useAccentPreference();
  const {
    resetTileAccent,
    setTileAccent,
    setTileAccentSecondary,
    tileAccent,
    tileAccentSecondary,
    tileAccentStyle,
  } = useTileAccentPreference();

  return (
    <OpusThemeProvider applyToDocument={false} theme={theme}>
      <div className={styles.shell} style={{ ...accentStyle, ...tileAccentStyle }}>
        <DocumentationTopBar
          current="version"
          trailing={
            <ThemeSettingsButton
              accent={accent}
              accentSecondary={accentSecondary}
              idPrefix="version"
              theme={theme}
              themeLabel="Page theme"
              tileAccent={tileAccent}
              tileAccentSecondary={tileAccentSecondary}
              onAccentChange={setAccent}
              onAccentSecondaryChange={setAccentSecondary}
              onResetAccent={resetAccent}
              onResetTileAccent={resetTileAccent}
              onThemeChange={setTheme}
              onTileAccentChange={setTileAccent}
              onTileAccentSecondaryChange={setTileAccentSecondary}
            />
          }
        />
        <div className={styles.versionPage}>
          <DocumentationBreadcrumbs />
          <div className={styles.versionIntro}>
            <p className={styles.versionEyebrow}>opus-react</p>
            <h1 className={styles.versionTitle}>v{libraryVersion}</h1>
            <p className={styles.versionDescription}>
              Current release, a detailed twelve-month delivery roadmap, and the complete history
              of shipped library changes.
            </p>
          </div>

          <section className={styles.roadmap} aria-labelledby="roadmap-title">
            <div className={styles.roadmapHeading}>
              <div>
                <p className={styles.versionEyebrow}>August 2026 — July 2027</p>
                <h2 id="roadmap-title">Twelve-month roadmap</h2>
              </div>
              <p>
                Monthly outcomes are divided into small, independently testable component and
                platform changes. Timing may move as research and user feedback shape priorities.
              </p>
            </div>

            <ol className={styles.roadmapList}>
              {roadmapMilestones.map((milestone, index) => (
                <li className={styles.roadmapItem} key={milestone.month}>
                  <div className={styles.roadmapMarker} aria-hidden="true">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <article className={styles.roadmapCard}>
                    <header className={styles.roadmapCardHeader}>
                      <div>
                        <p className={styles.roadmapMonth}>{milestone.month}</p>
                        <h3>{milestone.title}</h3>
                      </div>
                      <span
                        className={
                          milestone.status === "In progress"
                            ? styles.roadmapStatusActive
                            : styles.roadmapStatus
                        }
                      >
                        {milestone.status}
                      </span>
                    </header>
                    <p className={styles.roadmapOutcome}>{milestone.outcome}</p>
                    <ul className={styles.roadmapWork}>
                      {milestone.work.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.releaseHistory} aria-labelledby="release-history-title">
            <div className={styles.releaseHistoryHeading}>
              <div>
                <p className={styles.versionEyebrow}>Published packages</p>
                <h2 id="release-history-title">Release history</h2>
              </div>
              <p>
                Run <code className={styles.versionInlineCode}>npm run sync-versions</code> after
                shipping changes to refresh this log.
              </p>
            </div>
            <ol className={styles.versionList}>
              {versionLog.map((entry) => (
                <li className={styles.versionItem} key={entry.version}>
                  <div className={styles.versionItemHeader}>
                    <span className={styles.versionBadge}>v{entry.version}</span>
                    <time className={styles.versionDate} dateTime={entry.releasedAt}>
                      {formatReleasedDate(entry.releasedAt)}
                    </time>
                  </div>
                  <VersionEntryBody entry={entry} />
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </OpusThemeProvider>
  );
}
