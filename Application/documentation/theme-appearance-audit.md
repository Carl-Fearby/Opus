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

## Global switch

Theme style is selectable from the top bar next to the UI font picker: **Standard**, **Neumorphism** or **Liquid glass**. It writes the same `previewDefaults` the theme designer edits, so the shell, every component preview and every portalled overlay change together. The choice persists in `localStorage` (`opus-preview-appearance`) and the cookie, and the theme designer's Appearance control reflects it.

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
| Property grid | soft row grooves, muted labels and raised copy chips; the bordered variant becomes a raised card |
| Header controls | dark chrome pinned under neumorphism and liquid glass; theme-style menu portalled out of the header |
| Theme toggle | selected icon follows the surface text and the knob shadow stays inside the track |
| Documents lab | raised tree and toolbar, recessed browser tray, raised folder cards |

The remaining CSS modules either do not render a surface, or inherit the appearance tokens (`--opus-panel`, `--opus-surface-fill`, `--opus-control-shadow`, `--opus-shadow`). The audit specifically checked the overlay families: SelectField, ComboboxField, AsyncMultiSelectField, ColorField, DatePicker family, DropdownMenu, ContextMenu, MegaMenu, Tooltip, EmojiPicker, AccentColorPicker, ColourClouds, KanbanBoard menus, ProductTour, CommandPalette, BottomSheet, Lightbox, Modal, Dialog and Drawer.

## Header chrome

The documentation top bar is dark chrome in every theme, but its controls took their surfaces from the page appearance while their labels came from the dark tokens. Under neumorphism and liquid glass that produced light menus with near-white text. `TopBar.module.css` now pins a self-contained dark material for those two appearances, and the theme-style menu renders through `createThemedPortal` instead of inside the header — the header clips its overflow and sits below the page content in the stacking order, which hid the options.

`ThemeToggleField` had a related bug in content previews: the selected icon was hard-coded `#ffffff` on a knob that shares the track's neumorphic colour. The icon now follows `--opus-text`, and the knob's shadow is clipped to the track so it no longer blooms around the control.

## Package bridge

`ChatBubble` is rendered from the prebuilt `opus-react` bundle, whose bundle predates the neumorphic bubble rule. The Library source now carries it, and [globals.css](../app/globals.css) mirrors it for the installed package (`[data-opus-appearance="neumorphism"] [class*="_bubble"]`). Only `ChatBubble` defines a `_bubble` class, so the bridge is scoped to chat bubbles; it can be dropped once a release includes the Library rule.

## Verified in the browser

- Theme style **Neumorphism**: the Role dropdown is wrapped in `data-opus-appearance="neumorphism"`, with the neumorphic surface and dual shadows.
- Dialog: the backdrop's portal wrapper carries the appearance and the dialog panel uses the neumorphic shadow.
- Theme-settings window: same wrapper, plus the neumorphic window shadow.
- Switching Theme style to **Standard** updates every `[data-opus-appearance]` boundary in the shell, and switching back restores neumorphism; the choice persists in `localStorage` and the cookie.
- The top-bar selector flipped all 25 boundaries on `/documentation/components/overlays` between `standard` and `neumorphism`; a Dialog and the component cards followed, and `/theme-designer` showed the same value.
- Verified against both `next dev` and the production build (`next build` + `next start`).

## Known gaps

1. `ColourClouds` in the published `opus-react@0.15.2` hardcodes its dropdown border and shadow. The rule is fixed in Library source, but the Application renders the prebuilt 0.15.2 CSS, so that one panel keeps a standard shadow until a new package build is published. The wrapper still supplies the neumorphic surface tokens.
2. Native `<select>` elements are visually hidden inside `SelectField`; the visible combobox is themed. Browser-native menus cannot be styled.
3. The toast viewport is fixed but not portalled; it intentionally inherits the shell appearance rather than a preview-specific one.
4. Canvas/WebGL/SVG internals (Map, ModelViewer, chart canvases) are not CSS surfaces; their containers follow the theme tokens.
5. Standalone documentation pages (guide, security, version hub) and the marketing site use a different shell and do not consume `ComponentsThemeProvider`.
