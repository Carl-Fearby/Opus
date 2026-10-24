import type { Metadata } from "next";
import { commitLog } from "@/lib/documentation/commitLog";
import { libraryVersion } from "@/lib/documentation/libraryVersion";
import { versionLog } from "@/lib/documentation/versionLog";
import { translate } from "@/lib/i18n";
import { readServerLocale } from "@/lib/i18n/server";
import styles from "./version.module.css";

export const metadata: Metadata = {
  title: "Release notes",
  description: "Every opus-react release, its complete change notes, and the Git commit history behind it.",
  alternates: { canonical: "/version" },
};

function formatDate(isoDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

export default async function MarketingVersionPage() {
  const locale = await readServerLocale();
  const t = (key: Parameters<typeof translate>[1], params?: Record<string, string | number>) =>
    translate(locale, key, params);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>{t("marketing.version.eyebrow")}</p>
        <h1>{t("marketing.version.title")}</h1>
        <p>{t("marketing.version.description", { version: libraryVersion })}</p>
      </header>

      <section aria-labelledby="releases-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>{t("marketing.version.publishedPackages")}</p>
            <h2 id="releases-title">{t("marketing.version.releaseHistory")}</h2>
          </div>
          <p>{t("marketing.version.releaseHistoryDescription")}</p>
        </div>
        <ol className={styles.releaseList}>
          {versionLog.map((release) => (
            <li className={styles.release} key={release.version}>
              <div className={styles.releaseMeta}>
                <span>v{release.version}</span>
                <time dateTime={release.releasedAt}>{formatDate(release.releasedAt, locale)}</time>
              </div>
              <h3>{release.summary}</h3>
              {release.changes?.length ? (
                <ul>
                  {release.changes.map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="commits-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>{t("docs.version.sourceHistory")}</p>
            <h2 id="commits-title">{t("docs.version.everyCommit")}</h2>
          </div>
          <p>{t("marketing.version.commitDescription")}</p>
        </div>
        <details className={styles.commitDetails}>
          <summary>{t("marketing.version.viewCommits", { count: commitLog.length })}</summary>
          <ol className={styles.commitList}>
            {commitLog.map((commit) => (
              <li key={commit.hash}>
                <a href={`https://github.com/Carl-Fearby/Opus/commit/${commit.hash}`} rel="noreferrer" target="_blank">
                  {commit.shortHash}
                </a>
                <time dateTime={commit.committedAt}>{formatDate(commit.committedAt, locale)}</time>
                <span>{commit.summary}</span>
              </li>
            ))}
          </ol>
        </details>
      </section>
    </div>
  );
}
