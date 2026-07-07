# Opus

Design system monorepo.

## Structure

```
Opus/
  Library/       Component source, documentation site, and opus-react npm package
  Application/   Next.js consumer app (installs opus-react from npm)
```

## Library

```bash
cd Library
npm install
npm run dev          # documentation site
npm run build:lib    # build opus-react package
```

## Application

```bash
cd Application
npm install
npm run dev
```

## Publish opus-react

```bash
cd Library
npm run build:lib
npm publish -w opus-react --access public
```
