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
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./documentation.module.css";

function formatReleasedDate(isoDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

function VersionEntryBody({ entry }: { entry: VersionEntry }) {
  const { t } = useLocale();
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
        <p className={styles.versionAlsoPublished}>
          {entry.alsoPublished.length === 1
            ? t("docs.version.alsoPublishedOne", { version: entry.alsoPublished[0] })
            : t("docs.version.alsoPublishedRange", {
                first: entry.alsoPublished[0],
                last: entry.alsoPublished.at(-1) ?? entry.alsoPublished[0],
              })}
        </p>
      ) : null}
    </>
  );
}

function CommitHistory() {
  const { locale, t } = useLocale();

  return (
    <section className={styles.commitHistory} aria-labelledby="commit-history-title">
      <div className={styles.commitHistoryHeading}>
        <div>
          <p className={styles.versionEyebrow}>{t("docs.version.sourceHistory")}</p>
          <h2 id="commit-history-title">{t("docs.version.everyCommit")}</h2>
        </div>
        <p>{t("docs.version.commitDescription")}</p>
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
            <time dateTime={commit.committedAt}>{formatReleasedDate(commit.committedAt, locale)}</time>
            <span>{commit.summary}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function VersionPage() {
  const { locale, t } = useLocale();
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
              themeLabel={t("docs.version.pageTheme")}
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
              {t("docs.version.descriptionBefore")}{" "}
              <code className={styles.versionInlineCode}>npm run sync-versions</code>{" "}
              {t("docs.version.descriptionAfter")}
            </p>
          </div>
          <ol className={styles.versionList}>
            {versionLog.map((entry) => (
              <li className={styles.versionItem} key={entry.version}>
                <div className={styles.versionItemHeader}>
                  <span className={styles.versionBadge}>v{entry.version}</span>
                  <time className={styles.versionDate} dateTime={entry.releasedAt}>
                    {formatReleasedDate(entry.releasedAt, locale)}
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
