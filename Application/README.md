# Opus Application

Public Opus website and documentation app. This is the deploy target for the product site.

It consumes the published [`opus-react`](https://www.npmjs.com/package/opus-react) package from npm and serves:

- `/` — marketing home
- `/pricing` — pricing
- `/documentation/*` — component catalog, guide, playground, and version history

## Structure

```
Opus/
  Library/       Component source and opus-react npm package build
  Application/   Public website (this app)
```

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the Library dev site is also running, use another port:

```bash
npm run dev -- -p 3001
```

## Sync docs from Library

Catalog, previews, and control-detail tooling are synced from Library:

```bash
npm run sync-from-library
```

Playground and documentation route files are maintained in Application directly.

## npm package

Application depends on **`opus-react`** from the npm registry. After a library release:

```bash
npm install
```

To test an unpublished local build before publishing:

```bash
# from Application/
rm -rf node_modules/opus-react
mkdir -p node_modules/opus-react
cp -R ../Library/packages/opus-react/dist node_modules/opus-react/dist
cp ../Library/packages/opus-react/package.json node_modules/opus-react/package.json
cp ../Library/packages/opus-react/README.md node_modules/opus-react/README.md
```

## Notes

1. **`three`** — installed because model-viewer components in `opus-react` import it at bundle time.
2. **`OpusThemeProvider`** — sets `data-theme` on `<html>` by default, so you do not need a separate `data-theme` wrapper for basic usage.
3. **Docs infra** — `components/development`, `components/documentation`, and `components/control-detail` are synced from Library. Design-system components come from `opus-react`, not local `components/`.
4. **Marketing** — `components/marketing` and `app/(marketing)` are Application-only and are not published to npm.

Production builds use webpack (`next build --webpack`) for compatibility with the library CSS.
