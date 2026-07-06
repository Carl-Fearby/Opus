"use client";

import { useState } from "react";
import { ControlPreview } from "@/components/control-detail/ControlDetail/ControlPreview";
import { decodeRawSettingsParam } from "@/lib/controls/rawSettings";
import {
  formatRawPreviewCanvasLabel,
  getRawPreviewWidthOption,
  RAW_PREVIEW_ORIENTATION_OPTIONS,
  RAW_PREVIEW_WIDTH_OPTIONS,
  resolveRawPreviewCanvasSize,
  type RawPreviewOrientation,
  type RawPreviewWidthId,
} from "./rawPreviewWidths";
import styles from "./ControlRaw.module.css";
import type { ControlSettings, ControlSlug } from "@/lib/controls/types";

type ControlRawProps = {
  defaultSettings: ControlSettings;
  encodedSettings?: string;
  slug: ControlSlug;
};

export function ControlRaw({ defaultSettings, encodedSettings, slug }: ControlRawProps) {
  const [settings, setSettings] = useState<ControlSettings>(() =>
    decodeRawSettingsParam(encodedSettings, defaultSettings),
  );
  const [previewWidth, setPreviewWidth] = useState<RawPreviewWidthId>("full");
  const [orientation, setOrientation] = useState<RawPreviewOrientation>("portrait");
  const widthOption = getRawPreviewWidthOption(previewWidth);
  const canvasSize = resolveRawPreviewCanvasSize(widthOption, orientation);
  const orientationDisabled = canvasSize.full;

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
        </span>
      </header>

      <div className={styles.canvasArea}>
        <div
          className={styles.canvas}
          data-fixed-width={canvasSize.full ? undefined : "true"}
          data-orientation={canvasSize.full ? undefined : orientation}
          data-raw-preview-root
          style={
            canvasSize.full || canvasSize.width === null || canvasSize.height === null
              ? undefined
              : {
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                }
          }
        >
          <ControlPreview slug={slug} settings={settings} onSettingsChange={setSettings} />
        </div>
      </div>
    </div>
  );
}
