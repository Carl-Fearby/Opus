# Theme appearance audit

Date: 2026-10-31
Scope: the `Application` documentation shell and the prebuilt `opus-react@0.15.2` controls it renders.

## Root cause

`Application/components/OpusThemeProvider` was a symlink to the Library provider. That copy created its own React context, while every control imported from `opus-react` read the context compiled into the package. Portalled surfaces (menus, dialogs, tooltips, pickers) rendered outside the shell DOM, found no appearance context, and fell back to the standard dark surface.

## Fix

- `Application/components/OpusThemeProvider` is now an app-local provider that wraps the package provider, so both contexts receive the same defaults.
- The documentation theme-settings window now uses the themed portal instead of raw `react-dom`.
- The theme-settings window has an explicit neumorphic surface/shadow rule.
- The app portal helper now carries colour scheme and font tokens, matching the Library helper.

## Coverage

| Check | Result |
| --- | --- |
| Library files using `createThemedPortal` | 22 |
| Direct `createPortal` calls bypassing the themed helper | 0 |
| Components rendering through `<Portal>` | 9 (Modal, Dialog, Drawer, CommandPalette, BottomSheet, Lightbox, ModelLightbox, Portal, ControlPreview) |
| CSS modules with explicit appearance rules | 88 of 246 |
| Dropdown menus | themed wrapper + neumorphic panel |
| Dialogs / modals | themed wrapper + neumorphic panel |
| Theme-settings window | themed wrapper + neumorphic panel and shadow |

The remaining CSS modules either do not render a surface, or inherit the appearance tokens (`--opus-panel`, `--opus-surface-fill`, `--opus-control-shadow`, `--opus-shadow`). The audit specifically checked the overlay families: SelectField, ComboboxField, AsyncMultiSelectField, ColorField, DatePicker family, DropdownMenu, ContextMenu, MegaMenu, Tooltip, EmojiPicker, AccentColorPicker, ColourClouds, KanbanBoard menus, ProductTour, CommandPalette, BottomSheet, Lightbox, Modal, Dialog and Drawer.

## Verified in the browser

- Theme style **Neumorphism**: the Role dropdown is wrapped in `data-opus-appearance="neumorphism"`, with the neumorphic surface and dual shadows.
- Dialog: the backdrop's portal wrapper carries the appearance and the dialog panel uses the neumorphic shadow.
- Theme-settings window: same wrapper, plus the neumorphic window shadow.
- Switching Theme style to **Standard** updates every `[data-opus-appearance]` boundary in the shell, and switching back restores neumorphism; the choice persists in `localStorage` and the cookie.
- Verified against both `next dev` and the production build (`next build` + `next start`).

## Known gaps

1. `ColourClouds` in the published `opus-react@0.15.2` hardcodes its dropdown border and shadow. The rule is fixed in Library source, but the Application renders the prebuilt 0.15.2 CSS, so that one panel keeps a standard shadow until a new package build is published. The wrapper still supplies the neumorphic surface tokens.
2. Native `<select>` elements are visually hidden inside `SelectField`; the visible combobox is themed. Browser-native menus cannot be styled.
3. The toast viewport is fixed but not portalled; it intentionally inherits the shell appearance rather than a preview-specific one.
4. Canvas/WebGL/SVG internals (Map, ModelViewer, chart canvases) are not CSS surfaces; their containers follow the theme tokens.
5. Standalone documentation pages (guide, security, version hub) and the marketing site use a different shell and do not consume `ComponentsThemeProvider`.
