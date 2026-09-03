"use client";

import { Badge, Button, OpusThemeProvider, TextField } from "opus-react";
import styles from "./ThemeShowcase.module.css";

const themes = [
  { name: "Light", theme: "light" as const, status: "Ready for review" },
  { name: "Dark", theme: "dark" as const, status: "Ready for review" },
];

export function ThemeShowcase() {
  return (
    <section className={styles.section} aria-labelledby="theme-showcase-title">
      <div className={styles.inner}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Designed for both modes</p>
          <h2 id="theme-showcase-title">One component system. Light and dark by default.</h2>
          <p>
            Opus components inherit theme tokens instead of baking in a single visual treatment.
            Switch the provider, retain the same component API, and tune accents at runtime.
          </p>
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
                      <p>Project overview</p>
                      <strong>Design system refresh</strong>
                    </div>
                    <Badge tone="success">{status}</Badge>
                  </div>
                  <div className={styles.metrics}>
                    <div><span>Coverage</span><strong>94%</strong></div>
                    <div><span>Components</span><strong>180+</strong></div>
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
