"use client";

import { Badge, Button, OpusThemeProvider, TextField } from "opus-react";
import styles from "./ThemeShowcase.module.css";

const themes = [
  { name: "Light", theme: "light" as const, status: "Ready for review" },
  { name: "Dark", theme: "dark" as const, status: "Ready for review" },
];

type ThemeShowcaseProps = {
  componentCount: number;
};

export function ThemeShowcase({ componentCount }: ThemeShowcaseProps) {
  return (
    <section className={styles.section} aria-labelledby="theme-showcase-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>New in Opus 0.7 · Visual theme designer</p>
          <h2 id="theme-showcase-title">Build a complete theme visually. Use it everywhere.</h2>
          <p>
            Set colours, tile gradients, typography, radius, surface treatment, and light or dark mode in one live workspace.
            Opus turns those choices into a provider-ready theme that applies across your application while individual components can still opt out.
          </p>
          <ul className={styles.featureList}>
            <li>Live component canvas with controls, tiles, widgets, forms, and actions.</li>
            <li>Primary, secondary, tertiary, and tile accent tokens with light and dark previews.</li>
            <li>Desktop and mobile preview modes, plus copy-ready provider code for your parent application.</li>
          </ul>
        </div>

        <div className={styles.snapshots}>
          {themes.map(({ name, status, theme }) => (
            <OpusThemeProvider applyToDocument={false} key={theme} theme={theme}>
              <article className={styles.snapshot} data-theme={theme}>
                <header className={styles.snapshotHeader}>
                  <span className={styles.windowDots} aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>{name} theme</span>
                </header>
                <div className={styles.snapshotBody}>
                  <div className={styles.snapshotTitle}>
                    <div>
                      <p>Shared theme</p>
                      <strong>Visual system refresh</strong>
                    </div>
                    <Badge tone="success">{status}</Badge>
                  </div>
                  <div className={styles.metrics}>
                    <div><span>Coverage</span><strong>94%</strong></div>
                    <div><span>Components</span><strong>{componentCount}</strong></div>
                  </div>
                  <TextField
                    id={`theme-preview-${theme}`}
                    label="Project name"
                    onChange={() => undefined}
                    value="Opus workspace"
                  />
                  <div className={styles.actions}>
                    <Button size="sm" type="button">Save changes</Button>
                    <Button size="sm" type="button" variant="secondary">Preview</Button>
                  </div>
                </div>
              </article>
            </OpusThemeProvider>
          ))}
        </div>
      </div>
    </section>
  );
}
