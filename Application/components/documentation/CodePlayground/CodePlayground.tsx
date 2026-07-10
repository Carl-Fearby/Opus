"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { Splitter, type SplitterOrientation } from "opus-react";
import type { Theme } from "opus-react";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { PreviewThemeControls } from "@/components/control-detail/ControlDetail/PreviewThemeControls";
import { patchAppSetupPlaygroundTheme } from "@/lib/controls/appSetupBoilerplate";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import { getControl } from "@/lib/controls/registry";
import type { AppSetupSettings, ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import { DEFAULT_PLAYGROUND_CODE } from "@/lib/playground/defaultPlaygroundCode";
import { readPlaygroundPanelSize, storePlaygroundPanelSize } from "@/lib/playground/playgroundPanelSize";
import { readPlaygroundSeed } from "@/lib/playground/playgroundNavigation";
import { usePlaygroundTheme } from "@/lib/playground/playgroundTheme";
import styles from "./CodePlayground.module.css";
import { PlaygroundPreview } from "./PlaygroundPreview";

const UsageCodeEditor = dynamic(
  () => import("@/components/control-detail/UsageCodeEditor").then((module) => module.UsageCodeEditor),
  { ssr: false },
);

type CodePlaygroundProps = {
  initialCategory?: string | null;
  initialSlug?: string | null;
};

function useSplitterOrientation(): SplitterOrientation {
  const [orientation, setOrientation] = useState<SplitterOrientation>("horizontal");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 960px)");
    const update = () => setOrientation(media.matches ? "vertical" : "horizontal");

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return orientation;
}

function usePlaygroundPanelSize(orientation: SplitterOrientation) {
  const fallback = orientation === "horizontal" ? 50 : 42;
  const [size, setSize] = useState(fallback);

  useEffect(() => {
    setSize(readPlaygroundPanelSize(orientation, fallback));
  }, [fallback, orientation]);

  const onSizeChange = useCallback(
    (next: number) => {
      setSize(next);
      storePlaygroundPanelSize(orientation, next);
    },
    [orientation],
  );

  return { onSizeChange, size };
}

function resolveInitialCode(
  initialSlug?: string | null,
  initialCategory?: string | null,
  seedSettings?: ControlSettings,
  playgroundTheme?: Theme,
) {
  if (!initialSlug) {
    return DEFAULT_PLAYGROUND_CODE;
  }

  const category = initialCategory ? (initialCategory as ComponentCategory) : undefined;
  const control = getControl(initialSlug, category ? { category } : undefined) ?? getControl(initialSlug);

  if (!control) {
    return DEFAULT_PLAYGROUND_CODE;
  }

  const settings = seedSettings ?? getDefaultSettings(initialSlug as ControlSlug);
  const resolvedSettings =
    initialSlug === "app-setup"
      ? ({ ...settings, theme: playgroundTheme ?? (settings as AppSetupSettings).theme } as AppSetupSettings)
      : settings;

  return generateUsageCode(initialSlug as ControlSlug, resolvedSettings, control.category).full;
}

export function CodePlayground({ initialCategory = null, initialSlug = null }: CodePlaygroundProps) {
  const orientation = useSplitterOrientation();
  const { onSizeChange, size } = usePlaygroundPanelSize(orientation);
  const [playgroundTheme, setPlaygroundTheme] = usePlaygroundTheme();
  const [seedCode, setSeedCode] = useState(() =>
    resolveInitialCode(initialSlug, initialCategory, undefined, playgroundTheme),
  );
  const [code, setCode] = useState(() => resolveInitialCode(initialSlug, initialCategory, undefined, playgroundTheme));

  useEffect(() => {
    const seed = readPlaygroundSeed();
    const slug = initialSlug ?? seed?.slug ?? null;
    const category = initialCategory ?? seed?.category ?? null;
    const seedSettings =
      seed && seed.slug === slug && (!category || seed.category === category) ? seed.settings : undefined;
    const nextCode = resolveInitialCode(slug, category, seedSettings, playgroundTheme);

    setSeedCode(nextCode);
    setCode(nextCode);
  }, [initialCategory, initialSlug]);

  useEffect(() => {
    if (initialSlug !== "app-setup") {
      return;
    }

    const category = initialCategory ? (initialCategory as ComponentCategory) : "system";
    const nextSeed = generateUsageCode("app-setup", { theme: playgroundTheme }, category).full;

    setSeedCode(nextSeed);
    setCode((current) =>
      current.includes("OpusAppShell") ? patchAppSetupPlaygroundTheme(current, playgroundTheme) : nextSeed,
    );
  }, [initialCategory, initialSlug, playgroundTheme]);

  return (
    <div className={styles.playground}>
      <DocumentationTopBar current="playground" />
      <div className={styles.body}>
        <Splitter
          className={styles.splitter}
          flush
          minSize={25}
          onSizeChange={onSizeChange}
          orientation={orientation}
          size={size}
        >
          <section className={`${styles.pane} ${styles.editorPane}`}>
            <div className={styles.paneHeader}>
              <div>
                <h1 className={styles.paneTitle}>Source</h1>
                <p className={styles.paneHint}>Edit the component, then preview updates on the right.</p>
              </div>
              <button className={styles.resetButton} type="button" onClick={() => setCode(seedCode)}>
                Reset
              </button>
            </div>
            <div className={styles.paneBody}>
              <UsageCodeEditor
                editable
                code={code}
                fillHeight
                onChange={setCode}
              />
            </div>
          </section>
          <section className={`${styles.pane} ${styles.previewPane}`}>
            <div className={styles.paneHeader}>
              <div>
                <h2 className={styles.paneTitle}>Preview</h2>
                <p className={styles.paneHint}>Live render of your edited component.</p>
              </div>
              <div className={styles.paneActions}>
                <PreviewThemeControls
                  id="playground-preview-theme-toggle"
                  theme={playgroundTheme}
                  variant="toolbar"
                  onThemeChange={setPlaygroundTheme}
                />
              </div>
            </div>
            <div className={styles.paneBody}>
              <PlaygroundPreview code={code} theme={playgroundTheme} />
            </div>
          </section>
        </Splitter>
      </div>
    </div>
  );
}
