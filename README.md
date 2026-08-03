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

## Netlify

The root [`netlify.toml`](./netlify.toml) deploys `Application` as the public Next.js site:

- `/` serves the marketing introduction.
- `/documentation/components` serves the component library.
- `/documentation/playground` serves the editable playground.

Connect Netlify to the repository root. The file-based configuration sets `Application` as the
base directory, runs `npm run build`, and publishes the `.next` output using Netlify's automatic
OpenNext adapter.

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

## Contribute to Opus

Opus is growing and we are looking for contributors who want to help build a thoughtful,
accessible component system for modern business applications. Contributions can include small
component improvements, accessibility fixes, interaction tests, documentation, design review,
new primitives, dashboard patterns, and desktop or web-app features.

You do not need to take on a large feature. Well-scoped fixes, tests, examples, and documentation
improvements are all valuable.

- Email [carlfearby@me.com](mailto:carlfearby@me.com)
- WhatsApp [+44 7940 147138](https://wa.me/447940147138)

Tell us a little about your interests and the area of Opus you would like to work on.
