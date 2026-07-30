import type { PlatformAdapter } from "./types";
import { webPlatform } from "./web";

export function getPlatform(): PlatformAdapter {
  if (typeof window !== "undefined" && window.opusDesktop) {
    return {
      kind: "electron",
      capabilities: {
        nativeFilePicker: true,
      },
      getAppInfo: window.opusDesktop.getAppInfo,
      selectFile: window.opusDesktop.selectFile,
    };
  }

  return webPlatform;
}

export type {
  PlatformAdapter,
  PlatformCapabilities,
  RuntimeKind,
} from "./types";
