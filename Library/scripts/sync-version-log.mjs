import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { releaseNotesOverlay } from "./release-notes-overlay.mjs";

const OUTPUT_PATH = path.join(process.cwd(), "lib/documentation/versionLog.ts");
const RELEASE_VERSION_PATTERNS = [
  /chore:\s*release opus-react@(\d+\.\d+\.\d+)/i,
  /release:\s*publish opus-react\s+(\d+\.\d+\.\d+)/i,
  /feat:\s*release opus-react\s+(\d+\.\d+\.\d+)/i,
  /publish(?:ed)?\s+opus-react@?(\d+\.\d+\.\d+)/i,
];

const SKIP_CHANGE_PATTERNS = [
  /^chore:\s*release opus-react@/i,
  /^sync version log/i,
];

function parseReleaseVersion(summary) {
  for (const pattern of RELEASE_VERSION_PATTERNS) {
    const match = summary.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function parseCommitLine(line) {
  const [hash, dateTime, ...messageParts] = line.split("|");
  const summary = messageParts.join("|").trim();

  return {
    hash: hash.trim(),
    releasedAt: dateTime.trim().slice(0, 10),
    summary,
  };
}

function nextVersion(current, summary) {
  let { major, minor, patch } = current;
  const lower = summary.toLowerCase();

  if (/^(add|feat|feature)(\(|:|)/.test(lower)) {
    minor += 1;
    patch = 0;
    return { major, minor, patch };
  }

  if (/^(fix|hotfix)(\(|:|)/.test(lower)) {
    patch += 1;
    return { major, minor, patch };
  }

  if (/^(break|breaking)(\(|:|)/.test(lower)) {
    major += 1;
    minor = 0;
    patch = 0;
    return { major, minor, patch };
  }

  patch += 1;
  return { major, minor, patch };
}

function formatVersion({ major, minor, patch }) {
  return `${major}.${minor}.${patch}`;
}

function shouldSkipChange(summary) {
  return SKIP_CHANGE_PATTERNS.some((pattern) => pattern.test(summary));
}

function cleanChange(summary) {
  return summary
    .replace(/^chore:\s*/i, "")
    .replace(/^fix:\s*/i, "")
    .replace(/^feat:\s*/i, "")
    .trim();
}

function createEntry({ version, releasedAt, commit, summary, changes = [], alsoPublished = [] }) {
  const entry = {
    version,
    releasedAt,
    commit: commit.hash,
    commitShort: commit.hash.slice(0, 7),
    summary,
  };

  if (changes.length > 0) {
    entry.changes = changes;
  }

  if (alsoPublished.length > 0) {
    entry.alsoPublished = alsoPublished;
  }

  return entry;
}

function buildPreReleaseEntries(commits) {
  let current = { major: 0, minor: 1, patch: -1 };
  const entries = [];

  for (const commit of commits) {
    if (parseReleaseVersion(commit.summary)) {
      break;
    }

    if (shouldSkipChange(commit.summary)) {
      continue;
    }

    current = nextVersion(current, commit.summary);
    const change = cleanChange(commit.summary);

    entries.push(
      createEntry({
        version: formatVersion(current),
        releasedAt: commit.releasedAt,
        commit,
        summary: change,
        changes: [change],
      }),
    );
  }

  return entries;
}

function indexReleaseCommits(commits) {
  const byVersion = new Map();

  for (const commit of commits) {
    const version = parseReleaseVersion(commit.summary);
    if (version && !byVersion.has(version)) {
      byVersion.set(version, commit);
    }
  }

  return byVersion;
}

function findCommitMentioningVersion(commits, version) {
  const pattern = new RegExp(`opus-react[@\\s]+${version.replaceAll(".", "\\.")}\\b`, "i");
  for (let index = commits.length - 1; index >= 0; index -= 1) {
    if (pattern.test(commits[index].summary)) {
      return commits[index];
    }
  }
  return undefined;
}

function resolveOverlayCommit(note, commits, releaseCommits) {
  if (note.commit) {
    const exact = commits.find((item) => item.hash.startsWith(note.commit));
    if (exact) {
      return exact;
    }
  }

  return (
    releaseCommits.get(note.version) ??
    findCommitMentioningVersion(commits, note.version) ?? {
      hash: `overlay-${note.version}`,
      releasedAt: note.releasedAt,
      summary: note.summary,
    }
  );
}

function buildOverlayEntries(commits) {
  const releaseCommits = indexReleaseCommits(commits);

  return releaseNotesOverlay.map((note) => {
    const commit = resolveOverlayCommit(note, commits, releaseCommits);

    return createEntry({
      version: note.version,
      releasedAt: note.releasedAt,
      commit,
      summary: note.summary,
      changes: note.changes,
      alsoPublished: note.alsoPublished ?? [],
    });
  });
}

function buildVersionLog(commits) {
  return [...buildPreReleaseEntries(commits), ...buildOverlayEntries(commits)];
}

function renderVersionLog(entries) {
  const serialized = entries
    .map((entry) => {
      const lines = [
        `    version: ${JSON.stringify(entry.version)},`,
        `    releasedAt: ${JSON.stringify(entry.releasedAt)},`,
        `    commit: ${JSON.stringify(entry.commit)},`,
        `    commitShort: ${JSON.stringify(entry.commitShort)},`,
        `    summary: ${JSON.stringify(entry.summary)},`,
      ];

      if (entry.changes?.length) {
        lines.push(`    changes: ${JSON.stringify(entry.changes)},`);
      }

      if (entry.alsoPublished?.length) {
        lines.push(`    alsoPublished: ${JSON.stringify(entry.alsoPublished)},`);
      }

      return `  {\n${lines.join("\n")}\n  }`;
    })
    .join(",\n");

  return `// Generated by scripts/sync-version-log.mjs — do not edit by hand.
// Run \`npm run sync-versions\` after new commits to refresh this log.
// Published release notes are curated in scripts/release-notes-overlay.mjs.

export type VersionEntry = {
  version: string;
  releasedAt: string;
  commit: string;
  commitShort: string;
  summary: string;
  changes?: string[];
  alsoPublished?: string[];
};

export const versionLog: VersionEntry[] = [
${serialized}
].reverse();

export const currentVersion = versionLog[0]?.version ?? "0.0.0";
`;
}

function main() {
  const output = execSync('git log --format="%H|%ai|%s" --reverse', {
    encoding: "utf8",
  }).trim();

  if (!output) {
    throw new Error("No git commits found.");
  }

  const commits = output.split("\n").map(parseCommitLine);
  const entries = buildVersionLog(commits);
  fs.writeFileSync(OUTPUT_PATH, renderVersionLog(entries));

  console.log(`Wrote ${entries.length} version entries to ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  console.log(`Current version: ${entries.at(-1)?.version ?? "0.0.0"}`);
}

main();
