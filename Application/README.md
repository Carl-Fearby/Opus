# Opus Application

Next.js consumer app for the published [`opus-react`](https://www.npmjs.com/package/opus-react) package.

## Structure

```
Opus/
  Library/       Design system source + documentation site
  Application/   This app (npm consumer)
```

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

If the Library docs site is also running, use another port:

```bash
npm run dev -- -p 3001
```

## npm package

Application depends on **`opus-react@^0.2.7`**. Until that version is on the registry, install the local build into `node_modules`:

```bash
# from Application/
rm -rf node_modules/opus-react
cp -R ../Library/packages/opus-react/dist node_modules/opus-react/dist
cp ../Library/packages/opus-react/package.json node_modules/opus-react/package.json
cp ../Library/packages/opus-react/README.md node_modules/opus-react/README.md
```

After publishing:

```bash
npm install opus-react@^0.2.7
```

## Notes

1. **`three`** — installed because model-viewer components in `opus-react` import it at bundle time.
2. **`OpusThemeProvider`** — sets `data-theme` on `<html>` by default, so you do not need a separate `data-theme` wrapper for basic usage.

Production builds use webpack (`next build --webpack`) for compatibility with the library CSS.

## What it demonstrates

- Installing `opus-react` from the npm registry
- `transpilePackages` in `next.config.ts`
- Importing `opus-react/styles.css` and `opus-react/index.css`
- `OpusThemeProvider`, form fields, card, chip input, theme toggle, and toast
