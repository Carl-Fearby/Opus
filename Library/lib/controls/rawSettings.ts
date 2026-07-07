import type { ControlSettings } from "./types";

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
