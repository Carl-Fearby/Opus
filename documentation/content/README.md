# Opus documentation

Opus is a React component library and interactive documentation site built with Next.js 16 and React 19. It provides form fields, content patterns, overlays, and navigation primitives with a shared visual language and theme system.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000/documentation](http://localhost:3000/documentation) for the documentation hub.

## Documentation index

| Document | Description |
|----------|-------------|
| [Overview](./overview.md) | What Opus is, tech stack, and project layout |
| [Component library](./component-library.md) | All 47 registered components by category |
| [Architecture](./architecture.md) | Registry, routes, control detail pipeline, and data flow |
| [Development site](./development-site.md) | Sidebar, overviews, and the interactive playground |
| [Theming](./theming.md) | Light/dark mode, CSS tokens, and `OpusThemeProvider` |
| [Adding a component](./adding-a-component.md) | Step-by-step guide to register a new control |

## Public API

Import components from:

```tsx
import { Button, TextField, Modal, Sidebar } from "@/components/fields";
// or
import { Button, TextField } from "@/components";
```

The development tooling (`lib/controls/`, `components/development/`, `components/control-detail/`) is internal to this repo and not part of the public export surface.

## Routes

| URL | Purpose |
|-----|---------|
| `/` | Landing page |
| `/documentation` | Documentation hub |
| `/documentation/guide` | Project guide (this section, rendered from markdown) |
| `/documentation/components` | Main overview — all components grouped by category |
| `/documentation/components/content` | Content category overview with live previews |
| `/documentation/components/forms` | Forms category overview with shared settings |
| `/documentation/components/overlays` | Overlays category overview with live previews |
| `/documentation/components/{slug}` | Individual component detail — preview, usage code, settings |

## Source files

Guide content lives in `documentation/content/` as markdown. The app renders it at `/documentation/guide`.
