# Component library

All components registered in `lib/controls/registry.ts`. Each has a detail page at `/documentation/components/{slug}`.

## Content (12)

| Slug | Component | Description |
|------|-----------|-------------|
| `accordion` | `Accordion` | Expandable section with animated panel |
| `accordion-group` | `AccordionGroup` | Multiple accordions with shared or independent open state |
| `card` | `Card` | Bordered content container |
| `data-grid` | `DataGrid` | Tabular data with column configuration |
| `empty-state` | `EmptyState` | Placeholder for empty lists or search results |
| `panel` | `Panel` | Surface panel with optional heading |
| `show-more` | `ShowMore` | Truncated text with expand/collapse |
| `sidebar` | `Sidebar`, `SidebarLayout`, … | Application sidebar shell and nav links |
| `skeleton` | `Skeleton` | Loading placeholder shapes |
| `table` | `Table` | Semantic HTML table wrapper |
| `tabs` | `Tabs` | Tabbed content panels |
| `top-navigation` | `TopNavigation`, `TopNavigationMenu` | Application menu bar with dropdown menus |

### Sidebar exports

```tsx
import {
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarLayout,
  SidebarLink,
  SidebarNav,
} from "@/components/fields";
```

### Top navigation exports

```tsx
import {
  TopNavigation,
  TopNavigationMenu,
  useTopNavigation,
  defaultTopNavigationMenus,
} from "@/components/fields";
```

`TopNavigationMenu` accepts `label` and `items` (or custom `children` for mega-menu panels). It wraps `DropdownMenu` internally.

---

## Forms (25)

Forms controls use `FieldShell` unless noted. Button variants share the `Button` component.

| Slug | Component | Notes |
|------|-----------|-------|
| `button` | `Button` | Standalone button, multiple variants |
| `submit-button` | `Button` | `type="submit"` |
| `reset-button` | `Button` | `type="reset"` |
| `checkbox` | `CheckboxField` | Round or square shape |
| `switch` | `SwitchField` | Toggle switch |
| `radio-group` | `RadioGroup`, `Radio` | Single choice from a set |
| `color-picker` | `ColorField` | Native colour input |
| `date-picker` | `DateField` | `type="date"` |
| `time-picker` | `DateField` | `type="time"` |
| `datetime-picker` | `DateField` | `type="datetime-local"` |
| `month-picker` | `DateField` | `type="month"` |
| `week-picker` | `DateField` | `type="week"` |
| `email-input` | `TextField` | `type="email"` |
| `telephone-input` | `TextField` | `type="tel"` |
| `url-input` | `TextField` | `type="url"` |
| `search-input` | `TextField` | `type="search"` |
| `file-upload` | `FileField` | File picker with drag area |
| `hidden-input` | `HiddenField` | Visually hidden input |
| `number-input` | `NumberField` | Numeric input with step controls |
| `password-input` | `TextField` | `type="password"` |
| `range-slider` | `RangeField` | Range slider |
| `select` | `SelectField` | Dropdown select |
| `text-input` | `TextField` | Single-line text |
| `textarea` | `TextAreaField` | Multi-line text |
| `theme-toggle` | `ThemeToggleField` | Light/dark toggle with sun/moon icons |

### FieldShell modes

| Mode | Behaviour |
|------|-----------|
| `stacked` | Label above control |
| `flagged` | Compact inline label |

Label position (`left` / `right`) applies in flagged mode.

---

## Overlays (10)

| Slug | Component | Description |
|------|-----------|-------------|
| `command-palette` | `CommandPalette` | Keyboard-driven command search |
| `context-menu` | `ContextMenuProvider`, `ContextMenuTarget` | Right-click menu (provider pattern) |
| `dialog` | `Dialog` | Confirmation / prompt dialog |
| `drawer` | `Drawer` | Slide-in panel from an edge |
| `dropdown-menu` | `DropdownMenu` | Click-triggered menu |
| `modal` | `Modal` | Centred overlay dialog |
| `popover` | `Popover` | Anchored floating panel |
| `alert` | `Alert` | Inline status message (info, success, warning, error) |
| `toast` | `Toast`, `ToastProvider` | Transient notification (provider pattern) |
| `tooltip` | `Tooltip` | Hover/focus help text |

### Provider patterns

**Toast** — wrap the app (or section) in `ToastProvider`, then call `useToast().show(...)`:

```tsx
<OpusThemeProvider theme="dark">
  <ToastProvider>
    {children}
  </ToastProvider>
</OpusThemeProvider>
```

**Context menu** — same pattern with `ContextMenuProvider` + `ContextMenuTarget`:

```tsx
<ContextMenuTarget items={[...]} onSelect={...}>
  {children}
</ContextMenuTarget>
```

Both providers read theme from `OpusThemeProvider` via `useOpusTheme()`.

---

## Source files

Each registry entry lists its `sourceFiles` — the React component and CSS module that implement it. Open the detail page for a component to see the live preview and generated usage code.
