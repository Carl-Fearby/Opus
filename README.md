# Opus

Design system monorepo.

## Structure

```
Opus/
  Library/       Component source and opus-react npm package
  Application/   Public website + documentation (deploy target)
```

## Library

```bash
cd Library
npm install
npm run dev          # local docs development
npm run build:lib    # build opus-react package
```

## Application (public site)

```bash
cd Application
npm install
npm run dev
```

Routes:

- `/` — marketing home
- `/pricing`
- `/documentation` — component catalog, guide, playground, version log

## Publish opus-react

```bash
./deploy.sh
```

Or manually from Library:

```bash
cd Library
npm run build:lib
npm publish -w opus-react --access public
```

The npm package contains components only. The public website, playground, and marketing pages live in Application and are not published to npm.
