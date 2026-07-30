import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  net,
  protocol,
  type IpcMainInvokeEvent,
} from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  desktopChannels,
  type DesktopAppInfo,
  type SelectedFile,
} from "../shared/contracts/desktop";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "opus",
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
    },
  },
]);

const isDevelopment = Boolean(process.env.ELECTRON_RENDERER_URL);

function rendererDirectory() {
  return isDevelopment
    ? path.join(app.getAppPath(), "out")
    : path.join(process.resourcesPath, "out");
}

function isTrustedSender(event: IpcMainInvokeEvent) {
  const url = event.senderFrame?.url ?? "";
  return isDevelopment
    ? url.startsWith("http://127.0.0.1:3010")
    : url.startsWith("opus://app/");
}

function assertTrustedSender(event: IpcMainInvokeEvent) {
  if (!isTrustedSender(event)) {
    throw new Error("Blocked IPC request from an untrusted renderer.");
  }
}

function registerDesktopHandlers() {
  ipcMain.handle(
    desktopChannels.getAppInfo,
    (event): DesktopAppInfo => {
      assertTrustedSender(event);
      return {
        name: app.getName(),
        platform: process.platform,
        version: app.getVersion(),
      };
    },
  );

  ipcMain.handle(
    desktopChannels.selectFile,
    async (event): Promise<SelectedFile> => {
      assertTrustedSender(event);
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
      });
      const selectedPath = result.filePaths[0];
      return result.canceled || !selectedPath
        ? null
        : {
            name: path.basename(selectedPath),
            path: selectedPath,
          };
    },
  );
}

async function registerRendererProtocol() {
  protocol.handle("opus", (request) => {
    const requestUrl = new URL(request.url);
    const requestedPath =
      decodeURIComponent(requestUrl.pathname) === "/"
        ? "index.html"
        : decodeURIComponent(requestUrl.pathname).replace(/^\/+/, "");
    const safePath = path.normalize(requestedPath);

    if (safePath.startsWith("..") || path.isAbsolute(safePath)) {
      return new Response("Not found", { status: 404 });
    }

    return net.fetch(pathToFileURL(path.join(rendererDirectory(), safePath)).toString());
  });
}

async function createMainWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#080b18",
    title: "Opus Desktop",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event, url) => {
    const trusted = isDevelopment
      ? url.startsWith("http://127.0.0.1:3010")
      : url.startsWith("opus://app/");
    if (!trusted) event.preventDefault();
  });
  window.once("ready-to-show", () => window.show());

  if (isDevelopment) {
    await window.loadURL(process.env.ELECTRON_RENDERER_URL!);
  } else {
    await window.loadURL("opus://app/index.html");
  }
}

app.whenReady().then(async () => {
  registerDesktopHandlers();
  if (!isDevelopment) await registerRendererProtocol();
  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
