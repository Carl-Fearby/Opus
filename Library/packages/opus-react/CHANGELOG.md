# Changelog

All notable public-package changes are recorded here. Opus follows [Semantic Versioning](https://semver.org/).

## 0.20.3 — 2026-11-13

### Fixed

- Every remaining dropdown panel now follows the radius setting: `ComboboxField`'s suggestion list had a fixed 14px corner, and `ColorField`, `DateField`, `TimePicker`, `DateTimePicker`, `MonthPicker`, `WeekPicker` and `DateRangeField` portalled their panels outside the field without passing the radius, so their popovers stayed at the default. The cascader now uses the menu radius token like the other dropdowns.

## 0.20.2 — 2026-11-13

### Fixed

- The shared field menu panel hardcoded a `14px` radius, so `FilterSelectField`, `MultiSelectField`, `TreeSelectField`, `CountryPickerField` and `PhoneNumberField` ignored their `radius` prop. The panel now uses `--opus-menu-radius` from the radius scale (None `0`, Minimal `6px`, Standard and up following the scale).

## 0.20.1 — 2026-11-13

### Fixed

- Every field dropdown now dismisses when it loses focus, not only on an outside click: `SelectField`, `ComboboxField`, `MultiSelectField`, `AsyncSelectField`, `AsyncMultiSelectField`, `TreeSelectField`, `CascaderField`, `FilterSelectField`, `CountryPickerField`, `PhoneNumberField`, `ColorField` and the `MentionInputField` suggestions all close when focus moves to another control (for example on Tab).
- `AsyncSelectField` had no dismissal at all, so its option list stayed open when you clicked another field; it now closes on blur, Escape and outside presses like the other dropdowns.

## 0.20.0 — 2026-11-13

### Added

- `ControlRadius`: a `minimal` step (6px) between `none` and `standard`, supported by fields, buttons, menus, the colour-picker panel and `OpusThemeProvider` defaults.
- Every component surface now reads `--opus-control-radius` (with its own value as the fallback), so a single radius setting restyles any rounded corner without a bespoke prop.
- `AsyncSelectField`: `mode` and `labelPosition` props so the field follows the same layout settings as other Opus fields.
- `AsyncMultiSelectField`: the radius and menu-radius tokens now follow the `radius` prop, including the portalled option list.
- `MentionInputField`: `mode`, `labelPosition`, `required`, `error` and `help` props so it matches the other fields.
- `ApplicationFooter`: `showBrand`, `showVersion` and `showActions` props.
- `ProfilePhotoUploadModal`: every photo-upload option (title, description, labels, crop and zoom settings) is reachable from the catalogue example.

### Fixed

- `AsyncSelectField` and `AsyncMultiSelectField`: the clear control and option list no longer ignore the field radius.
- `StatCard`/`KpiCard` catalogue example no longer emits a duplicate self-closing tag after the component.
- Catalogue examples now start from their configured value: every text, numeric, range, select and radio field seeds its state from **Value**, `CheckboxField`/`SwitchField` from **Checked**, `Clipboard` from its value, `ProfilePhotoUpload` from its photo, and `Sidebar` honours **Height** even when it is not wrapped.
- `IconBadge` toolbar demo now reflects its icon, label, count, max and show-zero settings on the first badge.
- The docs preview now applies every settings-pane control. `ProductTour`, `MentionInputField`, `RecurrenceEditor`, `TimeRangeField`, `SignaturePad`, `DiffViewer`, `Markdown`, `CodeEditor`, `TreeTable`, `ErrorState`, `ConfirmDialog`, `BottomSheet` and `OverflowToolbar` previously had no settings, and the dashboard widgets' preview layout now lays out the configured number of previews.

## 0.19.0 — 2026-11-13

### Added

- `AsyncSelectField`: a clear button inside the control empties the search text and the selected option in one click, returns focus to the input and reports `onChange(null)`. It appears whenever the field has text or a value and stays hidden while the field is disabled.

## 0.18.1 — 2026-11-11

### Changed

- `KanbanBoard`: a list can be dragged from anywhere on its header instead of only the grip icon, and the grip handle is gone. A focused list header still reorders with the left and right arrow keys, and header controls keep their click behaviour when a click turns into a drag.

## 0.18.0 — 2026-11-11

### Added

- `DataGrid`: `saveState` remembers user-resized column widths per grid. Pass a string key or `{ key, storage }` for an explicit slot, or `saveState` alone to derive one from the grid's shape (caption, layout and column keys), so two grids never share a layout.
- Saved widths are treated as the user's intent. When the container is narrower than the saved total the visible columns scale down proportionally without overwriting the stored values, so the widths the user chose return as soon as there is room. Columns never go below their measured minimum, and when even the minimums do not fit the grid scrolls horizontally rather than crushing every column into an unreadable strip.
- `DataGrid`: `onColumnWidthsChange`, fired when a resize commits, for apps that keep layout state themselves. Widths are written once per drag rather than on every pointer move, and a drag is never compressed mid-gesture — the fit reapplies on release.
- `LiquidGlass`: a refractive glass surface rendered as a WebGL height field instead of `backdrop-filter`, with analytic normals, Snell's-law refraction, chromatic dispersion, rim highlights and film grain. It takes `orb` and `surface` shapes, theme-aware pigment from `--opus-accent`, tuning props (`relief`, `refraction`, `dispersion`, `roughness`, `reflection`, `grain`, `scale`, `speed`, `flow`, `seed`), `paused`, and a handle exposing `reset` and the canvas element.

## 0.17.0 — 2026-11-03

### Added

- `Surface`: a children-only box for the `rounded border bg-panel p-*` shape that previously had to be hand-written on every screen. It takes `border` (`subtle`/`default`/`strong`/`accent`, or `true`), `borderAlpha` to mix `tone` into the border, `radius`, `background`, `padding` (preset or an explicit length in pixels), `shadow`, `overflow` and `as`. It has no title or header of its own, so it wraps arbitrary content the way `Panel` and `Card` cannot.
- `Text`: `uppercase`, `tracking` (`tighter`–`widest`), `leading` (`none`–`loose`) and `align`. `size` also accepts pixel numbers below 100, so `size={11}` renders 11px rather than needing a one-off class.
- `TextField`, `TextAreaField` and `SelectField`: `value` and `onChange` are optional and `defaultValue` is accepted, so a form backed by a server action can use Opus fields without becoming a client component. `SelectField` owns and updates its value in that mode.

## 0.16.1 — 2026-11-02

### Fixed

- Dialog, Modal, CommandPalette and BottomSheet no longer hard-code `z-index: 1100`/`1120`; they use `var(--opus-z-modal)` like Drawer, Lightbox and ModelLightbox. Opus now has a single modal layer, so a toast raised from inside a modal — or any other overlay — paints above it instead of behind it, and apps can delete the `globals.css` toast override they needed to work around the split.

## 0.16.0 — 2026-11-02

### Added

- The published bundle now starts with a `"use client"` directive, so an app can render Opus components directly from a server component without wrapping every route in a pass-through client component. The directive is applied by `scripts/add-use-client.mjs` as the last build step, because tsup's banner and esbuild's re-bundling both drop module-level directives.
- `Text` and `Heading`: `tone` prop (`default`, `muted`, `accent`, `danger`, `success`, `warning`) for semantic colour without inline styles.
- `Text`: `truncate` and `lineClamp` for single-line and multi-line ellipsis, plus named `size` values `2xs`, `xs` and `sm` (11px, 13px, 15px) with matching `--opus-font-size-*` tokens.
- `Stack`: `maxWidth` and `padding`. `Container`: `maxWidth`, which overrides the `size` preset. Numeric values are pixels.
- `Grid`: `columns` accepts a breakpoint map, e.g. `{ base: 1, sm: 2, lg: 3 }`, backed by `--grid-cols-*` variables and 640/768/1024/1280px media queries.
- `Card`: `href`, `linkLabel` and `interactive`. The card renders an overlay anchor instead of nesting links around its controls, and raises `footer`/`actions` above it automatically.
- Layering tokens `--opus-z-base`, `--opus-z-raised`, `--opus-z-sticky`, `--opus-z-dropdown`, `--opus-z-overlay`, `--opus-z-modal`, `--opus-z-toast` and `--opus-z-tooltip`, now used by `ToastProvider` and `Drawer` in place of hard-coded z-index values.

## 0.15.5 — 2026-11-02

### Added

- `ListField`: a standard text input with an Add button and a fixed-height, scrollable list of removable entries beneath it. Entries are trimmed, exact duplicates are skipped, the empty state centres inside the list, and the list scrolls inside a 200px box (overridable with `--opus-list-field-height`) so several fields stack in one form with predictable spacing.
- Drag-to-reorder on `ListField` rows with a grip handle, a top-edge or bottom-edge drop indicator, pointer-based insertion (including the space past the last row) and edge auto-scroll so entries outside the visible rows stay reachable. Pass `reorderable={false}` to opt out.
- `ListField` composes the shared field input styling, `Button` and `CustomScrollbar`, and supports `disabled`, `readOnly`, `error`, `help`, `required`, `size`, `mode`, `labelPosition`, `radius`, `transparency` and `gradient`.

## 0.15.4 — 2026-11-02

### Added

- Native-style type-ahead on `SelectField`: a printable key selects the first option that starts with it while the dropdown is closed, repeating the letter cycles through the matches, and letters typed within 500 ms accumulate into a prefix. With the list open, typing moves the highlight instead of committing.
- Keyboard navigation on `MultiSelectField`: type-ahead opens the list on the matching option, arrow keys, Home and End move a visible highlight, Enter toggles the highlighted option, and Escape closes the panel and returns focus to the trigger.

## 0.14.1 — 2026-10-25

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
