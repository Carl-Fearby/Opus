# Overview

## What Opus provides

Opus is both:

1. **A component library** — reusable UI primitives for forms, content layout, overlays, and navigation.
2. **A documentation playground** — a Next.js app at `/documentation/components` where every component can be previewed, configured, and copied as JSX.

Components are designed to work together: shared spacing, border radii, accent colours, and field shell patterns keep forms and panels visually consistent.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | CSS Modules + global design tokens |
| Code editor | CodeMirror (`@uiw/react-codemirror`) |
| Icons | Font Awesome (`@fortawesome/react-fontawesome`) |
| Language | TypeScript |

## Project layout

```
app/                          Next.js pages and global styles
  globals.css                 Theme tokens and shared utility classes
  documentation/              Guide markdown source + shared documentation assets
    content/                  Markdown files rendered at /documentation/guide
  app/documentation/          Documentation routes (hub, guide, components)

components/
  fields/                     Form inputs, buttons, FieldShell
  development/                Dev shell (sidebar, overviews, theme wrapper)
  control-detail/             Preview / usage / settings workspace
  *.tsx                       Content, overlay, and navigation components

lib/
  controls/                   Registry, routes, defaults, usage codegen
  fontawesome.ts              Font Awesome config (auto CSS injection off)
```

## Categories

Components are organised into three categories:

- **Content** — layout and data display (accordion, table, sidebar, tabs, …)
- **Forms** — inputs, selectors, toggles, and buttons
- **Overlays** — modals, drawers, tooltips, toasts, context menus, …

Navigation components (`Sidebar`, `TopNavigation`) live in the **Content** category in the registry because they are layout/navigation patterns rather than overlay dialogs.

## Key concepts

### FieldShell

Most form controls wrap `FieldShell`, which handles label placement (stacked, left, right), help text, error messages, required indicators, and accessibility wiring (`aria-describedby`, `aria-errormessage`).

### Registry-driven docs

Every documented component has a **slug** (e.g. `text-input`, `modal`). The slug drives:

- Static route generation (`/documentation/components/text-input`)
- Sidebar navigation
- Default demo settings
- Live preview and usage code generation

See [Architecture](./architecture.md) for the full pipeline.

### Theme

Light and dark modes are controlled by `OpusThemeProvider` and `[data-theme]` CSS custom properties. See [Theming](./theming.md).
