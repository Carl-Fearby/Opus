"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { useComponentSettings } from "@/components/development/ComponentsShell/ComponentSettingsContext";
import { componentRawPath } from "@/lib/controls/routes";
import type { ControlDefinition, ControlSettings } from "@/lib/controls/types";
import { ControlDetailPanel } from "./ControlDetailPanel";
import { OpenInPlaygroundLink } from "./OpenInPlaygroundLink";
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

  const panelActions = (
    <>
      <PreviewThemeControls id={`preview-theme-toggle-${control.slug}`} />
      <OpenInPlaygroundLink category={control.category} settings={settings} slug={control.slug} />
      <Link
        className={styles.panelActionButton}
        href={componentRawPath(control.slug, settings)}
        rel="noopener noreferrer"
        target="_blank"
      >
        Open Preview
      </Link>
    </>
  );

  return (
    <div className={styles.page}>
      <ControlDetailPanel actions={panelActions} title="Preview">
        <div className={styles.previewBody}>
          <PreviewStage>
            <ControlPreview
              category={control.category}
              slug={control.slug}
              settings={settings}
              onSettingsChange={setSettings}
            />
          </PreviewStage>
        </div>
      </ControlDetailPanel>

      {documentation ? <ComponentDocumentation content={documentation} /> : null}

      <UsageCodeViewer category={control.category} settings={settings} slug={control.slug} />
    </div>
  );
}
