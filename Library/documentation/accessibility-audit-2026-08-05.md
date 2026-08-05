# Component accessibility audit — 5 August 2026

## Scope

- All 268 component catalogue previews rendered in Chromium.
- Automated Axe checks scoped to each `[data-preview-root]` boundary.
- Critical and serious impacts, including colour contrast.
- Review of shared implementations behind every automated failure.

This audit identifies detectable WCAG issues. Automated checks do not replace manual screen-reader, zoom, reflow, motion, or complete keyboard testing.

## Result

- 254 previews passed.
- 14 previews failed.
- The 14 failures reduce to four shared implementation defects.

## Findings

### P0 — CRM workspace rows use an invalid ARIA table structure

`role="row"` directly contains native checkbox and button elements. ARIA rows may only contain the expected cell roles, so assistive technology receives an invalid table model.

Affected previews:

- Contact Directory
- Company Directory
- Task Workspace
- Quotation Builder
- Sales Order
- Sales Invoice
- Stock Control

Recommended remediation: wrap every checkbox, value, and row action in `role="cell"` or use a native `<table>` with `<th>` and `<td>` elements. Keep the row action independently keyboard accessible.

### P0 — Tree Menu renders unnamed buttons for leaf nodes

Leaf nodes retain an empty disabled toggle `<button>` with no accessible name.

Affected previews:

- Tree Menu
- Document Manager

Recommended remediation: render a non-interactive spacer for leaf nodes instead of an empty disabled button. Expandable nodes should retain a named button with `aria-expanded` and a relationship to their child group.

### P1 — Scrollable regions cannot receive keyboard focus

Some overflow regions have neither focusable descendants nor their own keyboard focus target.

Affected previews:

- Contact Details
- Contact Card
- Dashboard Layout (`lab-test-layout`)

Recommended remediation: make genuinely interactive scroll regions focusable with an appropriate accessible name, or remove unintended overflow so the region is not exposed as independently scrollable.

### P1 — 3D preview triggers contain nested interactive controls

The Model Lightbox trigger is a `<button>` that wraps a `model-viewer` with its own focusable poster control.

Affected previews:

- Model Thumbnail
- Model Gallery

Recommended remediation: avoid wrapping the interactive viewer in a button. Use a non-interactive thumbnail/poster inside the trigger, or make the viewer itself the single activation target.

## Regression test

The catalogue accessibility suite now enumerates the registry rather than checking a single component:

```bash
npm run test:e2e -- tests/e2e/accessibility.spec.ts
```

The test is expected to remain red until the four shared defects above are remediated. New critical or serious Axe failures will produce a failing component-specific test.

## Manual follow-up

After automated remediation, manually verify representative components for:

- logical Tab and Shift+Tab order;
- visible focus at 200% and 400% zoom;
- arrow-key operation for tabs, menus, listboxes, trees, grids, and sliders;
- Escape behaviour and focus restoration for overlays;
- screen-reader names, roles, state, and live announcements;
- forced-colours/high-contrast mode;
- reduced-motion behaviour;
- reflow at 320 CSS pixels;
- touch target sizing and drag alternatives.
