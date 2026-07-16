# opus-react

React component library for the **Opus Design System** — a themeable UI kit for professional business applications.

Includes form controls, overlays, navigation, data display, charts, dashboard widgets, layout primitives, and utilities. Ships with light and dark themes, CSS variable tokens, runtime accent colour support, and full TypeScript definitions.

**Current version:** `0.2.22`

## Requirements

- React `^18.2.0` or `^19.0.0`
- React DOM `^18.2.0` or `^19.0.0`
- `three` `^0.185.0` — optional, only needed for 3D model components

## Install

```bash
npm install opus-react
```

Peer dependencies:

```bash
npm install react react-dom
```

Optional peer for 3D model viewers:

```bash
npm install three
```

## Quick start

Import Opus styles, then wrap your app with `OpusThemeProvider`.

```tsx
import "opus-react/styles.css";
import "opus-react/index.css";

import { OpusThemeProvider, Button, TextField } from "opus-react";

export function App() {
  return (
    <OpusThemeProvider theme="dark">
      <Button variant="primary">Save</Button>
      <TextField label="Full name" placeholder="Jane Cooper" />
    </OpusThemeProvider>
  );
}
```

### Styles

| Import | Purpose |
| --- | --- |
| `opus-react/styles.css` | Theme tokens (`--opus-*` CSS variables) for light and dark mode |
| `opus-react/index.css` | Component CSS modules plus bundled country-flag assets for `PhoneNumberField` |
| `opus-react/flags.css` | Standalone flag stylesheet (optional — already included in `index.css`) |

`OpusThemeProvider` sets `data-theme` on `document.documentElement` by default, so themed CSS variables apply everywhere — including portalled content such as modals, drawers, and toasts.

## Next.js

Add `opus-react` to `transpilePackages`:

```ts
// next.config.ts
const nextConfig = {
  transpilePackages: ["opus-react"],
};

export default nextConfig;
```

Import styles in your root layout:

```tsx
import "opus-react/styles.css";
import "opus-react/index.css";
```

## Theme provider

```tsx
import { OpusThemeProvider } from "opus-react";

export function App() {
  return (
    <OpusThemeProvider theme="light">
      <YourApp />
    </OpusThemeProvider>
  );
}
```

Available themes: `"light"` | `"dark"`

Pass `applyToDocument={false}` if you manage `data-theme` yourself (for example on a scoped container in embedded widgets).

## Accent colour

Opus supports runtime accent colours via CSS variables.

```tsx
import { OpusThemeProvider, createAccentStyle } from "opus-react";

export function App() {
  return (
    <OpusThemeProvider theme="dark">
      <div style={createAccentStyle("#8f6cff")}>
        <YourApp />
      </div>
    </OpusThemeProvider>
  );
}
```

Or use the included picker:

```tsx
import { AccentColorPicker } from "opus-react";

<AccentColorPicker value={accent} onChange={setAccent} />;
```

## What's included

### Forms

- `Button`, `TextField`, `TextAreaField`, `RichTextField`
- `SelectField`, `FilterSelectField`, `MultiSelectField`, `TreeSelectField`, `CascaderField`
- `CheckboxField`, `RadioGroup`, `SwitchField`
- `NumberField`, `RangeField`, `SliderRangeField`, `RatingField`
- `DateField`, `ColorField`, `FileField`, `HiddenField`
- `ChipInput`, `PhoneNumberField`, `CountryPickerField`
- `PasswordStrengthField`, `TransferListField`, `SegmentedControlField`
- `ThemeToggleField`, `FieldShell`

### Overlays and feedback

- `Modal`, `Dialog`, `Drawer`, `Popover`
- `DropdownMenu`, `ContextMenuProvider`, `CommandPalette`
- `Tooltip`, `Toast`, `ToastProvider`, `Alert`

### Content and data

- `Card`, `Panel`, `Section`, `Table`, `DataGrid`
- `Tabs`, `Accordion`, `AccordionGroup`, `ShowMore`
- `Badge`, `Avatar`, `AvatarGroup`, `List`, `DescriptionList`
- `PropertyGrid`, `Statistic`, `EmptyState`, `Skeleton`
- `ContentTimeline`, `TreeView`, `MasonryGrid`, `JsonViewer`

### Layout

- `Stack`, `Columns`, `Grid`, `Splitter`, `ResizablePanel`
- `DockLayout`, `ScrollArea`, `AspectRatio`, `Container`, `Spacer`
- `Breadcrumb`, `Pagination`, `PageHeader`, `Toolbar`
- `BottomNavigation`, `NavigationRail`, `SplitButton`, `FloatingActionButton`

### Navigation

