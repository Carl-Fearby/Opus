import type { OpusDesktopApi } from "../shared/contracts/desktop";

declare global {
  interface Window {
    opusDesktop?: OpusDesktopApi;
  }
}

export {};
