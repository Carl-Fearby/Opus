"use client";

import { CopyButton, OpusThemeProvider } from "opus-react";
import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import { useStoredTheme } from "@/lib/theme/useStoredTheme";
import shellStyles from "./documentation.module.css";
import styles from "./security.module.css";

const baselineCommand = "npm install next@16.3.4 eslint-config-next@16.3.4";
const imageCommand = "npm install next@16.3.4 eslint-config-next@16.3.4 sharp@^0.35.4";
const auditCommand = "npm audit --omit=dev";
const requiredOnlyCommand = "npm audit --omit=dev --omit=optional";

const resolvedFindings = [
  {
    dependency: "next",
    version: "16.3.4",
    advisory: "GHSA-f88m-g3jw-g9cj",
    href: "https://github.com/advisories/GHSA-f88m-g3jw-g9cj",
    note: "Upgraded from 16.2.12. Optional Sharp range now permits 0.35.4.",
  },
  {
    dependency: "sharp",
    version: "0.35.4",
    advisory: "GHSA-f88m-g3jw-g9cj",
    href: "https://github.com/advisories/GHSA-f88m-g3jw-g9cj",
    note: "Patched optional image-processing dependency shipped with Next.js 16.3.4.",
  },
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
              <span>0 high</span>
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
              <time dateTime="2026-09-02">Reviewed 2 September 2026</time>
            </div>
            <p className={styles.note}>
              npm reports no production vulnerabilities in this lockfile. Next.js 16.3.4 permits
              Sharp 0.35.4, which patches the optional image-processing advisories previously
              reported through 16.2.12.
            </p>
          </section>

          <section className={styles.panel} aria-labelledby="choices-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>Consumer choices</p>
                <h2 id="choices-title">Current baseline and optional installs</h2>
              </div>
            </div>
            <div className={styles.choiceGrid}>
              <article>
                <h3>Current baseline</h3>
                <p>
                  Stay on Next 16.3.4 and its matching lint configuration. This is the version in
                  Application/package-lock.json.
                </p>
                <Command command={baselineCommand} label="baseline command" />
              </article>
              <article>
                <h3>Image optimisation runtime</h3>
                <p>
                  If your deployment explicitly installs Sharp, pin a patched 0.35 release alongside
                  Next 16.3.4. Next&apos;s optional range already permits Sharp 0.35.4.
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
