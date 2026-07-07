# Theming

Opus supports light and dark themes via CSS custom properties and a React context provider.

## OpusThemeProvider

**File:** `components/OpusThemeProvider.tsx`

```tsx
import { OpusThemeProvider, useOpusTheme } from "@/components/fields";

<OpusThemeProvider theme="dark">
  {children}
</OpusThemeProvider>
```

- Sets `data-theme="light"` or `data-theme="dark"` on `document.documentElement` by default (covers portalled overlays)
- Pass `applyToDocument={false}` to manage `data-theme` on your own container instead
- `useOpusTheme()` reads the current theme from context (falls back to nearest `[data-theme]` on the document)

Overlay providers (`ToastProvider`, `ContextMenuProvider`) call `useOpusTheme()` so portaled content picks up the correct tokens. An optional `theme` prop on those providers overrides the context when needed.

## CSS tokens

**File:** `app/globals.css`

Tokens are scoped to `[data-theme="light"]` and `[data-theme="dark"]`:

| Token | Purpose |
|-------|---------|
| `--opus-panel` | Panel / card background |
| `--opus-border` | Default border colour |
| `--opus-border-strong` | Emphasised border |
| `--opus-text` | Primary text |
| `--opus-muted` | Secondary text |
| `--opus-accent` | Brand purple — headings, links, focus |
| `--opus-accent-soft` | Accent background wash |
| `--opus-error` | Validation errors |
| `--opus-input-bg` | Input background |
| `--opus-input-fill` | Input fill |
| `--opus-shadow` | Box shadow |
| `--opus-overlay-backdrop` | Modal/drawer/menu backdrop |
| `--opus-overlay-blur` | Backdrop blur amount |
| `--opus-control-height` | Standard control height (28px) |
| `--opus-input-radius` | Base border radius (4px) |
| `--opus-input-radius-large` | Large radius (6px) |

Components reference these tokens in their CSS modules — they do not hardcode theme colours.

## Theme toggle

**Component:** `ThemeToggleField`  
**Used in:** development shell header

Sun/moon icons (Font Awesome) switch between light and dark. In the dev shell, the choice persists to `localStorage`.

## Utility classes

Defined in `globals.css`:

- `.opus-panel-title` — uppercase accent heading with bottom rule
- `.opus-panel-heading` — flex row for title + actions (e.g. “More” link, copy button)

## Overlay consistency

Modal, dialog, drawer, command palette, and context menu backdrops share `--opus-overlay-backdrop` and `--opus-overlay-blur` so overlay depth looks the same in both themes.

## Using theme in new components

1. Style with `var(--opus-*)` tokens in CSS modules — never hardcode `#fff` / `#000` for surfaces that should theme-switch.
2. If you use `applyToDocument={false}`, ensure portalled content still has access to `[data-theme]` tokens (either on a wrapper or on `document.documentElement`).
3. Wrap app sections in `OpusThemeProvider` at the highest level that needs theme awareness.
