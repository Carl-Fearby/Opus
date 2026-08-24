# Changelog

All notable public-package changes are recorded here. Opus follows [Semantic Versioning](https://semver.org/).

## Unreleased

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
