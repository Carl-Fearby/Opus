# Opus Desktop

Architecture spike for the cross-platform Opus desktop application.

## Architecture

- **Renderer:** Next.js 16 static export with React 19 and `opus-react`.
- **Desktop shell:** Electron.
- **Native bridge:** sandboxed preload script with typed, capability-specific IPC.
- **Packaging:** Electron Forge for macOS, Windows, and Linux artifacts.

The renderer has no direct Node.js or Electron access. Native functionality is
implemented in the Electron main process and exposed through the smallest
possible API in `electron/preload.ts`.

Shared IPC types live in `shared/contracts`; neither the product UI nor the web
adapter imports from the Electron implementation.

## Web-first rule

The Next.js application is the product; Electron is one optional host. Product
components must depend on `lib/platform`, never Electron directly. Each
capability has:

1. a browser implementation using standard Web APIs;
2. an optional Electron enhancement for capabilities requiring native access.

The current file-selection example uses a normal browser file input on the web
and the operating-system dialog in Electron. The same UI and application routes
therefore run as a conventional hosted web application and as a packaged
desktop application.

## Development

```bash
npm install
npm run dev
```

Next.js runs on port `3010`; Electron waits for it before opening the desktop
window.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run package
```

`npm run build` creates the Next static export in `out/` and compiles Electron
into `dist-electron/`. `npm run package` additionally creates an unpacked local
application under `.forge/` managed by Electron Forge.

The renderer toolchain and UI packages are development dependencies because
the packaged shell consumes their compiled static output. This keeps Next,
React, and the monorepo-linked `opus-react` source out of Electron's runtime
Node dependency graph.

## Security decisions

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- no generic IPC methods exposed to the renderer
- IPC sender validation
- external navigation and new windows denied by default
- packaged content served from the privileged `opus://` application protocol

## Next spike decisions

1. Confirm application identity, bundle identifier, and signing accounts.
2. Choose update hosting and release channels.
3. Define authentication and deep-link requirements.
4. Decide which existing Opus application route becomes the first desktop
   product screen.
