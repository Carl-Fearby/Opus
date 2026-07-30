export const desktopChannels = {
  getAppInfo: "desktop:get-app-info",
  selectFile: "desktop:select-file",
} as const;

export type DesktopAppInfo = {
  name: string;
  platform: NodeJS.Platform | "browser";
  version: string;
};

export type SelectedFile = {
  name: string;
  path: string;
} | null;

export type OpusDesktopApi = {
  getAppInfo: () => Promise<DesktopAppInfo>;
  selectFile: () => Promise<SelectedFile>;
};
