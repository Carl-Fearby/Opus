import type { ControlSettings } from "./types";

const RAW_PREVIEW_SETTINGS_PREFIX = "opus-raw-preview-settings:";

export function encodeRawSettingsParam(settings: ControlSettings): string {
  return encodeURIComponent(JSON.stringify(settings));
}

export function decodeRawSettingsParam<T extends ControlSettings>(
  encoded: string | undefined,
  defaults: T,
): T {
  if (!encoded) {
    return defaults;
  }

  try {
    return { ...defaults, ...JSON.parse(decodeURIComponent(encoded)) } as T;
  } catch {
    return defaults;
  }
}

export function storeRawPreviewSettings(settings: ControlSettings) {
  const id = crypto.randomUUID();
  window.localStorage.setItem(`${RAW_PREVIEW_SETTINGS_PREFIX}${id}`, JSON.stringify(settings));
  return id;
}

export function readRawPreviewSettings<T extends ControlSettings>(id: string | undefined, defaults: T): T {
  if (!id || typeof window === "undefined") {
    return defaults;
  }

  try {
    const stored = window.localStorage.getItem(`${RAW_PREVIEW_SETTINGS_PREFIX}${id}`);
    return stored ? ({ ...defaults, ...JSON.parse(stored) } as T) : defaults;
  } catch {
    return defaults;
  }
}
