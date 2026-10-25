# Changelog

All notable public-package changes are recorded here. Opus follows [Semantic Versioning](https://semver.org/).

## Unreleased

### Added

- `target` on `Sidebar` menu items and `SidebarLink` so a navigation link can open in a new browsing context. `rel` defaults to `noopener noreferrer` when `target` is `_blank`, and an explicit `rel` replaces that default.

## 0.14.0 — 2026-10-25

### Added

- `onSearchMembers(query, card)` on `KanbanBoard` to search members remotely while the picker search changes (for example against an API of active users), replacing the local name and role filter. The empty query arrives when the picker opens so the API can return a default page of people.
- `memberSearchDebounceMs` on `KanbanBoard` to control the delay before `onSearchMembers` runs (defaults to 250 ms).

### Notes

- Members returned by a remote search stay available to the board, so card avatars and member chips keep resolving, and currently assigned members remain listed so they can be removed.

## 0.13.0 — 2026-10-25

### Added

- Built-in component translations for 47 languages, exported as `opusTranslations`, `getOpusTranslations(locale)` and `opusTranslationLocales`. Pass a locale's messages to `OpusI18nProvider` to localise shared controls such as Kanban, DataGrid, Calendar, FilterBuilder, Pagination and SearchBox.
- Right-to-left support for Arabic, Persian, Hebrew and Urdu translations.

### Notes

- Translations are machine-assisted and are being proof-read by native speakers. Corrections and reports are welcome: see the contributors section of the Opus site or open an issue on GitHub.

## 0.9.1 — 2026-10-22

### Documentation

- Add release notes for Opus 0.8.0 and 0.9.0.
- Document DataGrid column management, controlled visibility, and saved views.
- Add the enterprise components and DataGrid story to the Opus journal.

## 0.9.0 — 2026-10-22

### Added

- DataGrid column manager with a visibility menu for showing and hiding data columns.
- Controlled and uncontrolled column visibility through `columnVisibility`, `defaultColumnVisibility`, and `onColumnVisibilityChange`.
- Saved column views through `views`, `activeViewId`, `defaultActiveViewId`, and `onActiveViewChange`.
- Exported `DataGridColumnVisibility` and `DataGridView` types.

## 0.8.0 — 2026-10-22

### Added

- `ConfirmDialog` for destructive and asynchronous confirmations, with `danger` tone and loading state.
- `BottomSheet` with drag-to-dismiss, containment sizes, and mobile-safe action footers.
- `TreeTable` for expandable hierarchical records with controlled expansion, custom columns, density, and sticky headers.
- `Markdown` and `CodeEditor`, backed by react-markdown and CodeMirror, with Opus light/dark theming.
- `ErrorState` and `ErrorBoundary` for reusable error, warning, offline, forbidden, and not-found states.
- `AsyncMultiSelectField` with debounced search, removable chips, keyboard navigation, and native form submission support.
- `OverflowToolbar` for moving excess actions into a More menu as space shrinks.
- `size` support for AsyncSelectField, MentionInputField, and ComboboxField.

### Changed

- Unified input surfaces across Standard, Neumorphism, and Liquid glass appearances.
- Added disabled states to the remaining form controls.
- Preserved theme, font, and colour inside portalled controls.
- Aligned radius, shadow, focus, and semantic colour tokens across theme sources.

## 0.7.4 — 2026-10-01

- Add opt-in Neumorphism appearance across component surfaces, with matching material fills, raised actions, recessed inputs, and subtle dark shadows.
- Carry scoped themes into portalled menus, dialogs, and tooltips.
- Persist appearance selection in the Theme Designer and include it in generated provider code.
- Add featured imagery support to MegaMenu panels.

## 0.6.32

### Added

- Dialog accepts custom `actions`, enabling workflows such as Yes / No / Branch.
- `DialogAction`, `DialogProps`, and the `branch` dialog result are exported for typed consumer integrations.

## 0.6.31

### Added

- Syntax Highlighter now includes a compact copy-code action.

### Changed

- Copy Button accepts `className` and `size` for composed integrations.

## 0.6.30

### Changed

- Chat Conversation Lab uses the lunar-distance markdown fixture and starts with Show More disabled.

## 0.6.29

### Fixed

- Chat Bubble preserves escaped asterisks in markdown prose while rendering `**bold**` syntax as strong text.

### Changed

- The Chat Conversation Lab now includes an editable lunar-distance markdown example for testing headings, bold text, paragraphs, formulae, and Show More.

## 0.6.28

### Changed

- Chat Bubble markdown prose now uses the shared Text, Heading, and Spacer primitives; blank-line paragraph breaks use the small spacing preset and `**bold**` syntax renders as strong text.

## 0.6.27

### Added

- Spacer now supports `small` (8px), `medium` (16px), and `large` (24px) size presets alongside existing numeric and CSS-length values.

### Changed

- Shared Text and Heading primitives are used by Lab workspace, desktop, and record identity surfaces; their composition metadata now reflects that relationship.

## 0.6.26

### Added

- `Text`, a semantic body-copy primitive with 100–500 scale tokens and five vertical padding presets.
- `Heading`, a semantic `h1`–`h6` primitive with independent 100–500 scale tokens and five vertical padding presets.

### Changed

- Both typography components are catalogued under Content → Typography with live settings, generated usage, and public Props documentation.

## 0.6.25

### Added

- `SyntaxHighlighter`, a reusable, compact, theme-aware read-only code renderer.
- Chat Bubble now supports independent `lightBackground` and `darkBackground` colours.

### Changed

- Chat Bubble component pages now expose avatar visibility, Show More labels, theme-specific colours, composition metadata, and generated usage for the complete public API.
- Code blocks use the shared SyntaxHighlighter and adapt to the active light or dark theme.

### Fixed

- Stabilise Chat Bubble Show More rendering during colour and settings changes.

## 0.6.24

### Fixed

- Chat Bubble now chooses a readable dark or light foreground automatically for custom hex background colours.

### Changed

- Chat Bubble message groups now use consistent intrinsic bubble widths on both alignments and theme-derived default bubble colours.

## 0.6.23

### Changed

- Chat Bubble groups now show one timestamp below the final message, use explicit right-side group corners, and the catalog preview demonstrates both alignments.

## 0.6.22

### Added

- `ChatBubble`, a grouped left/right chat message primitive with avatars, timestamps, configurable backgrounds, optional Show More handling, and fenced-code rendering.

## 0.6.21

### Added

- `ResizeHandle.transparent`, a boolean prop that keeps the resize track transparent, including on hover and focus.

## 0.6.20

### Added

- `NoteComposer.submitOnEnter` and `onSubmit`, enabling chat-style Enter-to-send while retaining Shift+Enter for a newline and the existing `onSave` callback.

## 0.6.19

### Added

- `OpusBrand`, the package-safe canonical Opus icon, wordmark, and full-lockup component.
- Direct asset exports for `opus-react/assets/opus-logo.png` and `opus-react/assets/logo-small.png`.

### Changed

- `ApplicationHeader` and `ApplicationFooter` now use `OpusBrand` by default rather than assuming consumers serve `/opus-logo.png`.

## 0.6.18

### Fixed

- Restore CSS-module class-map generation in the published ESM and CommonJS bundles. This corrects the 0.6.17 regression where component controls could render with native browser styling despite importing `opus-react/index.css`.
- Fail the package build if CSS-module mappings are absent, preventing this class of broken publish.

## 0.6.17

### Changed

- Public bundles are minified and tree-shaken.
- Scroll regions can be given a meaningful accessible name through `ScrollArea.label`.

### Fixed

- Consumer-provided scroll viewports are keyboard reachable by default.
- CRM table headers expose valid column-header semantics.

## 0.6.16

- Current published package baseline.
