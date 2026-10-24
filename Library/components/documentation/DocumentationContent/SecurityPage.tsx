"use client";

import { CopyButton, OpusThemeProvider } from "opus-react";
import { useAccentPreference, useTileAccentPreference } from "@/components/AccentColorPicker";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { ThemeSettingsButton } from "@/components/documentation/ThemeSettingsButton";
import { useStoredTheme } from "@/lib/theme/useStoredTheme";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { MessageKey } from "@/lib/i18n/config";
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
    noteKey: "docs.security.finding.next",
  },
  {
    dependency: "sharp",
    version: "0.35.4",
    advisory: "GHSA-f88m-g3jw-g9cj",
    href: "https://github.com/advisories/GHSA-f88m-g3jw-g9cj",
    noteKey: "docs.security.finding.sharp",
  },
  {
    dependency: "nanoid",
    version: "3.3.18",
    advisory: "GHSA-2v37-7h3g-55p8",
    href: "https://github.com/advisories/GHSA-2v37-7h3g-55p8",
    noteKey: "docs.security.finding.nanoid",
  },
  {
    dependency: "brace-expansion",
    version: "1.1.18 / 5.0.9",
    advisoryKey: "docs.security.threeRedos",
    href: "https://github.com/advisories/GHSA-3jxr-9vmj-r5cp",
    noteKey: "docs.security.finding.brace",
  },
  {
    dependency: "js-yaml",
    version: "4.3.1",
    advisory: "GHSA-5p4m-2wfm-xmqj",
    href: "https://github.com/advisories/GHSA-5p4m-2wfm-xmqj",
    noteKey: "docs.security.finding.jsYaml",
  },
] as const;

function Command({ command, label }: { command: string; label: MessageKey }) {
  const { t } = useLocale();
  return (
    <div className={styles.commandRow}>
      <code>{command}</code>
      <CopyButton label={t("docs.security.copyCommand", { label: t(label) })} value={command} />
    </div>
  );
}

export function SecurityPage() {
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
  const reviewedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date("2026-09-02T00:00:00"));

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
        <main className={styles.page}>
          <DocumentationBreadcrumbs currentLabel={t("docs.security.title")} />

          <header className={styles.hero}>
            <div>
              <p className={styles.eyebrow}>{t("docs.security.eyebrow")}</p>
              <h1>{t("docs.security.title")}</h1>
              <p>{t("docs.security.description")}</p>
            </div>
            <div className={styles.auditSummary} aria-label={t("docs.security.auditSummaryAria")}>
              <span>{t("docs.security.noHigh")}</span>
              <span>{t("docs.security.noCritical")}</span>
              <span>{t("docs.security.noDevelopment")}</span>
            </div>
          </header>

          <section className={styles.panel} aria-labelledby="snapshot-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>{t("docs.security.lockfile")}</p>
                <h2 id="snapshot-title">{t("docs.security.snapshotTitle")}</h2>
              </div>
              <time dateTime="2026-09-02">{t("docs.security.reviewed", { date: reviewedDate })}</time>
            </div>
            <p className={styles.note}>{t("docs.security.snapshotNote")}</p>
          </section>

          <section className={styles.panel} aria-labelledby="choices-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>{t("docs.security.consumerChoices")}</p>
                <h2 id="choices-title">{t("docs.security.baselineTitle")}</h2>
              </div>
            </div>
            <div className={styles.choiceGrid}>
              <article>
                <h3>{t("docs.security.baseline")}</h3>
                <p>{t("docs.security.baselineNote")}</p>
                <Command command={baselineCommand} label="docs.security.baselineCommand" />
              </article>
              <article>
                <h3>{t("docs.security.imageRuntime")}</h3>
                <p>{t("docs.security.imageRuntimeNote")}</p>
                <Command command={imageCommand} label="docs.security.imageCommand" />
              </article>
              <article>
                <h3>{t("docs.security.noNative")}</h3>
                <p>{t("docs.security.noNativeNote")}</p>
                <Command command="npm install --omit=optional" label="docs.security.optionalCommand" />
              </article>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="resolved-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>{t("docs.security.recentlyAddressed")}</p>
                <h2 id="resolved-title">{t("docs.security.resolvedFindings")}</h2>
              </div>
            </div>
            <div className={styles.resolvedList}>
              {resolvedFindings.map((finding) => (
                <article key={finding.dependency}>
                  <div>
                    <h3>{finding.dependency}</h3>
                    <code>{finding.version}</code>
                  </div>
                  <p>{t(finding.noteKey)}</p>
                  <a href={finding.href} rel="noreferrer" target="_blank">
                    {"advisoryKey" in finding ? t(finding.advisoryKey) : finding.advisory}
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="verify-title">
            <div className={styles.panelHeading}>
              <div>
                <p className={styles.eyebrow}>{t("docs.security.reproduce")}</p>
                <h2 id="verify-title">{t("docs.security.auditCommands")}</h2>
              </div>
            </div>
            <p className={styles.note}>{t("docs.security.auditNote")}</p>
            <div className={styles.commands}>
              <Command command={auditCommand} label="docs.security.productionAuditCommand" />
              <Command command={requiredOnlyCommand} label="docs.security.requiredAuditCommand" />
            </div>
          </section>
        </main>
      </div>
    </OpusThemeProvider>
  );
}
