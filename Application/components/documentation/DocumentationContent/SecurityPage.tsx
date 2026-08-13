"use client";

import { CopyButton, OpusThemeProvider } from "opus-react";
import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import { useStoredTheme } from "@/lib/theme/useStoredTheme";
import shellStyles from "./documentation.module.css";
import styles from "./security.module.css";

const remediationCommand = "npm install next@16.3.0 eslint-config-next@16.3.0";
const imageCommand = "npm install next@16.3.0 eslint-config-next@16.3.0 sharp@^0.35.3";
const auditCommand = "npm audit --omit=dev";
const requiredOnlyCommand = "npm audit --omit=dev --omit=optional";

const activeFindings = [
  {
    dependency: "next",
    installed: "16.2.12",
    relationship: "Direct production dependency",
    severity: "High",
    advisory: "Inherited from optional Sharp",
    advisoryHref: "https://github.com/advisories/GHSA-f88m-g3jw-g9cj",
    detail:
      "The current Next.js range permits Sharp 0.34.5. npm therefore reports Next as affected through that optional image-processing path.",
    resolution: "Upgrade Next.js to 16.3.0 or newer.",
  },
  {
    dependency: "sharp",
    installed: "0.34.5",
    relationship: "Optional transitive dependency",
    severity: "High",
    advisory: "GHSA-f88m-g3jw-g9cj",
    advisoryHref: "https://github.com/advisories/GHSA-f88m-g3jw-g9cj",
    detail:
      "Sharp versions below 0.35.0 inherit libvips CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, and CVE-2026-35591.",
    resolution: "Next.js 16.3.0 permits Sharp 0.35.3 or newer.",
  },
] as const;

const resolvedFindings = [
  {
    dependency: "nanoid",
    version: "3.3.18",
    advisory: "GHSA-2v37-7h3g-55p8",
    href: "https://github.com/advisories/GHSA-2v37-7h3g-55p8",
    note: "Updated through the PostCSS dependency chain.",
  },
  {
    dependency: "brace-expansion",
    version: "1.1.18 / 5.0.9",
    advisory: "Three ReDoS advisories",
    href: "https://github.com/advisories/GHSA-3jxr-9vmj-r5cp",
    note: "Development dependency paths are patched.",
  },
  {
    dependency: "js-yaml",
    version: "4.3.1",
    advisory: "GHSA-5p4m-2wfm-xmqj",
    href: "https://github.com/advisories/GHSA-5p4m-2wfm-xmqj",
    note: "Development dependency path is patched.",
  },
] as const;

function Command({ command, label }: { command: string; label: string }) {
  return (
    <div className={styles.commandRow}>
      <code>{command}</code>
      <CopyButton label={`Copy ${label}`} value={command} />
    </div>
  );
}

export function SecurityPage() {
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
      <div className={shellStyles.shell} style={{ ...accentStyle, ...tileAccentStyle }}>
        <DocumentationTopBar
          current="security"
          trailing={
            <ThemeSettingsButton
              accent={accent}
              accentSecondary={accentSecondary}
              idPrefix="security"
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
        <main className={styles.page}>
          <DocumentationBreadcrumbs currentLabel="Security" />

          <header className={styles.hero}>
            <div>
              <p className={styles.eyebrow}>Dependency transparency</p>
              <h1>Security</h1>
              <p>
                A lockfile-backed view of known dependency findings, optional runtime paths, and
                the exact upgrade choices available to Opus consumers.
              </p>
            </div>
            <div className={styles.auditSummary} aria-label="Current audit summary">
              <span className={styles.highCount}>2 high</span>
              <span>0 critical</span>
              <span>0 development</span>
            </div>
          </header>

          <section className={styles.panel} aria-labelledby="snapshot-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Application/package-lock.json</p>
                <h2 id="snapshot-title">Current repository snapshot</h2>
              </div>
              <time dateTime="2026-08-13">Reviewed 13 August 2026</time>
            </div>
            <p className={styles.note}>
              npm reports two entries, but they describe one dependency chain: Next.js includes
              Sharp as an optional image-processing dependency. Optional means it may be absent;
              when it is installed and used, the advisory still matters.
            </p>
            <div className={styles.findings}>
              {activeFindings.map((finding) => (
                <article className={styles.finding} key={finding.dependency}>
                  <div className={styles.findingTitle}>
                    <h3>{finding.dependency}</h3>
                    <span className={styles.severity}>{finding.severity}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Installed</dt>
                      <dd>{finding.installed}</dd>
                    </div>
                    <div>
                      <dt>Relationship</dt>
                      <dd>{finding.relationship}</dd>
                    </div>
                    <div>
                      <dt>Advisory</dt>
                      <dd>
                        <a href={finding.advisoryHref} rel="noreferrer" target="_blank">
                          {finding.advisory}
                        </a>
                      </dd>
                    </div>
                  </dl>
                  <p>{finding.detail}</p>
                  <p className={styles.resolution}>{finding.resolution}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="choices-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Consumer choices</p>
                <h2 id="choices-title">Remediation and optional installs</h2>
              </div>
            </div>
            <div className={styles.choiceGrid}>
              <article>
                <h3>Recommended upgrade</h3>
                <p>Upgrade Next and its lint configuration together. Its optional Sharp range is patched.</p>
                <Command command={remediationCommand} label="upgrade command" />
              </article>
              <article>
                <h3>Image optimisation runtime</h3>
                <p>
                  If your deployment explicitly installs Sharp, upgrade Next first and pin a patched
                  Sharp version. Installing Sharp 0.35 alone does not repair Next 16.2&apos;s dependency range.
                </p>
                <Command command={imageCommand} label="image runtime command" />
              </article>
              <article>
                <h3>No native optional packages</h3>
                <p>
                  Install with <code>--omit=optional</code> only if your runtime does not require the
                  optional native image backend. Confirm image behaviour in your deployment target.
                </p>
                <Command command="npm install --omit=optional" label="optional omission command" />
              </article>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="resolved-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Recently addressed</p>
                <h2 id="resolved-title">Resolved findings</h2>
              </div>
            </div>
            <div className={styles.resolvedList}>
              {resolvedFindings.map((finding) => (
                <article key={finding.dependency}>
                  <div>
                    <h3>{finding.dependency}</h3>
                    <code>{finding.version}</code>
                  </div>
                  <p>{finding.note}</p>
                  <a href={finding.href} rel="noreferrer" target="_blank">
                    {finding.advisory}
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="verify-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Reproduce the result</p>
                <h2 id="verify-title">Audit commands</h2>
              </div>
            </div>
            <p className={styles.note}>
              Run these from <code>Application</code>. The first includes optional production
              dependencies; the second shows the required production graph only.
            </p>
            <div className={styles.commands}>
              <Command command={auditCommand} label="production audit command" />
              <Command command={requiredOnlyCommand} label="required dependency audit command" />
            </div>
          </section>
        </main>
      </div>
    </OpusThemeProvider>
  );
}
