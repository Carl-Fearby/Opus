"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { DocumentationTopBar } from "@/components/documentation/DocumentationTopBar";
import { getDefaultSettings } from "@/lib/controls/defaults";
import { generateFullUsageCode } from "@/lib/controls/generateUsageCode";
import { getControl } from "@/lib/controls/registry";
import type { ComponentCategory, ControlSettings, ControlSlug } from "@/lib/controls/types";
import { DEFAULT_PLAYGROUND_CODE } from "@/lib/playground/defaultPlaygroundCode";
import { readPlaygroundSeed } from "@/lib/playground/playgroundNavigation";
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

function resolveInitialCode(
  initialSlug?: string | null,
  initialCategory?: string | null,
  seedSettings?: ControlSettings,
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

  return generateFullUsageCode(initialSlug as ControlSlug, settings, control.category);
}

export function CodePlayground({ initialCategory = null, initialSlug = null }: CodePlaygroundProps) {
  const seedCode = useMemo(() => {
    const seed = readPlaygroundSeed();
    const seedSettings =
      seed &&
      seed.slug === initialSlug &&
      (!initialCategory || seed.category === initialCategory)
        ? seed.settings
        : undefined;

    return resolveInitialCode(initialSlug, initialCategory, seedSettings);
  }, [initialCategory, initialSlug]);
  const [code, setCode] = useState(seedCode);

  useEffect(() => {
    setCode(seedCode);
  }, [seedCode]);

  return (
    <div className={styles.playground}>
      <DocumentationTopBar current="playground" />
      <div className={styles.body}>
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
              maxHeight="none"
              minHeight="100%"
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
          </div>
          <div className={styles.paneBody}>
            <PlaygroundPreview code={code} />
          </div>
        </section>
      </div>
    </div>
  );
}
