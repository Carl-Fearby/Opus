import type {
  DesktopAppInfo,
  SelectedFile,
} from "../../shared/contracts/desktop";

export type RuntimeKind = "web" | "electron";

export type PlatformCapabilities = {
  nativeFilePicker: boolean;
};

export type PlatformAdapter = {
  capabilities: PlatformCapabilities;
  getAppInfo: () => Promise<DesktopAppInfo>;
  kind: RuntimeKind;
  selectFile: () => Promise<SelectedFile>;
};
