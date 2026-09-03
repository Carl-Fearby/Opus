"use client";

import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import type { VersionEntry } from "@/lib/documentation/versionLog";
import { commitLog } from "@/lib/documentation/commitLog";
import { libraryVersion } from "@/lib/documentation/libraryVersion";
import { versionLog } from "@/lib/documentation/versionLog";
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

function CommitHistory() {
  return (
    <section className={styles.commitHistory} aria-labelledby="commit-history-title">
      <div className={styles.commitHistoryHeading}>
        <div>
          <p className={styles.versionEyebrow}>Source history</p>
          <h2 id="commit-history-title">Every commit</h2>
        </div>
        <p>
          Each entry is the exact Git commit behind the release narrative above. Commit subjects
          record the individual implementation, fix, test, or maintenance change.
        </p>
      </div>
      <ol className={styles.commitList}>
        {commitLog.map((commit) => (
          <li className={styles.commitItem} key={commit.hash}>
            <a
              className={styles.commitHash}
              href={`https://github.com/Carl-Fearby/Opus/commit/${commit.hash}`}
              rel="noreferrer"
              target="_blank"
            >
              {commit.shortHash}
            </a>
            <time dateTime={commit.committedAt}>{formatReleasedDate(commit.committedAt)}</time>
            <span>{commit.summary}</span>
          </li>
        ))}
      </ol>
    </section>
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
              Shipped changes grouped by library release. Run{" "}
              <code className={styles.versionInlineCode}>npm run sync-versions</code> after shipping
              changes to refresh this log.
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
          <CommitHistory />
        </div>
      </div>
    </OpusThemeProvider>
  );
}
