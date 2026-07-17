"use client";

import { useState } from "react";
import { ControlPreview } from "@/components/control-detail/ControlDetail/ControlPreview";
import { PreviewThemeBoundary } from "@/components/control-detail/ControlDetail/PreviewThemeBoundary";
import { PreviewThemeControls } from "@/components/control-detail/ControlDetail/PreviewThemeControls";
import { decodeRawSettingsParam, readRawPreviewSettings } from "@/lib/controls/rawSettings";
import {
  formatRawPreviewCanvasLabel,
  getRawPreviewWidthOption,
  RAW_PREVIEW_ORIENTATION_OPTIONS,
  RAW_PREVIEW_WIDTH_OPTIONS,
  resolveRawPreviewCanvasSize,
  type RawPreviewOrientation,
  type RawPreviewWidthId,
} from "./rawPreviewWidths";
import { useRawViewportScale } from "./useRawViewportScale";
import styles from "./ControlRaw.module.css";
import type { ControlSettings, ControlSlug } from "@/lib/controls/types";

type ControlRawProps = {
  defaultSettings: ControlSettings;
  encodedSettings?: string;
  previewId?: string;
  slug: ControlSlug;
};

export function ControlRaw({ defaultSettings, encodedSettings, previewId, slug }: ControlRawProps) {
  const [settings, setSettings] = useState<ControlSettings>(() =>
    previewId
      ? readRawPreviewSettings(previewId, defaultSettings)
      : decodeRawSettingsParam(encodedSettings, defaultSettings),
  );
  const [previewWidth, setPreviewWidth] = useState<RawPreviewWidthId>("full");
  const [orientation, setOrientation] = useState<RawPreviewOrientation>("portrait");
  const widthOption = getRawPreviewWidthOption(previewWidth);
  const canvasSize = resolveRawPreviewCanvasSize(widthOption, orientation);
  const orientationDisabled = canvasSize.full;
  const { areaRef, scale } = useRawViewportScale(canvasSize.width, canvasSize.height, canvasSize.full);

  const preview = (
    <ControlPreview slug={slug} settings={settings} onSettingsChange={setSettings} />
  );

  return (
    <div className={styles.frame}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <label className={styles.toolbarLabel} htmlFor="raw-preview-width">
            Preview width
          </label>
          <select
            className={styles.toolbarSelect}
            id="raw-preview-width"
            onChange={(event) => setPreviewWidth(event.target.value as RawPreviewWidthId)}
            value={previewWidth}
          >
            {RAW_PREVIEW_WIDTH_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.toolbarGroup}>
          <label className={styles.toolbarLabel} htmlFor="raw-preview-orientation">
            Orientation
          </label>
          <select
            className={styles.toolbarSelect}
            disabled={orientationDisabled}
            id="raw-preview-orientation"
            onChange={(event) => setOrientation(event.target.value as RawPreviewOrientation)}
            value={orientation}
          >
            {RAW_PREVIEW_ORIENTATION_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <span className={styles.toolbarMeta}>
          {formatRawPreviewCanvasLabel(canvasSize, orientation)}
          {!canvasSize.full && scale < 1 ? ` · ${Math.round(scale * 100)}% fit` : null}
        </span>

        <PreviewThemeControls id={`preview-theme-toggle-${slug}-raw`} variant="toolbar" />
      </header>

      <div className={styles.canvasArea} ref={areaRef}>
        <div className={styles.viewportStage}>
          {canvasSize.full || canvasSize.width === null || canvasSize.height === null ? (
            <PreviewThemeBoundary
              className={styles.canvas}
              data-borderless={slug === "lab-test-layout" ? "true" : "false"}
              data-full="true"
              data-raw-preview-root
            >
              {preview}
            </PreviewThemeBoundary>
          ) : (
            <div
              className={styles.viewportFrame}
              style={{
                height: canvasSize.height * scale,
                width: canvasSize.width * scale,
              }}
            >
              <PreviewThemeBoundary
                className={styles.canvas}
                data-borderless={slug === "lab-test-layout" ? "true" : "false"}
                data-fixed-width="true"
                data-orientation={orientation}
                data-raw-preview-root
                style={{
                  height: canvasSize.height,
                  transform: scale < 1 ? `scale(${scale})` : undefined,
                  transformOrigin: "top left",
                  width: canvasSize.width,
                }}
              >
                {preview}
              </PreviewThemeBoundary>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
