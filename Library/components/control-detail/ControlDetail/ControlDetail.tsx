"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { DropdownMenu } from "@/components/DropdownMenu";
import { useComponentsTheme, useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import { useComponentSettings } from "@/components/development/ComponentsShell/ComponentSettingsContext";
import { componentRawPath } from "@/lib/controls/routes";
import { generateUsageCode } from "@/lib/controls/generateUsageCode";
import { isFullBleedPreview } from "@/lib/controls/previewPresentation";
import { storeRawPreviewSettings } from "@/lib/controls/rawSettings";
import { createExternalPreviewPayload } from "@/lib/playground/externalPreviewStorage";
import { buildPlaygroundHref, storePlaygroundSeed } from "@/lib/playground/playgroundNavigation";
import type { ControlDefinition, ControlSettings } from "@/lib/controls/types";
import { ControlDetailPanel } from "./ControlDetailPanel";
import { CompositionPartsList } from "./CompositionPartsList";
import { PreviewStage } from "./PreviewStage";
import { PreviewThemeControls } from "./PreviewThemeControls";
import { UsagePreview } from "./UsagePreview";
import styles from "./ControlDetail.module.css";

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
  const {
    previewAccent,
    previewAccentSecondary,
    previewBaseColor,
    previewFontFamily,
    previewTheme,
    previewTileAccent,
    previewTileAccentSecondary,
  } = useComponentsTheme();
  const { settings } = useComponentSettings(control.slug, defaultSettings);
  const previewAppearance = useMemo(
    () => ({
      accent: previewAccent,
      accentSecondary: previewAccentSecondary,
      baseColor: previewBaseColor,
      fontFamily: previewFontFamily,
      theme: previewTheme,
      tileAccent: previewTileAccent,
      tileAccentSecondary: previewTileAccentSecondary,
    }),
    [
      previewAccent,
      previewAccentSecondary,
      previewBaseColor,
      previewFontFamily,
      previewTheme,
      previewTileAccent,
      previewTileAccentSecondary,
    ],
  );
  const previewSettings = useMemo(
    () => control.slug === "app-setup"
      ? {
        ...settings,
        accent: previewAccent,
        accentSecondary: previewAccentSecondary,
        baseColor: previewBaseColor,
        fontFamily: previewFontFamily,
        theme: previewTheme,
        tileAccent: previewTileAccent,
        tileAccentSecondary: previewTileAccentSecondary,
      } as ControlSettings
      : settings,
    [
      control.slug,
      previewAccent,
      previewAccentSecondary,
      previewBaseColor,
      previewFontFamily,
      previewTheme,
      previewTileAccent,
      previewTileAccentSecondary,
      settings,
    ],
  );

  useEffect(() => {
    storePlaygroundSeed({
      appearance: previewAppearance,
      category: control.category,
      code: generateUsageCode(control.slug, previewSettings, control.category).full,
      settings: previewSettings,
      slug: control.slug,
    });
  }, [control.category, control.slug, previewAppearance, previewSettings]);

  const panelActions = (
    <>
      <PreviewThemeControls id={`preview-theme-toggle-${control.slug}`} />
      <DropdownMenu
        label="Open preview options"
        placement="bottom-end"
        items={[
          {
            id: "playground",
            label: "Open in Playground",
            onSelect: () => {
              storePlaygroundSeed({
                appearance: previewAppearance,
                category: control.category,
                code: generateUsageCode(control.slug, previewSettings, control.category).full,
                settings: previewSettings,
                slug: control.slug,
              });
              window.location.assign(buildPlaygroundHref(control.slug, control.category));
            },
          },
          {
            id: "external",
            label: "Open External",
            onSelect: () => {
              const previewId = createExternalPreviewPayload({
                code: generateUsageCode(control.slug, previewSettings, control.category).full,
                padded: !isFullBleedPreview(control.slug),
                theme: previewTheme,
              });
              window.open(
                `/documentation/playground/external?preview=${encodeURIComponent(previewId)}&theme=${previewTheme}`,
                "_blank",
                "noopener,noreferrer",
              );
            },
          },
          {
            id: "preview",
            label: "Open Preview",
            onSelect: () => {
              const previewId = storeRawPreviewSettings(previewSettings);
              window.open(componentRawPath(control.slug, previewId), "_blank", "noopener,noreferrer");
            },
          },
        ]}
        trigger={(
          <button className={styles.previewOpenButton} type="button">
            <span>Open</span>
            <span aria-hidden="true" className={styles.panelActionChevron} />
          </button>
        )}
      />
    </>
  );

  return (
    <div className={styles.page}>
      <ControlDetailPanel
        actions={panelActions}
        className={control.slug === "lab-test-layout" ? styles.testLayoutPreviewPanel : undefined}
        title="Preview"
        tourTarget="component-preview"
      >
        <div className={styles.previewBody}>
          <PreviewStage borderless={isFullBleedPreview(control.slug)}>
            <UsagePreview
              category={control.category}
              slug={control.slug}
              settings={previewSettings}
            />
          </PreviewStage>
        </div>
      </ControlDetailPanel>

      {documentation ? <ComponentDocumentation content={documentation} /> : null}

      {control.compositionParts?.length ? <CompositionPartsList control={control} parts={control.compositionParts} /> : null}

      <UsageCodeViewer category={control.category} settings={previewSettings} slug={control.slug} />
    </div>
  );
}
