import type { Metadata } from "next";
import { commitLog } from "@/lib/documentation/commitLog";
import { libraryVersion } from "@/lib/documentation/libraryVersion";
import { versionLog } from "@/lib/documentation/versionLog";
import styles from "./version.module.css";

export const metadata: Metadata = {
  title: "Release notes",
  description: "Every opus-react release, its complete change notes, and the Git commit history behind it.",
  alternates: { canonical: "/version" },
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
}

export default function MarketingVersionPage() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>opus-react release notes</p>
        <h1>Everything we ship, explained.</h1>
        <p>
          Version {libraryVersion} is current. Each release lists every product change, followed
          by the complete source-commit record behind the project.
        </p>
      </header>

      <section aria-labelledby="releases-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Published packages</p>
            <h2 id="releases-title">Release history</h2>
          </div>
          <p>Detailed notes describe what was added, changed, fixed, or improved in each version.</p>
        </div>
        <ol className={styles.releaseList}>
          {versionLog.map((release) => (
            <li className={styles.release} key={release.version}>
              <div className={styles.releaseMeta}>
                <span>v{release.version}</span>
                <time dateTime={release.releasedAt}>{formatDate(release.releasedAt)}</time>
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
            <p className={styles.eyebrow}>Source history</p>
            <h2 id="commits-title">Every commit</h2>
          </div>
          <p>Open the timeline to see the exact linked Git record for every implementation, test, fix, and release change.</p>
        </div>
        <details className={styles.commitDetails}>
          <summary>View all {commitLog.length} commits</summary>
          <ol className={styles.commitList}>
            {commitLog.map((commit) => (
              <li key={commit.hash}>
                <a href={`https://github.com/Carl-Fearby/Opus/commit/${commit.hash}`} rel="noreferrer" target="_blank">
                  {commit.shortHash}
                </a>
                <time dateTime={commit.committedAt}>{formatDate(commit.committedAt)}</time>
                <span>{commit.summary}</span>
              </li>
            ))}
          </ol>
        </details>
      </section>
    </div>
  );
}