- `Sidebar`, `TopNavigation`, `MegaMenu`

### Charts and metrics

- `Chart` — bar, line, area, pie, donut, scatter, funnel, radar, sankey, treemap, and more
- `Gauge`, `Sparkline`, `ProgressRing`, `ProgressBar`, `Speedometer`
- `StatCard`, `MetricTile`, `StatusIndicator`, `TrendBadge`
- `Tiles`, `Tile`, `StatTile`, `StatTiles`

### Dashboard widgets

- `DashboardContentContainer`
- `PipelineOverview`, `DealsOverTime`
- `UpcomingTasks`, `RecentActivity`, `TopPerformingUsers`

Compose dashboard rows with `Columns`:

```tsx
import {
  Columns,
  DashboardContentContainer,
  UpcomingTasks,
  RecentActivity,
  TopPerformingUsers,
} from "opus-react";

<Columns direction="row" columns={3} gap={16}>
  <DashboardContentContainer data-component="upcoming-tasks" width="full">
    <UpcomingTasks title="Upcoming Tasks" tasks={tasks} />
  </DashboardContentContainer>
  <DashboardContentContainer data-component="recent-activity" width="full">
    <RecentActivity title="Recent Activity" items={activity} />
  </DashboardContentContainer>
  <DashboardContentContainer data-component="top-performing-users" width="full">
    <TopPerformingUsers title="Top Performing People" users={people} />
  </DashboardContentContainer>
</Columns>;
```

### Media and 3D

- `Carousel`, `Lightbox`, `ImageThumbnail`, `ImageGallery`
- `ModelViewer`, `ModelLightbox`, `ModelThumbnail`, `ModelGallery` (requires `three`)

### Builders and planning

- `FilterBuilder`, `QueryBuilder`, `RuleBuilder`
- `PermissionsMatrix`, `DualListBuilder`
- `Scheduler`, `KanbanBoard`, `Calendar`, `ResourcePlanner`
- `PropertyInspector`

### Utilities

- `OpusThemeProvider`, `useOpusTheme`
- `AccentColorPicker`, `createAccentStyle`, `useAccentPreference`
- `IconPicker`, `CatalogIcon`, `Icon`
- `Portal`, `FocusTrap`, `VisuallyHidden`
- `HotkeyManager`, `useHotkey`, `KeyboardShortcut`
- `Clipboard`, `CopyButton`
- `ThemeProvider`, `ThemeSwitcher`
- `ResizeObserver`, `IntersectionObserver`, `Spinner`

## Examples

### Button

```tsx
import { Button } from "opus-react";

<Button variant="primary">Create project</Button>
<Button variant="secondary">Cancel</Button>
```

### Text field with validation

```tsx
import { TextField } from "opus-react";

<TextField
  label="Email address"
  placeholder="you@example.com"
  error="Enter a valid email address"
/>
```

### Toast notifications

```tsx
import { OpusThemeProvider, ToastProvider, useToast, Button } from "opus-react";

function NotifyButton() {
  const { showToast } = useToast();

  return (
    <Button
      variant="primary"
      onClick={() => showToast({ title: "Saved", description: "Your changes were saved." })}
    >
      Save
    </Button>
  );
}

export function App() {
  return (
    <OpusThemeProvider theme="dark">
      <ToastProvider>
        <NotifyButton />
      </ToastProvider>
    </OpusThemeProvider>
  );
}
```

### Chart

```tsx
import { Chart } from "opus-react";

<Chart
  variant="bar-chart-vertical"
  title="Revenue by region"
  data={[
    { label: "EMEA", value: 42 },
    { label: "APAC", value: 28 },
    { label: "AMER", value: 35 },
  ]}
/>
```

## TypeScript

Type definitions ship with the package (`dist/index.d.ts`). Component prop types and shared tokens (for example `ChartVariant`, `ButtonVariant`, `Theme`) are exported from `opus-react`.

## Package exports

```json
{
  ".": "./dist/index.js",
  "./styles.css": "./dist/styles.css",
  "./index.css": "./dist/index.css",
  "./flags.css": "./dist/flags.css"
}
```

ESM and CommonJS builds are both published.

## Not included in the package

The published npm package does **not** include:

- Documentation site shells and routing
- Component preview / settings tooling
- Generated usage-code helpers
- Internal monorepo build scripts

Those live in the Opus Library workspace and are for development and docs only.

## Publishing (maintainers)

From the Library workspace root:

```bash
cd Library
npm run build:lib
npm publish -w opus-react --access public
```

`prepublishOnly` runs the package build automatically. Bump the version in `packages/opus-react/package.json` before publishing.

## License

UNLICENSED — see `package.json`.
