# Opus React API stability policy

Every public export is deliberately labelled so application teams can judge upgrade risk.

| Label | Meaning | Change policy |
| --- | --- | --- |
| Stable | Production API with semantic-versioned compatibility. | Breaking changes require the next major version. |
| Beta | Production-capable API still being standardised. | Changes can occur in a minor version and are called out in the changelog. |
| Experimental | Incubating API, Lab, game, or provider-specific integration. | Changes may occur in any release. Do not make it a critical product dependency without pinning. |

## Default classification

- Foundational primitives, fields, layouts, navigation, overlays, feedback, data views, and charts are **Beta** until their component quality record is complete.
- Components in the Labs and Games catalogue, and APIs tied to a third-party media or map provider, are **Experimental**.
- A component becomes **Stable** only after it has typed API documentation, controlled/uncontrolled guidance where relevant, keyboard and focus coverage, light/dark responsive coverage, an accessibility review, interaction tests, and a published migration path for any predecessor.

## Deprecations

Deprecated exports remain available for at least one minor release. Deprecations include a replacement, migration note, and removal target in `CHANGELOG.md`. Removal is restricted to the next major release unless a security or data-loss issue requires faster action.

## Support matrix

Opus supports the latest two major versions of Chrome, Edge, Firefox, and Safari, plus the current mobile Safari and Chrome releases. The automated suite runs Chromium; manual release checks cover the other supported browsers, keyboard-only interaction, screen readers, reduced motion, forced colours, 320px reflow, RTL, and long localised content.
