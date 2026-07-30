import type { SelectedFile } from "../../shared/contracts/desktop";
import type { PlatformAdapter } from "./types";

function selectBrowserFile(): Promise<SelectedFile> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.hidden = true;

    input.addEventListener(
      "change",
      () => {
        const file = input.files?.[0];
        input.remove();
        resolve(
          file
            ? {
                name: file.name,
                path: file.name,
              }
            : null,
        );
      },
      { once: true },
    );

    input.addEventListener(
      "cancel",
      () => {
        input.remove();
        resolve(null);
      },
      { once: true },
    );

    document.body.append(input);
    input.click();
  });
}

export const webPlatform: PlatformAdapter = {
  kind: "web",
  capabilities: {
    nativeFilePicker: false,
  },
  getAppInfo: async () => ({
    name: "Opus Web",
    platform: "browser",
    version: "web",
  }),
  selectFile: selectBrowserFile,
};
