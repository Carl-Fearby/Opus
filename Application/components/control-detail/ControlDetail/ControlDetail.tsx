"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { useComponentSettings } from "@/components/development/ComponentsShell/ComponentSettingsContext";
import { componentRawPath } from "@/lib/controls/routes";
import type { ControlDefinition, ControlSettings } from "@/lib/controls/types";
import { PreviewLoading } from "./PreviewLoading";
import { PreviewStage } from "./PreviewStage";
import { PreviewThemeControls } from "./PreviewThemeControls";
import styles from "./ControlDetail.module.css";

const ControlPreview = dynamic(
  () => import("./ControlPreview").then((module) => module.ControlPreview),
  { loading: () => <PreviewLoading /> },
);

const ComponentDocumentation = dynamic(
  () =>
    import("@/components/control-detail/ComponentDocumentation/ComponentDocumentation").then(
      (module) => module.ComponentDocumentation,
    ),
  { loading: () => null },
);

const UsageCodeViewer = dynamic(
  () => import("./UsageCodeViewer").then((module) => module.UsageCodeViewer),
  { loading: () => null },
);

type ControlDetailProps = {
  control: ControlDefinition;
  defaultSettings: ControlSettings;
  documentation?: string;
};

export function ControlDetail({ control, defaultSettings, documentation }: ControlDetailProps) {
  useSetComponentsPageHeader(control.title, control.description);
  const { settings, setSettings } = useComponentSettings(control.slug, defaultSettings);
  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <div className="opus-panel-heading">
          <h2 className="opus-panel-title">Preview</h2>
          <div className={styles.previewToolbar}>
            <PreviewThemeControls id={`preview-theme-toggle-${control.slug}`} />
            <Link
              className={styles.panelActionButton}
              href={componentRawPath(control.slug, settings)}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open Preview
            </Link>
          </div>
        </div>
        <div className={styles.previewBody}>
          <PreviewStage>
            <ControlPreview slug={control.slug} settings={settings} onSettingsChange={setSettings} />
          </PreviewStage>
        </div>
      </section>

      {documentation ? <ComponentDocumentation content={documentation} /> : null}

      <UsageCodeViewer slug={control.slug} settings={settings} />
    </div>
  );
}
