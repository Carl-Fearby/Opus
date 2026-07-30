import { contextBridge, ipcRenderer } from "electron";
import {
  desktopChannels,
  type OpusDesktopApi,
} from "../shared/contracts/desktop";

const api: OpusDesktopApi = {
  getAppInfo: () => ipcRenderer.invoke(desktopChannels.getAppInfo),
  selectFile: () => ipcRenderer.invoke(desktopChannels.selectFile),
};

contextBridge.exposeInMainWorld("opusDesktop", api);
