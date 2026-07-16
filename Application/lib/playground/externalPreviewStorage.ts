import type { Theme } from "opus-react";

export const PLAYGROUND_EXTERNAL_PREVIEW_KEY_PREFIX = "opus-playground-external-preview:";

export type PlaygroundExternalPreviewPayload = {
  code: string;
  padded: boolean;
  theme: Theme;
};

export function createExternalPreviewPayload(payload: PlaygroundExternalPreviewPayload) {
  const id = crypto.randomUUID();
  window.localStorage.setItem(`${PLAYGROUND_EXTERNAL_PREVIEW_KEY_PREFIX}${id}`, JSON.stringify(payload));

  return id;
}

export function readExternalPreviewPayload(id: string | null) {
  if (!id || typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${PLAYGROUND_EXTERNAL_PREVIEW_KEY_PREFIX}${id}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PlaygroundExternalPreviewPayload>;
    if (typeof parsed.code !== "string" || typeof parsed.theme !== "string") {
      return null;
    }

    return {
      code: parsed.code,
      padded: parsed.padded ?? true,
      theme: parsed.theme as Theme,
    };
  } catch {
    return null;
  }
}
