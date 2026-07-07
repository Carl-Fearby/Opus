# Development site

The component library lives at `/documentation/components` inside the shared `/documentation` area. The project guide is rendered from markdown at `/documentation/guide`.

## Shared documentation space

| Route | Purpose |
|-------|---------|
| `/documentation` | Hub linking to Guide and Components |
| `/documentation/guide` | Markdown documentation (source in `documentation/content/`) |
| `/documentation/components` | Interactive component library |

Legacy `/development/components/*` URLs redirect to the new paths.

## Shell layout

**Files:** `components/development/ComponentsThemeProvider.tsx`, `ComponentsShell.module.css`

```
┌─────────────────────────────────────────────────────────┐
│  Header — page title, description, theme toggle         │
├──────────────┬──────────────────────────────────────────┤
│  Sidebar     │  Main content                            │
│  Overview    │  (overview grid or control detail)       │
│  Content ▼   │                                          │
│  Forms ▼     │                                          │
│  Overlays ▼  │                                          │
└──────────────┴──────────────────────────────────────────┘
```

`ComponentsThemeProvider` wraps the shell with:

- `OpusThemeProvider` — theme context
- `ToastProvider` — toast demos
- `ContextMenuProvider` — context menu demos
- Page header state (title + description)
- Theme persistence in `localStorage` (`opus-components-theme`)

Pages set the header with:

```tsx
useSetComponentsPageHeader("Overview", "Browse the Opus component library…");
```

## Sidebar

**File:** `components/development/ComponentsSidebar.tsx`

- **Overview** — links to `/documentation/components`
- **Category groups** — Content, Forms, Overlays (alphabetical)
  - Category label links to category overview (`/documentation/components/forms`, etc.)
  - Chevron expands/collapses the component list
  - Each component links to its detail page

### Persistence

| Key | Stores |
|-----|--------|
| `opus-components-sidebar-groups` | Which category groups are expanded |
| `opus-components-theme` | Light or dark theme |

On first visit all groups are collapsed. Navigating to a component auto-expands its category once.

## Overview pages

### Main overview

**File:** `components/development/overviews/ComponentsHubOverview.tsx`  
**Route:** `/documentation/components`

Sections for each category:

- Purple heading + icon linking to category overview
- One-line category description (single line on desktop)
- Grid of component cards — icon + title + description, each linking to detail page

### Category overviews

| Route | Component | Behaviour |
|-------|-----------|-----------|
| `/documentation/components/content` | `ContentOverview` | Live preview card per component |
| `/documentation/components/forms` | `FormsOverview` | Shared settings panel + live previews |
| `/documentation/components/overlays` | `OverlaysOverview` | Live preview card per component |

`OverviewDemoCard` renders a compact preview with a “More” link to the full detail page.

## Control detail page

**File:** `components/control-detail/ControlDetail.tsx`

Three resizable columns:

1. **Preview** — live component with current settings
2. **Usage** — generated JSX in a CodeMirror editor with copy button
3. **Settings** — controls to tweak demo props

Panel headings use the shared `.opus-panel-title` / `.opus-panel-heading` classes from `globals.css`.

## Styling conventions

- Compact spacing: 6–8px gaps, 8–10px panel padding
- Panels use `align-content: start` so they hug content (no vertical stretch)
- Purple accent (`--opus-accent`) on headings
- Muted text for descriptions and inactive nav items

## Running locally

```bash
npm run dev    # http://localhost:3000/documentation/components
npm run build  # SSG all slug pages
npm run lint   # ESLint
```
