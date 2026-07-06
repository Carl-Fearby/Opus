# Adding a component

Follow this checklist when introducing a new documented component to Opus.

## 1. Implement the component

Create the React component and CSS module:

```
components/MyComponent.tsx
components/MyComponent.module.css
```

For form controls, wrap content in `FieldShell`:

```
components/fields/MyField.tsx
components/fields/MyField.module.css
```

Match existing patterns for naming, prop types, and CSS token usage.

## 2. Export it

Add to `components/fields/index.ts` (re-exported by `components/index.ts`):

```ts
export { MyComponent } from "../MyComponent";
```

## 3. Register the slug

**File:** `lib/controls/types.ts`

Add to the `ControlSlug` union:

```ts
| "my-component"
```

Add a settings interface and extend `ControlSettingsBySlug`:

```ts
export type MyComponentSettings = {
  label: string;
  // …demo props
};
```

If the component is in **forms**, add the slug to `formsControlOrder`.

## 4. Add defaults

**File:** `lib/controls/defaults.ts`

```ts
"my-component": {
  label: "Example",
  // …
},
```

## 5. Add registry entry

**File:** `lib/controls/registry.ts`

For forms, add to `formsControls`. For content/overlays, add to the `controls` array:

```ts
{
  slug: "my-component",
  title: "My component",
  category: "content",
  componentName: "MyComponent",
  description: "Short description for overview cards.",
  sourceFiles: ["components/MyComponent.tsx", "components/MyComponent.module.css"],
  usesFieldShell: false,
},
```

## 6. Add an icon

**File:** `lib/controls/componentIcons.ts`

```ts
"my-component": faSomeIcon,
```

Import the icon from `@fortawesome/free-solid-svg-icons`.

## 7. Wire the detail page

Three switches need a new `case`:

### Preview — `components/control-detail/ControlPreview.tsx`

```tsx
case "my-component": {
  const s = settings as ControlSettingsBySlug["my-component"];
  return <MyComponent label={s.label} />;
}
```

### Settings — `components/control-detail/ControlSettingsPanel.tsx`

Add inputs (`SettingInput`, `SettingSelect`, `SettingToggle`, …) that call `onChange` with updated settings.

### Usage code — `lib/controls/generateUsageCode.ts`

```tsx
case "my-component": {
  const s = settings as ControlSettingsBySlug["my-component"];
  return `import { MyComponent } from "@/components/fields";

export function Example() {
  return (
    <MyComponent${formatStringProp("label", s.label)} />
  );
}`;
}
```

Use existing `formatStringProp`, `formatBoolProp`, etc. helpers in that file.

## 8. Category overview (optional)

Add a live demo to the relevant overview if it needs more than the auto-generated hub card:

- `ContentOverview.tsx` — uses `OverviewDemoCard`
- `FormsOverview.tsx` — add to the `demos` map
- `OverlaysOverview.tsx` — uses `OverviewDemoCard`

The main hub overview (`ComponentsHubOverview`) picks up new registry entries automatically.

## 9. Add documentation

**File:** `lib/controls/componentDocumentation.ts`

Add a markdown entry for the slug with Overview, When to use, Props, and Accessibility sections. You can optionally override it with a file at `documentation/content/components/my-component.md`.

The detail page renders this in the **Documentation** panel between Preview and Usage.

## 10. Verify

```bash
npm run build   # confirms SSG includes the new slug
npm run dev     # visit /documentation/components/my-component
```

Check:

- [ ] Sidebar shows the component under the correct category
- [ ] Preview renders and responds to settings
- [ ] Usage code copies valid JSX
- [ ] Icon appears in sidebar and hub grid
- [ ] Documentation panel shows overview, props table, and accessibility notes
- [ ] Light and dark themes look correct

## Route generation

No route file changes are required. `generateStaticParams` in `app/documentation/components/[slug]/page.tsx` reads all slugs from the registry:

```ts
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}
```

## Common pitfalls

- Forgetting one of the three switches (preview, settings, codegen) — the detail page will break or show stale output for that slug.
- Hardcoding colours instead of CSS tokens — breaks theme switching.
- Portal components without `data-theme` on the portal root — CSS variables fall back to wrong values.
- Form controls without `FieldShell` accessibility wiring — labels and errors won't associate correctly.
