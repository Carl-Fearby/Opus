# Component audit

Audit date: 26 July 2026.

## Current inventory

- 116 individually registered catalogue controls.
- 26 Labs compositions, including the 13 CRM workspaces added from this audit.
- 150 top-level component source directories, including internal documentation and development tooling.
- 248 public exports from the shared component barrel.
- Every registered control and Lab has a type/default configuration, preview, settings route, usage-code path, icon mapping, and valid declared source files.

## Quality gates

| Gate | Result | Follow-up |
| --- | --- | --- |
| TypeScript (`tsc --noEmit`) | Pass | Keep as a required CI check. |
| Library package build | Pass | Keep as a required CI check. |
| Source lint | 67 errors, 33 warnings | Fix React effect/ref issues first, followed by rich-text nested components. |
| Accessibility route audit | Moderate findings | Fix heading hierarchy and duplicate landmark names. No serious or critical Axe findings were reported. |
| Registry source-file validation | Pass | All 237 unique declared source files exist. |
| Component action audit | Pass | 188 native buttons, 4 delegated triggers, and 33 shared Button actions are covered. |
| Preview action placement | Pass | One visible action line is rendered beneath and outside the component; component-owned duplicates are prohibited. |
| Written component guidance | 12 incomplete | Add authored guidance for the advanced fields listed below. |

The ESLint configuration now excludes generated package output. Before this correction, generated `dist` files inflated the report from 100 source findings to 1,010 findings.

## Immediate remediation backlog

1. Fix React 19 lint failures in effects and ref handling. The highest concentration is in portal/tooltip/menu positioning, media controls, the map, and the rich-text field.
2. Move `ToolbarButton` and `ColorButton` out of the `RichTextField` render body so they retain identity and state.
3. Make reusable headings configurable (`headingLevel` or render-as support) rather than embedding fixed `h3` elements in cards and dashboard widgets.
4. Give repeated preview landmarks unique accessible names. This affects breadcrumbs, action navigation, footers, and embedded Lab regions.
5. Add authored guidance for: rich text, filter select, multi-select, transfer list, password strength, rating input, segmented control, slider range, phone number, country picker, tree select, and cascader.
6. Enable package tree-shaking and code splitting. The current unminified single entry produces about 1.61 MB ESM, 1.68 MB CJS, and 434 KB CSS.

## Components and Labs delivered from this audit

The primitive layer is broad. The following product-level compositions now use the existing primitives consistently and are marked with an orange asterisk in Labs while they are new.

### Core CRM journeys

- Contact directory.
- Company directory.
- Sales opportunity pipeline.
- Task workspace.
- Notification centre.
- Document manager.

### Operational journeys already represented in navigation

- Product catalogue.
- Quotation builder.
- Sales order.
- Sales invoice.
- Appointment diary.
- Stock control.
- System configuration.

## Next reusable application patterns

- Saved-filter/view manager for grids and lists.
- Bulk-action toolbar.
- Import wizard with mapping and validation steps.
- Form-page shell with dirty-state, save, cancel, and validation summary.
- Global loading, offline, permission-denied, and recoverable-error page states.
- Audit-history viewer with actor, timestamp, field changes, and filters.

## Definition of good

A component is release-ready when it has:

- a public export and registered catalogue entry;
- typed props with controlled and uncontrolled behavior documented where applicable;
- light/dark and accent-theme coverage;
- keyboard, focus, accessible-name, and reduced-motion behavior;
- narrow, normal, and wide responsive coverage;
- preview, Playground, and External parity;
- authored usage guidance and composition relationships;
- passing TypeScript, lint, build, and automated accessibility checks.

## Action contract

- Every catalogue preview starts with `Waiting for action` and reports the most recent user interaction.
- Product actions must leave the reusable component through a typed callback; internal visual state alone is not an action contract.
- A repeated row or card with one primary action uses the complete surface as its keyboard-accessible action target.
- Rows with secondary controls keep those controls independent while the remaining row surface invokes the primary action.
- JSON-driven menus support item callbacks and a component-level selection callback.
- Delegated menu and picker triggers are audited at the child selection boundary.
- `npm run audit:actions` prevents newly added native buttons from shipping without a handler.
