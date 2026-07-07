# opus-react

A React component library for the **Opus Design System** — a modern, themeable UI kit for building professional business applications.

Opus includes form controls, overlays, navigation, data display, charts, dashboard widgets, and utility components with built-in light and dark themes, smooth rounded styling, and runtime accent colour support.

## Install

```bash
npm install opus-react
```

Peer dependencies:

```bash
npm install react react-dom
```

Optional dependency for 3D model components:

```bash
npm install three
```

## Quick start

Import the Opus styles and wrap your application with `OpusThemeProvider`.

```tsx
import "opus-react/styles.css";
import "opus-react/index.css";

import { OpusThemeProvider, Button, TextField } from "opus-react";

export function App() {
  return (
    <OpusThemeProvider theme="dark">
      <Button variant="primary">Save</Button>
      <TextField label="Full name" placeholder="Jane Cooper" />
    </OpusThemeProvider>
  );
}
```

`OpusThemeProvider` sets `data-theme` on `document.documentElement` by default, so themed CSS variables apply everywhere — including portalled content such as modals, drawers, and toasts.

## Next.js

Add `opus-react` to `transpilePackages`.

```ts
// next.config.ts

const nextConfig = {
  transpilePackages: ["opus-react"],
};

export default nextConfig;
```

## Theme provider

```tsx
import { OpusThemeProvider } from "opus-react";

export function App() {
  return (
    <OpusThemeProvider theme="light">
      <YourApp />
    </OpusThemeProvider>
  );
}
```

Available themes:

```tsx
theme="light"
theme="dark"
```

By default, the provider writes `data-theme` to `<html>` so CSS tokens resolve across the whole page, including portals. Pass `applyToDocument={false}` if you manage `data-theme` yourself (for example, on a scoped container in embedded widgets).

## Accent colour

Opus supports runtime accent colours.

```tsx
import { OpusThemeProvider, createAccentStyle } from "opus-react";

export function App() {
  return (
    <OpusThemeProvider theme="dark">
      <div style={createAccentStyle("#8f6cff")}>
        <YourApp />
      </div>
    </OpusThemeProvider>
  );
}
```

You can also use the included accent colour picker.

```tsx
import { AccentColorPicker } from "opus-react";

<AccentColorPicker value={accent} onChange={setAccent} />;
```

## What's included

### Form components

- Text field
- Textarea
- Select
- Checkbox
- Radio group
- Switch
- Range slider
- Number input
- Date picker
- File upload
- Chip input / tag input
- Colour picker
- Form labels
- Helper text
- Error states

### Overlays

- Modal
- Dialog
- Drawer
- Popover
- Toast

### Content and layout

- Card
- Table
- Data grid
- Tabs
- Accordion

### Navigation

- Sidebar
- Top navigation
- Mega menu

### Data visualisation

- Charts
- Gauges
- KPI cards
- Dashboard widgets

### Utilities

- `AccentColorPicker`
- `IconPicker`
- `CatalogIcon`
- Theme helpers
- Accent style helpers

## Examples

### Button

```tsx
import { Button } from "opus-react";

<Button variant="primary">Create project</Button>;
<Button variant="secondary">Cancel</Button>;
```

### Text field with error

```tsx
import { TextField } from "opus-react";

<TextField
  label="Email address"
  placeholder="you@example.com"
  error="Enter a valid email address"
/>;
```

### Chip input

```tsx
import { ChipInput } from "opus-react";

<ChipInput
  label="Tags"
  placeholder="Type and press Enter"
  value={tags}
  onChange={setTags}
/>;
```

### Accent colour picker

```tsx
import { AccentColorPicker } from "opus-react";

<AccentColorPicker value="#8f6cff" onChange={setAccent} />;
```

## Publishing

From the monorepo root:

```bash
npm run build:lib
npm publish -w opus-react --access public
```

Before publishing, set the package name in:

```txt
packages/opus-react/package.json
```

For example:

```json
{
  "name": "@your-org/opus-react"
}
```

## Not included in the package

The published package does not include:

- Documentation site shells
- Control preview tooling
- Generated usage-code tooling
- Internal build scripts

## Keywords

```txt
react
components
ui
design-system
component-library
forms
charts
dashboard
dark-theme
light-theme
typescript
opus
```
