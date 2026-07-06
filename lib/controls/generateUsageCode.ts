import type { ControlSettings, ControlSettingsBySlug, ControlSlug } from "./types";
import {
  getSectionDemoSlots,
  getSectionLayoutConfigFromSettings,
  usesNestedContentRow,
} from "@/lib/layout/sectionLayout";
import {
  buildDataGridColumns,
  dataGridRows,
  formatDataGridColumnsForUsage,
  formatDataGridRowsForUsage,
} from "./dataGridDemoData";
import {
  chartDemoData,
  chartDemoSeries,
  chartUsesSeries,
  formatChartDataForUsage,
  formatChartSeriesForUsage,
  getChartPreviewData,
  getChartUsageDataMode,
} from "./chartDemoData";
import { worldMapRegionIds } from "@/components/Chart/worldMapRegions";
import { isChartSlug } from "./chartCatalog";
import { formatModelAssetsForUsage } from "@/lib/models/vx27Assets";
import {
  gaugePreviewValue,
  getGaugeFooter,
  getGaugeTrackColor,
  getGaugeValueColor,
} from "./dashboardWidgetData";
import { getFontAwesomeIconOption } from "@/lib/fontAwesomeIconCatalog";
import {
  buildMegaMenuPreviewConfig,
  formatMegaMenuMenusForUsage,
} from "./megaMenuDemo";
import { splitUsageCode } from "./usageCode";

const radioOptions = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
  { label: "Enterprise", value: "enterprise" },
];

function toStateName(label: string): string {
  const words = label
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (!words.length) {
    return "value";
  }

  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : lower[0].toUpperCase() + lower.slice(1);
    })
    .join("");
}

function toSetter(state: string): string {
  return `set${state[0].toUpperCase()}${state.slice(1)}`;
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function formatStringProp(name: string, value: string): string {
  return `${name}=${quote(value)}`;
}

function formatBoolProp(name: string, value: boolean): string {
  return `${name}={${value}}`;
}

function formatNumberProp(name: string, value: number): string {
  return `${name}={${value}}`;
}

function formatExpressionProp(name: string, expression: string): string {
  return `${name}={${expression}}`;
}

function formatSelfClosing(props: string[]): string {
  if (!props.length) {
    return " />";
  }

  if (props.length === 1) {
    return ` ${props[0]} />`;
  }

  return `\n  ${props.join("\n  ")}\n/>`;
}

function formatOpeningProps(props: string[]): string {
  if (!props.length) {
    return "";
  }

  if (props.length === 1) {
    return ` ${props[0]}`;
  }

  return `\n  ${props.join("\n  ")}\n`;
}

function formatJsxRichContent(content: string, indent = "  "): string {
  const paragraphs = content
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (!paragraphs.length) {
    return "";
  }

  return paragraphs
    .map((paragraph) => {
      const lines = paragraph.split("\n");

      if (lines.length === 1) {
        return `${indent}<p>{${quote(paragraph)}}</p>`;
      }

      const body = lines
        .map((line, index) => {
          const lineNode = `{${quote(line)}}`;
          return index === 0 ? lineNode : `\n${indent}  <br />\n${indent}  ${lineNode}`;
        })
        .join("");

      return `${indent}<p>\n${indent}  ${body}\n${indent}</p>`;
    })
    .join("\n");
}

function fieldProps(settings: ControlSettingsBySlug[Exclude<ControlSlug, "button" | "submit-button" | "reset-button" | "theme-toggle" | "accent-color-picker" | "icon-picker" | "tooltip" | "dialog" | "drawer" | "dropdown-menu" | "context-menu" | "command-palette" | "modal" | "popover" | "alert" | "toast" | "tabs" | "card" | "stat-card" | "gauge" | "panel" | "section" | "table" | "data-grid" | "skeleton" | "bar-chart-vertical" | "bar-chart-horizontal" | "grouped-bar-chart" | "stacked-bar-chart" | "stacked-bar-chart-100" | "line-chart" | "multi-line-chart" | "area-chart" | "stacked-area-chart" | "spline-chart" | "pie-chart" | "donut-chart" | "scatter-plot" | "bubble-chart" | "radar-chart" | "polar-area-chart" | "funnel-chart" | "pyramid-chart" | "carousel" | "lightbox" | "image-thumbnail" | "image-gallery" | "model-viewer" | "model-lightbox" | "model-thumbnail" | "model-gallery" | "accordion" | "accordion-group" | "show-more" | "empty-state" | "sidebar" | "mega-menu" | "top-navigation">]) {
  const props = [
    formatStringProp("label", settings.label),
    formatStringProp("mode", settings.mode),
    formatStringProp("labelPosition", settings.labelPosition),
  ];

  if (settings.required) {
    props.push(formatBoolProp("required", true));
  }

  if (settings.errorEnabled) {
    props.push(formatStringProp("error", settings.error));
  }

  if (settings.helpEnabled) {
    props.push(formatStringProp("help", settings.help));
  }

  return props;
}

function importLine(components: string[]): string {
  return `import { ${components.join(", ")} } from "@/components/fields";`;
}

function usageClientPrefix(includeUseState = true): string {
  return includeUseState ? `"use client";\n\nimport { useState } from "react";` : `"use client";`;
}

function controlledFieldUsage(
  components: string[],
  tagName: string,
  state: string,
  props: string[],
  options?: { children?: string; initial?: string },
): string {
  const initial = options?.initial ?? '""';
  const header = `${usageClientPrefix()}\n${importLine(components)}\n\nconst [${state}, ${toSetter(state)}] = useState(${initial});`;

  if (options?.children) {
    return `${header}\n\n<${tagName}${formatOpeningProps(props)}>\n${options.children}\n</${tagName}>`;
  }

  return `${header}\n\n<${tagName}${formatSelfClosing(props)}`;
}

function interactiveUsage({
  components,
  extraImports = [],
  preamble = [],
  state = [],
  jsx,
}: {
  components: string[];
  extraImports?: string[];
  preamble?: string[];
  state: string[];
  jsx: string;
}): string {
  const importsBlock = [usageClientPrefix(), ...extraImports, importLine(components), ...preamble, ...state]
    .filter(Boolean)
    .join("\n");
  const trimmedJsx = jsx.trim();
  const returnBody = trimmedJsx.startsWith("(")
    ? `${trimmedJsx};`
    : trimmedJsx.endsWith(";")
      ? trimmedJsx
      : `${trimmedJsx};`;

  return `${importsBlock}\n\nreturn ${returnBody}`;
}

function generateUsageCodeContent(slug: ControlSlug, settings: ControlSettings): string {
  const id = slug;

  if (isChartSlug(slug)) {
    const s = settings as ControlSettingsBySlug[typeof slug];
    const includeSeries = chartUsesSeries(s.variant);
    const previewData = getChartPreviewData(slug);
    const props = [
      formatExpressionProp("data", "data"),
      ...(includeSeries ? [formatExpressionProp("series", "series")] : []),
      formatStringProp("variant", s.variant),
      formatStringProp("title", s.title),
      ...(s.palette !== "opus" ? [formatStringProp("palette", s.palette)] : []),
      ...(s.height !== 280 ? [formatNumberProp("height", s.height)] : []),
      ...(s.maximise ? [formatBoolProp("maximise", true)] : []),
      ...(s.showAxis ? [formatBoolProp("showAxis", true)] : []),
      ...(s.showGrid ? [formatBoolProp("showGrid", true)] : []),
      ...(s.showLegend ? [] : [formatBoolProp("showLegend", false)]),
      ...(s.showValues ? [formatBoolProp("showValues", true)] : []),
      ...(s.xAxisLabel ? [formatStringProp("xAxisLabel", s.xAxisLabel)] : []),
      ...(s.yAxisLabel ? [formatStringProp("yAxisLabel", s.yAxisLabel)] : []),
      ...(s.highlightLabel ? [formatStringProp("highlightLabel", s.highlightLabel)] : []),
    ];
    const dataMode = getChartUsageDataMode(s.variant);
    const mapUsageNote =
      s.variant === "choropleth"
        ? `// Choropleth regions use region ids: ${worldMapRegionIds.join(", ")}\n\n`
        : s.variant === "geo-map" || s.variant === "bubble-map"
          ? "// Geo points use lat/lng coordinates from your data.\n\n"
          : "";
    return `${usageClientPrefix(false)}\n${importLine(["Chart"])}

${mapUsageNote}const data = ${formatChartDataForUsage(previewData, dataMode)};

${includeSeries ? `const series = ${formatChartSeriesForUsage(chartDemoSeries)};

` : ""}return <Chart${formatSelfClosing(props)};`;
  }

  switch (slug) {
    case "text-input": {
      const s = settings as ControlSettingsBySlug["text-input"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("type", "text"),
        ...(s.placeholderEnabled ? [formatStringProp("placeholder", s.placeholder)] : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.value)`),
      ];
      return controlledFieldUsage(["TextField"], "TextField", state, props);
    }
    case "email-input":
    case "password-input":
    case "search-input":
    case "telephone-input":
    case "url-input": {
      const s = settings as ControlSettingsBySlug["email-input"];
      const state = toStateName(s.label);
      const inputType =
        slug === "email-input"
          ? "email"
          : slug === "password-input"
            ? "password"
            : slug === "search-input"
              ? "search"
              : slug === "telephone-input"
                ? "tel"
                : "url";
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("type", inputType),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.value)`),
      ];
      return controlledFieldUsage(["TextField"], "TextField", state, props);
    }
    case "textarea": {
      const s = settings as ControlSettingsBySlug["textarea"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        ...(s.placeholderEnabled ? [formatStringProp("placeholder", s.placeholder)] : []),
        ...(s.maxCharsEnabled ? [formatNumberProp("maxChars", s.maxChars)] : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.value)`),
      ];
      return controlledFieldUsage(["TextAreaField"], "TextAreaField", state, props);
    }
    case "select": {
      const s = settings as ControlSettingsBySlug["select"];
      const state = toStateName(s.label);
      const options = s.options
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        `options={[${options.map((option) => quote(option)).join(", ")}]}`,
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.value)`),
      ];
      return controlledFieldUsage(["SelectField"], "SelectField", state, props, {
        initial: options[0] ? quote(options[0]) : '""',
      });
    }
    case "date-picker":
    case "datetime-picker":
    case "month-picker":
    case "time-picker":
    case "week-picker": {
      const s = settings as ControlSettingsBySlug["date-picker"];
      const state = toStateName(s.label);
      const inputType =
        slug === "date-picker"
          ? "date"
          : slug === "datetime-picker"
            ? "datetime-local"
            : slug === "month-picker"
              ? "month"
              : slug === "time-picker"
                ? "time"
                : "week";
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        ...(inputType !== "date" ? [formatStringProp("type", inputType)] : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.value)`),
      ];
      return controlledFieldUsage(["DateField"], "DateField", state, props);
    }
    case "radio-group": {
      const s = settings as ControlSettingsBySlug["radio-group"];
      const state = toStateName(s.label);
      const groupProps = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("name", `${id}-group`),
        formatStringProp("shape", s.shape),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      const children = radioOptions
        .map((option) => {
          const radioProps = [
            formatStringProp("value", option.value),
            ...(s.optionErrorsEnabled ? [formatStringProp("error", s.optionError)] : []),
          ];
          return `  <Radio${formatOpeningProps(radioProps)}>\n    ${option.label}\n  </Radio>`;
        })
        .join("\n");
      return controlledFieldUsage(["Radio", "RadioGroup"], "RadioGroup", state, groupProps, {
        children,
        initial: quote(radioOptions[0]?.value ?? ""),
      });
    }
    case "checkbox": {
      const s = settings as ControlSettingsBySlug["checkbox"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("shape", s.shape),
        formatExpressionProp("checked", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.checked)`),
      ];
      return controlledFieldUsage(["CheckboxField"], "CheckboxField", state, props, { initial: "false" });
    }
    case "switch": {
      const s = settings as ControlSettingsBySlug["switch"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("checked", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.checked)`),
      ];
      return controlledFieldUsage(["SwitchField"], "SwitchField", state, props, { initial: "false" });
    }
    case "range-slider": {
      const s = settings as ControlSettingsBySlug["range-slider"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatNumberProp("min", s.min),
        formatNumberProp("max", s.max),
        formatNumberProp("step", s.step),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(Number(event.target.value))`),
      ];
      return controlledFieldUsage(["RangeField"], "RangeField", state, props, { initial: String(s.min) });
    }
    case "number-input": {
      const s = settings as ControlSettingsBySlug["number-input"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatNumberProp("min", s.min),
        formatNumberProp("max", s.max),
        formatNumberProp("step", s.step),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(Number(event.target.value) || 0)`),
      ];
      return controlledFieldUsage(["NumberField"], "NumberField", state, props, { initial: "0" });
    }
    case "file-upload": {
      const s = settings as ControlSettingsBySlug["file-upload"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        ...(s.fileName ? [formatStringProp("fileName", s.fileName)] : []),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.files?.[0]?.name ?? "")`),
      ];
      return controlledFieldUsage(["FileField"], "FileField", state, props);
    }
    case "color-picker": {
      const s = settings as ControlSettingsBySlug["color-picker"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(event) => ${toSetter(state)}(event.target.value)`),
      ];
      return controlledFieldUsage(["ColorField"], "ColorField", state, props, { initial: quote("#8f6cff") });
    }
    case "hidden-input": {
      const s = settings as ControlSettingsBySlug["hidden-input"];
      const props = [
        formatStringProp("id", id),
        formatStringProp("label", s.label),
        formatStringProp("mode", s.mode),
        formatStringProp("labelPosition", s.labelPosition),
        formatStringProp("name", s.name),
        formatStringProp("value", s.value),
        ...(s.required ? [formatBoolProp("required", true)] : []),
        ...(s.helpEnabled ? [formatStringProp("help", s.help)] : []),
      ];
      return `${importLine(["HiddenField"])}\n\n<HiddenField${formatSelfClosing(props)}`;
    }
    case "button":
    case "submit-button":
    case "reset-button": {
      const s = settings as ControlSettingsBySlug["button"];
      const buttonType = slug === "submit-button" ? "submit" : slug === "reset-button" ? "reset" : "button";
      const props = [
        formatStringProp("variant", s.variant),
        ...(buttonType !== "button" ? [formatStringProp("type", buttonType)] : []),
        ...(s.disabled ? [formatBoolProp("disabled", true)] : []),
      ];
      if (!props.length) {
        return `${importLine(["Button"])}\n\n<Button>${s.label}</Button>`;
      }
      return `${importLine(["Button"])}\n\n<Button${formatOpeningProps(props)}>\n  ${s.label}\n</Button>`;
    }
    case "theme-toggle": {
      const s = settings as ControlSettingsBySlug["theme-toggle"];
      const props = [
        formatStringProp("id", id),
        formatStringProp("label", s.label),
        formatStringProp("mode", s.mode),
        formatStringProp("labelPosition", s.labelPosition),
        formatExpressionProp("value", "theme"),
        formatExpressionProp("onChange", "setTheme"),
      ];
      return `${usageClientPrefix()}\n${importLine(["ThemeToggleField"])}\n\nconst [theme, setTheme] = useState<"dark" | "light">(${quote(s.value)});\n\n<ThemeToggleField${formatSelfClosing(props)}`;
    }
    case "accent-color-picker": {
      const s = settings as ControlSettingsBySlug["accent-color-picker"];
      const props = [
        formatStringProp("id", id),
        formatStringProp("label", s.label),
        formatStringProp("mode", s.mode),
        formatStringProp("labelPosition", s.labelPosition),
        formatExpressionProp("value", "accent"),
        formatExpressionProp("onChange", "setAccent"),
      ];
      return `${usageClientPrefix()}\nimport { AccentColorPicker, createAccentStyle } from "@/components/AccentColorPicker";

const [accent, setAccent] = useState(${quote(s.value)});
const accentStyle = createAccentStyle(accent);

return (
  <div style={accentStyle}>
    <AccentColorPicker${formatSelfClosing(props)}
  </div>
);`;
    }
    case "icon-picker": {
      const s = settings as ControlSettingsBySlug["icon-picker"];
      const iconOption = getFontAwesomeIconOption(s.value);
      const props = [
        formatStringProp("id", id),
        formatStringProp("label", s.label),
        formatStringProp("mode", s.mode),
        formatStringProp("labelPosition", s.labelPosition),
        formatStringProp("value", s.value),
        formatExpressionProp("onChange", "setIcon"),
      ];
      return `${usageClientPrefix()}\nimport { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ${iconOption.importName} } from "@fortawesome/free-solid-svg-icons";
import "@/lib/fontawesome";
import { IconPicker } from "@/components/IconPicker";

const [icon, setIcon] = useState(${quote(s.value)});

return <IconPicker${formatSelfClosing(props)} />;`;
    }
    case "tooltip": {
      const s = settings as ControlSettingsBySlug["tooltip"];
      const props = [
        formatStringProp("content", s.content),
        formatStringProp("label", `Help for ${s.demoLabel}`),
      ];
      return `${importLine(["Tooltip"])}\n\n<Tooltip${formatSelfClosing(props)}`;
    }
    case "dialog": {
      const s = settings as ControlSettingsBySlug["dialog"];
      const props = [
        formatExpressionProp("open", "dialogOpen"),
        formatStringProp("actionSet", s.actionSet),
        formatStringProp("status", s.status),
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        ...(s.dismissOnBackdrop ? [] : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape ? [] : [formatBoolProp("dismissOnEscape", false)]),
      ];
      const dialogProps = props.map((prop) => `    ${prop}`).join("\n");
      return interactiveUsage({
        components: ["Button", "Dialog"],
        state: [`const [dialogOpen, setDialogOpen] = useState(${s.open});`],
        jsx: `(
  <>
    <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
    <Dialog
${dialogProps}
      onClose={(result) => {
        setDialogOpen(false);
        console.log(result);
      }}
    />
  </>
)`,
      });
    }
    case "drawer": {
      const s = settings as ControlSettingsBySlug["drawer"];
      const props = [
        formatExpressionProp("open", "drawerOpen"),
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        formatStringProp("side", s.side),
        ...(s.dismissOnBackdrop ? [] : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape ? [] : [formatBoolProp("dismissOnEscape", false)]),
        ...(s.closeButton ? [] : [formatBoolProp("closeButton", false)]),
      ];
      const drawerProps = props.map((prop) => `    ${prop}`).join("\n");
      const children =
        s.contentType === "form"
          ? `    <TextField
      id="filter-query"
      label="Search query"
      mode="stacked"
      labelPosition="left"
      type="text"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
    />
    <SelectField
      id="filter-category"
      label="Category"
      mode="stacked"
      labelPosition="left"
      options={["Components", "Templates", "Tokens"]}
      value={category}
      onChange={(event) => setCategory(event.target.value)}
    />`
          : formatJsxRichContent(s.content, "    ");
      const imports =
        s.contentType === "form"
          ? ["Button", "Drawer", "DrawerDefaultActions", "SelectField", "TextField"]
          : ["Button", "Drawer", "DrawerDefaultActions"];
      const state =
        s.contentType === "form"
          ? [
              `const [drawerOpen, setDrawerOpen] = useState(${s.open});`,
              `const [query, setQuery] = useState("Design system");`,
              `const [category, setCategory] = useState("Components");`,
            ]
          : [`const [drawerOpen, setDrawerOpen] = useState(${s.open});`];
      return interactiveUsage({
        components: imports,
        state,
        jsx: `(
  <>
    <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
    <Drawer
${drawerProps}
      footer={${s.footerActions ? quote("Drawer changes are applied to the current page.") : "undefined"}}
      actions={${s.footerActions ? "<DrawerDefaultActions onClose={() => setDrawerOpen(false)} />" : "undefined"}}
      onClose={() => setDrawerOpen(false)}
    >
${children}
    </Drawer>
  </>
)`,
      });
    }
    case "dropdown-menu": {
      const s = settings as ControlSettingsBySlug["dropdown-menu"];
      const items = [
        `{ id: "rename", label: "Rename"${s.showIcons ? ', icon: "✎"' : ""}, shortcut: "R" }`,
        `{ id: "pin", label: "Pinned", checked: true${s.showIcons ? ', icon: "✓"' : ""} }`,
        `{ id: "duplicate", label: "Duplicate"${s.showIcons ? ', icon: "⧉"' : ""}, shortcut: "⌘D" }`,
        ...(s.showDisabled
          ? [`{ id: "archive", label: "Archive", disabled: true${s.showIcons ? ', icon: "⌁"' : ""} }`]
          : []),
        ...(s.showDestructive
          ? [`{ id: "delete", label: "Delete", destructive: true${s.showIcons ? ', icon: "!"' : ""} }`]
          : []),
      ];
      const props = [
        formatExpressionProp("open", "menuOpen"),
        formatStringProp("placement", s.placement),
        ...(s.closeOnOutside ? [] : [formatBoolProp("closeOnOutside", false)]),
        ...(s.closeOnEscape ? [] : [formatBoolProp("closeOnEscape", false)]),
        ...(s.closeOnSelect ? [] : [formatBoolProp("closeOnSelect", false)]),
        formatExpressionProp("items", "items"),
        formatExpressionProp("trigger", '<Button variant="primary">Actions</Button>'),
        formatExpressionProp("onOpenChange", "setMenuOpen"),
        formatExpressionProp("onSelect", "(item) => console.log(item.label)"),
      ];
      const menuProps = props.map((prop) => `    ${prop}`).join("\n");
      return interactiveUsage({
        components: ["Button", "DropdownMenu"],
        preamble: [
          "",
          "const items = [",
          `  ${items.join(",\n  ")},`,
          "];",
        ],
        state: [`const [menuOpen, setMenuOpen] = useState(${s.open});`],
        jsx: `<DropdownMenu
${menuProps}
/>`,
      });
    }
    case "context-menu": {
      const s = settings as ControlSettingsBySlug["context-menu"];
      const items = [
        `{ id: "rename", label: "Rename"${s.showIcons ? ', icon: "✎"' : ""}, shortcut: "R" }`,
        `{ id: "pin", label: "Pinned", checked: true${s.showIcons ? ', icon: "✓"' : ""} }`,
        `{ id: "duplicate", label: "Duplicate"${s.showIcons ? ', icon: "⧉"' : ""}, shortcut: "⌘D" }`,
        ...(s.showDisabled
          ? [`{ id: "archive", label: "Archive", disabled: true${s.showIcons ? ', icon: "⌁"' : ""} }`]
          : []),
        ...(s.showDestructive
          ? [`{ id: "delete", label: "Delete", destructive: true${s.showIcons ? ', icon: "!"' : ""} }`]
          : []),
      ];
      const props = [
        ...(s.closeOnOutside ? [] : [formatBoolProp("closeOnOutside", false)]),
        ...(s.closeOnEscape ? [] : [formatBoolProp("closeOnEscape", false)]),
        ...(s.closeOnSelect ? [] : [formatBoolProp("closeOnSelect", false)]),
      ];
      const providerProps = props.map((prop) => `      ${prop}`).join("\n");
      return interactiveUsage({
        components: ["ContextMenuProvider", "ContextMenuTarget"],
        preamble: [
          "",
          "// Wrap your app layout once (theme is provided by OpusThemeProvider):",
          "// <OpusThemeProvider theme={theme}>",
          "//   <ContextMenuProvider>{children}</ContextMenuProvider>",
          "// </OpusThemeProvider>",
          "",
          "const items = [",
          `  ${items.join(",\n  ")},`,
          "];",
        ],
        state: [`const [menuOpen, setMenuOpen] = useState(${s.open});`],
        jsx: `(
  <ContextMenuProvider
    open={menuOpen}
${providerProps}
    onOpenChange={setMenuOpen}
  >
    <ContextMenuTarget
      items={items}
      label="Context menu"
      onSelect={(item) => console.log(item.label)}
    >
      <p>{${quote(s.targetLabel)}}</p>
    </ContextMenuTarget>
  </ContextMenuProvider>
)`,
      });
    }
    case "command-palette": {
      const s = settings as ControlSettingsBySlug["command-palette"];
      const items = s.showEmptyResults
        ? "[]"
        : `[
  { id: "overview", label: "Go to overview", description: "Browse the component library", group: "Navigation", shortcut: "⌘O" },
  { id: "components", label: "Open components", description: "View all registered components", group: "Navigation", shortcut: "⌘K" },
  { id: "create", label: "Create component", description: "Start a new component entry", group: "Actions", shortcut: "⌘N" },
  { id: "settings", label: "Open settings", description: "Workspace and account preferences", group: "Account" },
]`;
      const props = [
        formatExpressionProp("open", "paletteOpen"),
        formatStringProp("placeholder", s.placeholder),
        formatStringProp("emptyMessage", s.emptyMessage),
        ...(s.dismissOnBackdrop ? [] : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape ? [] : [formatBoolProp("dismissOnEscape", false)]),
        ...(s.closeOnSelect ? [] : [formatBoolProp("closeOnSelect", false)]),
        ...(s.showShortcuts ? [] : [formatBoolProp("showShortcuts", false)]),
        ...(s.showDescriptions ? [] : [formatBoolProp("showDescriptions", false)]),
        ...(s.showGroups ? [] : [formatBoolProp("showGroups", false)]),
        formatExpressionProp("items", "items"),
      ];
      const paletteProps = props.map((prop) => `    ${prop}`).join("\n");
      return interactiveUsage({
        components: ["Button", "CommandPalette"],
        preamble: ["", `const items = ${items};`],
        state: [`const [paletteOpen, setPaletteOpen] = useState(${s.open});`],
        jsx: `(
  <>
    <Button onClick={() => setPaletteOpen(true)}>Open command palette</Button>
    <CommandPalette
${paletteProps}
      onClose={() => setPaletteOpen(false)}
      onSelect={(item) => console.log(item.label)}
    />
  </>
)`,
      });
    }
    case "modal": {
      const s = settings as ControlSettingsBySlug["modal"];
      const props = [
        formatExpressionProp("open", "modalOpen"),
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        formatStringProp("size", s.size),
        ...(s.dismissOnBackdrop ? [] : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape ? [] : [formatBoolProp("dismissOnEscape", false)]),
        ...(s.closeButton ? [] : [formatBoolProp("closeButton", false)]),
      ];
      const modalProps = props.map((prop) => `    ${prop}`).join("\n");
      const children =
        s.contentType === "form"
          ? `    <TextField
      id="workspace-name"
      label="Workspace name"
      mode="stacked"
      labelPosition="left"
      type="text"
      value={workspaceName}
      onChange={(event) => setWorkspaceName(event.target.value)}
    />
    <SelectField
      id="workspace-plan"
      label="Plan"
      mode="stacked"
      labelPosition="left"
      options={["Starter", "Team", "Enterprise"]}
      value={plan}
      onChange={(event) => setPlan(event.target.value)}
    />`
          : formatJsxRichContent(s.content, "    ");
      const imports =
        s.contentType === "form"
          ? ["Button", "Modal", "ModalDefaultActions", "SelectField", "TextField"]
          : ["Button", "Modal", "ModalDefaultActions"];
      const state =
        s.contentType === "form"
          ? [
              `const [modalOpen, setModalOpen] = useState(${s.open});`,
              `const [workspaceName, setWorkspaceName] = useState("Opus Design System");`,
              `const [plan, setPlan] = useState("Team");`,
            ]
          : [`const [modalOpen, setModalOpen] = useState(${s.open});`];
      return interactiveUsage({
        components: imports,
        state,
        jsx: `(
  <>
    <Button onClick={() => setModalOpen(true)}>Open modal</Button>
    <Modal
${modalProps}
      footer={${s.footerActions ? quote("Changes are only saved when you confirm.") : "undefined"}}
      actions={${s.footerActions ? "<ModalDefaultActions onClose={() => setModalOpen(false)} />" : "undefined"}}
      onClose={() => setModalOpen(false)}
    >
${children}
    </Modal>
  </>
)`,
      });
    }
    case "popover": {
      const s = settings as ControlSettingsBySlug["popover"];
      const props = [
        formatExpressionProp("open", "popoverOpen"),
        formatStringProp("title", s.title),
        formatStringProp("placement", s.placement),
        ...(s.closeOnOutside ? [] : [formatBoolProp("closeOnOutside", false)]),
        ...(s.closeOnEscape ? [] : [formatBoolProp("closeOnEscape", false)]),
        ...(s.showArrow ? [] : [formatBoolProp("showArrow", false)]),
        formatExpressionProp("onOpenChange", "setPopoverOpen"),
        formatExpressionProp("trigger", '<Button variant="primary">Open popover</Button>'),
      ];
      const popoverProps = props.map((prop) => `    ${prop}`).join("\n");
      const children =
        s.contentType === "form"
          ? `    <TextField
      id="popover-note"
      label="Note"
      mode="stacked"
      labelPosition="left"
      type="text"
      value={note}
      onChange={(event) => setNote(event.target.value)}
    />
    <SelectField
      id="popover-priority"
      label="Priority"
      mode="stacked"
      labelPosition="left"
      options={["Low", "Medium", "High"]}
      value={priority}
      onChange={(event) => setPriority(event.target.value)}
    />`
          : formatJsxRichContent(s.content, "    ");
      const imports =
        s.contentType === "form"
          ? ["Button", "Popover", "SelectField", "TextField"]
          : ["Button", "Popover"];
      const state =
        s.contentType === "form"
          ? [
              `const [popoverOpen, setPopoverOpen] = useState(${s.open});`,
              `const [note, setNote] = useState("Follow up next week");`,
              `const [priority, setPriority] = useState("Medium");`,
            ]
          : [`const [popoverOpen, setPopoverOpen] = useState(${s.open});`];
      return interactiveUsage({
        components: imports,
        state,
        jsx: `<Popover
${popoverProps}
>
${children}
</Popover>`,
      });
    }
    case "alert": {
      const s = settings as ControlSettingsBySlug["alert"];
      const props = [
        formatStringProp("status", s.status),
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        ...(s.iconFlagged ? [] : [formatBoolProp("iconFlagged", false)]),
        ...(s.dismissible ? [formatBoolProp("dismissible", true), formatExpressionProp("onDismiss", "() => setAlertVisible(false)")] : []),
      ];
      return `${importLine(["Alert"])}\n\n<Alert${formatSelfClosing(props)}`;
    }
    case "toast": {
      const s = settings as ControlSettingsBySlug["toast"];
      const showProps = [
        formatStringProp("status", s.status),
        formatStringProp("title", s.title),
        ...(s.descriptionEnabled ? [formatStringProp("description", s.description)] : []),
        ...(s.dismissible ? [] : [formatBoolProp("dismissible", false)]),
      ];
      return interactiveUsage({
        components: ["ToastProvider", "useToast"],
        preamble: [
          "",
          "// In your app layout:",
          `// <ToastProvider vertical="${s.positionVertical}" horizontal="${s.positionHorizontal}">`,
          "//   {children}",
          "// </ToastProvider>",
        ],
        state: ["const toast = useToast();"],
        jsx: `<button
  type="button"
  onClick={() =>
    toast.show({${showProps.length === 1 ? ` ${showProps[0]}` : `\n      ${showProps.join(",\n      ")},\n    `}})
  }
>
  Show toast
</button>`,
      });
    }
    case "card": {
      const s = settings as ControlSettingsBySlug["card"];
      const props = [
        formatStringProp("title", s.title),
        ...(s.eyebrow ? [formatStringProp("eyebrow", s.eyebrow)] : []),
        ...(s.tone !== "default" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.media ? [formatExpressionProp("media", "<div />")] : []),
        ...(s.footerActions ? [formatStringProp("footer", "Updated 2 minutes ago")] : []),
        ...(s.footerActions ? [formatExpressionProp("actions", "<Button variant=\"primary\">Open</Button>")] : []),
      ];
      return `${importLine(s.footerActions ? ["Button", "Card"] : ["Card"])}

<Card${formatOpeningProps(props)}>
${formatJsxRichContent(s.content)}
</Card>`;
    }
    case "kpi-card":
    case "stat-card": {
      const s = settings as ControlSettingsBySlug["stat-card"];
      const iconOption = getFontAwesomeIconOption(s.icon);
      const props = [
        formatStringProp("label", s.label),
        formatStringProp("value", s.value),
        formatExpressionProp("icon", `<FontAwesomeIcon icon={${iconOption.importName}} />`),
        ...(s.showChange ? [formatStringProp("change", s.change), formatStringProp("trend", s.trend)] : []),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
      ];

      return `import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ${iconOption.importName} } from "@fortawesome/free-solid-svg-icons";
import "@/lib/fontawesome";
${importLine(["StatCard"])}

return <StatCard${formatSelfClosing(props)};`;
    }
    case "sparkline": {
      const s = settings as ControlSettingsBySlug["sparkline"];
      return `${importLine(["Sparkline"])}

const values = [18, 24, 21, 34, 29, 42, 38];

return <Sparkline label=${quote(s.label)} palette=${quote(s.palette)} values={values} variant="labeled" />;`;
    }
    case "progress-ring": {
      const s = settings as ControlSettingsBySlug["progress-ring"];
      return `${importLine(["ProgressRing"])}

<ProgressRing label=${quote(s.label)} max={${s.max}} value={${s.value}} />`;
    }
    case "progress-bar": {
      const s = settings as ControlSettingsBySlug["progress-bar"];
      return `${importLine(["ProgressBar"])}

<ProgressBar label=${quote(s.label)} max={${s.max}} value={${s.value}} />`;
    }
    case "gauge":
    {
      const s = settings as ControlSettingsBySlug["gauge"];
      const gaugeFooter = getGaugeFooter(s.palette);
      const footerItems = gaugeFooter.slice(0, s.footerMetricCount);
      const trackColor = getGaugeTrackColor(s.trackTone, s.palette);
      const valueColor = getGaugeValueColor(s.valueTone, s.palette);
      const props = [
        formatStringProp("title", s.title),
        formatStringProp("subtitle", s.subtitle),
        formatExpressionProp("value", String(gaugePreviewValue)),
        formatStringProp("trackColor", trackColor),
        formatStringProp("valueColor", valueColor),
        ...(s.variant !== "half" ? [formatStringProp("variant", s.variant)] : []),
        formatStringProp("change", s.change),
        formatStringProp("changeTrend", s.changeTrend),
        formatStringProp("summary", s.summary),
        ...(s.footerMetricCount > 0 ? [formatExpressionProp("footer", "footerMetrics")] : []),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
      ];

      if (s.footerMetricCount === 0) {
        const footerLines = gaugeFooter
          .map(
            (item) =>
              `//   { color: ${quote(item.color ?? "")}, label: ${quote(item.label)}, value: ${quote(item.value)}, trend: ${quote(item.trend ?? "up")} }`,
          )
          .join(",\n");

        return `${importLine(["Gauge"])}

<Gauge${formatSelfClosing(props)} />

// Optional footer metrics — pass any number of items, or omit entirely:
// footer={[
${footerLines},
// ]}`;
      }

      const footerBlock = footerItems
        .map(
          (item) =>
            `  { color: ${quote(item.color ?? "")}, label: ${quote(item.label)}, value: ${quote(item.value)}, trend: ${quote(item.trend ?? "up")} }`,
        )
        .join(",\n");

      return `${importLine(["Gauge"])}

const footerMetrics = [
${footerBlock},
];

<Gauge${formatSelfClosing(props)} />`;
    }
    case "speedometer": {
      const s = settings as ControlSettingsBySlug["speedometer"];
      return `${importLine(["Speedometer"])}

<Speedometer label=${quote(s.label)} max={${s.max}} value={${s.value}} />`;
    }
    case "metric-tile": {
      const s = settings as ControlSettingsBySlug["metric-tile"];
      const iconOption = getFontAwesomeIconOption(s.icon);
      return `import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ${iconOption.importName} } from "@fortawesome/free-solid-svg-icons";
import "@/lib/fontawesome";
${importLine(["MetricTile"])}

return <MetricTile icon={<FontAwesomeIcon icon={${iconOption.importName}} />} label=${quote(s.label)} value=${quote(s.value)}${s.showSparkline ? " sparkline={[12, 18, 16, 24, 22, 30, 28]}" : ""} />;`;
    }
    case "status-indicator": {
      const s = settings as ControlSettingsBySlug["status-indicator"];
      return `${importLine(["StatusIndicator"])}

<StatusIndicator label=${quote(s.label)} status=${quote(s.status)} />`;
    }
    case "trend-badge": {
      const s = settings as ControlSettingsBySlug["trend-badge"];
      return `${importLine(["TrendBadge"])}

<TrendBadge direction=${quote(s.direction)} value=${quote(s.value)} />`;
    }
    case "panel": {
      const s = settings as ControlSettingsBySlug["panel"];
      const props = [
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        ...(s.tone !== "default" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.divided ? [] : [formatBoolProp("divided", false)]),
        formatStringProp("footer", s.footer),
      ];
      return `${importLine(["Panel"])}

<Panel${formatOpeningProps(props)}>
${formatJsxRichContent(s.content)}
</Panel>`;
    }
    case "section": {
      const s = settings as ControlSettingsBySlug["section"];
      const config = getSectionLayoutConfigFromSettings(s);
      const slots = getSectionDemoSlots(s);
      const sidebarSlot = slots.find((slot) => slot.role === "sidebar");
      const contentSlots = slots.filter((slot) => slot.role === "content");
      const sectionProps = [
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        ...(s.gap !== "md" ? [formatStringProp("gap", s.gap)] : []),
      ];
      const rowProps = [
        ...(s.sidebar !== "none" ? [formatStringProp("sidebar", s.sidebar)] : []),
        ...(s.columns !== 1 ? [formatNumberProp("columns", s.columns)] : []),
        ...(s.gap !== "md" ? [formatStringProp("gap", s.gap)] : []),
        ...(s.stackBelow !== "mobile" ? [formatStringProp("stackBelow", s.stackBelow)] : []),
        ...(s.sidebar !== "none" && s.sidebarRatio !== "1:2"
          ? [formatStringProp("sidebarRatio", s.sidebarRatio)]
          : []),
      ];

      const formatPanel = (title: string, content: string, indent: string) =>
        `${indent}<Panel title="${title.replace(/"/g, '\\"')}">\n${formatJsxRichContent(content, `${indent}  `)}\n${indent}</Panel>`;

      if (usesNestedContentRow(config) && sidebarSlot) {
        const contentMarkup = contentSlots
          .map(
            (column) => `        <Section.Column>
          ${formatPanel(column.title, column.content, "          ")}
        </Section.Column>`,
          )
          .join("\n");
        const nestedRowProps = [
          `columns={${s.columns}}`,
          ...(s.gap !== "md" ? [`gap="${s.gap}"`] : []),
          ...(s.stackBelow !== "mobile" ? [`stackBelow="${s.stackBelow}"`] : []),
        ];
        const nestedRow = `      <Section.Row ${nestedRowProps.join(" ")}>
${contentMarkup}
      </Section.Row>`;

        const outerColumns =
          s.sidebar === "left"
            ? `      <Section.Column>
        ${formatPanel(sidebarSlot.title, sidebarSlot.content, "        ")}
      </Section.Column>
      <Section.Column>
${nestedRow}
      </Section.Column>`
            : `      <Section.Column>
${nestedRow}
      </Section.Column>
      <Section.Column>
        ${formatPanel(sidebarSlot.title, sidebarSlot.content, "        ")}
      </Section.Column>`;

        return `${importLine(["Panel", "Section"])}

<Section${formatOpeningProps(sectionProps)}>
  <Section.Row${formatOpeningProps(rowProps)}>
${outerColumns}
  </Section.Row>
</Section>`;
      }

      const columnMarkup = slots
        .map(
          (column) => `    <Section.Column>
      ${formatPanel(column.title, column.content, "      ")}
    </Section.Column>`,
        )
        .join("\n");

      return `${importLine(["Panel", "Section"])}

<Section${formatOpeningProps(sectionProps)}>
  <Section.Row${formatOpeningProps(rowProps)}>
${columnMarkup}
  </Section.Row>
</Section>`;
    }
    case "table": {
      const s = settings as ControlSettingsBySlug["table"];
      const columns = s.numericColumn
        ? `[
  { key: "team", label: "Team" },
  { key: "status", label: "Status" },
  { key: "components", label: "Components", align: "right" },
]`
        : `[
  { key: "team", label: "Team" },
  { key: "status", label: "Status" },
  { key: "components", label: "Components" },
]`;
      const rows = s.showEmpty
        ? "[]"
        : `[
  { id: "design", values: { team: "Design Systems", status: "Healthy", components: 42 } },
  { id: "web", values: { team: "Web Platform", status: "Adopting", components: 28 } },
  { id: "mobile", values: { team: "Mobile", status: "Reviewing", components: 16 } },
]`;
      const props = [
        formatExpressionProp("columns", "columns"),
        formatExpressionProp("rows", "rows"),
        formatStringProp("caption", s.caption),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.striped ? [formatBoolProp("striped", true)] : []),
        ...(s.bordered ? [formatBoolProp("bordered", true)] : []),
        ...(s.showCaption ? [] : [formatBoolProp("showCaption", false)]),
        ...(s.showEmpty ? [formatStringProp("emptyMessage", "No component adoption data available.")] : []),
      ];
      return `${importLine(["Table"])}

const columns = ${columns};

const rows = ${rows};

<Table${formatSelfClosing(props)}`;
    }
    case "data-grid": {
      const s = settings as ControlSettingsBySlug["data-grid"];
      const gridDefaults = {
        filterable: s.filterable,
        resizable: s.resizable,
        sortable: s.sortable,
      };
      const columns = buildDataGridColumns({
        gridDefaults,
        numericColumns: s.numericColumns,
        q1Q2Resizable: s.q1Q2Resizable,
        q1Q2SortFilter: s.q1Q2SortFilter,
        teamResizable: s.rowHeaderResizable,
      });
      const props = [
        formatExpressionProp("columns", "columns"),
        formatExpressionProp("rows", "rows"),
        formatStringProp("caption", s.caption),
        ...(s.density !== "compact" ? [formatStringProp("density", s.density)] : []),
        ...(s.striped ? [] : [formatBoolProp("striped", false)]),
        ...(s.bordered ? [] : [formatBoolProp("bordered", false)]),
        ...(s.stickyHeader ? [] : [formatBoolProp("stickyHeader", false)]),
        ...(s.stickyFirstColumn ? [] : [formatBoolProp("stickyFirstColumn", false)]),
      ];
      return `${importLine(["DataGrid"])}

const columns = ${formatDataGridColumnsForUsage(columns)};

const rows = ${formatDataGridRowsForUsage(dataGridRows)};

<DataGrid${formatSelfClosing(props)}`;
    }
    case "skeleton": {
      const s = settings as ControlSettingsBySlug["skeleton"];
      const props = [
        ...(s.variant !== "text" ? [formatStringProp("variant", s.variant)] : []),
        ...(s.animation !== "shimmer" ? [formatStringProp("animation", s.animation)] : []),
        ...(s.lines !== 3 ? [formatNumberProp("lines", s.lines)] : []),
      ];
      return `${importLine(["Skeleton"])}

<Skeleton${formatSelfClosing(props)}`;
    }
    case "carousel": {
      const s = settings as ControlSettingsBySlug["carousel"];
      const props = [
        formatExpressionProp("images", "images"),
        ...(s.initialIndex !== 0 ? [formatNumberProp("initialIndex", s.initialIndex)] : []),
        ...(s.loop ? [] : [formatBoolProp("loop", false)]),
        ...(s.showCaptions ? [] : [formatBoolProp("showCaptions", false)]),
        ...(s.showPips ? [] : [formatBoolProp("showPips", false)]),
      ];
      return `${importLine(["Carousel"])}

const images = [
  { id: "image-1", src: "/image-1.jpg", alt: "Two people standing in a neon sci-fi corridor.", caption: "Two people standing in a neon sci-fi corridor." },
  { id: "image-2", src: "/image-2.jpg", alt: "A person in a black jacket sitting beside neon cyberpunk panels.", caption: "A person in a black jacket sitting beside neon cyberpunk panels." },
  { id: "image-3", src: "/image-3.jpg", alt: "A black and white futuristic corridor with bright light strips.", caption: "A black and white futuristic corridor with bright light strips." },
  { id: "image-4", src: "/image-4.jpg", alt: "Abstract red and white futuristic city geometry.", caption: "Abstract red and white futuristic city geometry." },
];

<Carousel${formatSelfClosing(props)}`;
    }
    case "lightbox": {
      const s = settings as ControlSettingsBySlug["lightbox"];
      const props = [
        formatExpressionProp("image", "image"),
        formatStringProp("triggerLabel", s.triggerLabel),
        ...(s.showCaptions ? [] : [formatBoolProp("showCaption", false)]),
        ...(s.dismissOnBackdrop ? [] : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape ? [] : [formatBoolProp("dismissOnEscape", false)]),
      ];
      return `${importLine(["Lightbox"])}

const image = {
  id: "image-1",
  src: "/image-1.jpg",
  alt: "Two people standing in a neon sci-fi corridor.",
  caption: "Two people standing in a neon sci-fi corridor.",
};

<Lightbox${formatSelfClosing(props)}`;
    }
    case "image-thumbnail": {
      const s = settings as ControlSettingsBySlug["image-thumbnail"];
      const props = [
        formatExpressionProp("image", "image"),
        ...(s.size !== "medium" ? [formatStringProp("size", s.size)] : []),
        ...(s.showCaption ? [] : [formatBoolProp("showCaption", false)]),
        ...(s.openInLightbox ? [] : [formatBoolProp("openInLightbox", false)]),
      ];
      return `${importLine(["ImageThumbnail"])}

const image = {
  id: "image-1",
  src: "/image-1.jpg",
  alt: "Two people standing in a neon sci-fi corridor.",
  caption: "Two people standing in a neon sci-fi corridor.",
};

<ImageThumbnail${formatSelfClosing(props)}`;
    }
    case "image-gallery": {
      const s = settings as ControlSettingsBySlug["image-gallery"];
      const props = [
        formatExpressionProp("images", "images"),
        ...(s.columns !== 4 ? [formatNumberProp("columns", s.columns)] : []),
        ...(s.thumbnailSize !== "small" ? [formatStringProp("thumbnailSize", s.thumbnailSize)] : []),
        ...(s.showCaptions ? [] : [formatBoolProp("showCaptions", false)]),
      ];
      return `${importLine(["ImageGallery"])}

const images = [
  { id: "image-1", src: "/image-1.jpg", alt: "Two people standing in a neon sci-fi corridor.", caption: "Two people standing in a neon sci-fi corridor." },
  { id: "image-2", src: "/image-2.jpg", alt: "A person in a black jacket sitting beside neon cyberpunk panels.", caption: "A person in a black jacket sitting beside neon cyberpunk panels." },
  { id: "image-3", src: "/image-3.jpg", alt: "A black and white futuristic corridor with bright light strips.", caption: "A black and white futuristic corridor with bright light strips." },
  { id: "image-4", src: "/image-4.jpg", alt: "Abstract red and white futuristic city geometry.", caption: "Abstract red and white futuristic city geometry." },
];

<ImageGallery${formatSelfClosing(props)}`;
    }
    case "model-viewer": {
      const s = settings as ControlSettingsBySlug["model-viewer"];
      const props = [
        formatExpressionProp("asset", "asset"),
        ...(s.autoRotate ? [] : [formatBoolProp("autoRotate", false)]),
        ...(s.cameraControls ? [] : [formatBoolProp("cameraControls", false)]),
        ...(s.showCaption ? [] : [formatBoolProp("showCaption", false)]),
      ];
      return `${importLine(["ModelViewer"])}

const asset = {
  id: "control-panel",
  name: "Control panel",
  src: "/models/vx27/control-panel.glb",
  alt: "VX-27 sci-fi control panel 3D asset.",
  description: "Interactive terminal hardware from the VX-27 environment set.",
};

<ModelViewer${formatSelfClosing(props)}`;
    }
    case "model-lightbox": {
      const s = settings as ControlSettingsBySlug["model-lightbox"];
      const props = [
        formatExpressionProp("asset", "asset"),
        formatStringProp("triggerLabel", s.triggerLabel),
        ...(s.showCaption ? [] : [formatBoolProp("showCaption", false)]),
        ...(s.dismissOnBackdrop ? [] : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape ? [] : [formatBoolProp("dismissOnEscape", false)]),
      ];
      return `${importLine(["ModelLightbox"])}

const asset = {
  id: "control-panel",
  name: "Control panel",
  src: "/models/vx27/control-panel.glb",
  alt: "VX-27 sci-fi control panel 3D asset.",
  description: "Interactive terminal hardware from the VX-27 environment set.",
};

<ModelLightbox${formatSelfClosing(props)}`;
    }
    case "model-thumbnail": {
      const s = settings as ControlSettingsBySlug["model-thumbnail"];
      const props = [
        formatExpressionProp("asset", "asset"),
        ...(s.size !== "medium" ? [formatStringProp("size", s.size)] : []),
        ...(s.showCaption ? [] : [formatBoolProp("showCaption", false)]),
        ...(s.openInLightbox ? [] : [formatBoolProp("openInLightbox", false)]),
      ];
      return `${importLine(["ModelThumbnail"])}

const asset = {
  id: "control-panel",
  name: "Control panel",
  src: "/models/vx27/control-panel.glb",
  alt: "VX-27 sci-fi control panel 3D asset.",
  description: "Interactive terminal hardware from the VX-27 environment set.",
};

<ModelThumbnail${formatSelfClosing(props)}`;
    }
    case "model-gallery": {
      const s = settings as ControlSettingsBySlug["model-gallery"];
      const props = [
        formatExpressionProp("assets", "assets"),
        ...(s.columns !== 4 ? [formatNumberProp("columns", s.columns)] : []),
        ...(s.thumbnailSize !== "small" ? [formatStringProp("thumbnailSize", s.thumbnailSize)] : []),
        ...(s.showCaptions ? [] : [formatBoolProp("showCaptions", false)]),
      ];
      return `${importLine(["ModelGallery"])}

const assets = ${formatModelAssetsForUsage()};

<ModelGallery${formatSelfClosing(props)}`;
    }
    case "tabs": {
      const s = settings as ControlSettingsBySlug["tabs"];
      const props = [
        formatExpressionProp("items", "items"),
        formatExpressionProp("value", "activeTab"),
        ...(s.orientation !== "horizontal" ? [formatStringProp("orientation", s.orientation)] : []),
        ...(s.variant !== "line" ? [formatStringProp("variant", s.variant)] : []),
        ...(s.fitted ? [formatBoolProp("fitted", true)] : []),
        formatExpressionProp("onValueChange", "setActiveTab"),
      ];
      return interactiveUsage({
        components: ["SelectField", "SwitchField", "Tabs", "TextField"],
        preamble: [
          "",
          "const items = [",
          `  {
    value: "overview",
    label: "Overview",
    content: <p>Review the main project status and current design-system health.</p>,
  },
  {
    value: "insights",
    label: "Insights",
    disabled: ${s.disabledSecond},
    content: <p>Track component usage, accessibility checks, and adoption.</p>,
  },
  {
    value: "settings",
    label: "Settings",
    content: <p>Configure release notes, ownership, and publishing preferences.</p>,
  },
  {
    value: "form",
    label: "Form",
    content: (
      <div>
        <TextField
          id="project-name"
          label="Project name"
          mode="stacked"
          labelPosition="left"
          type="text"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />
        <SelectField
          id="release-track"
          label="Release track"
          mode="stacked"
          labelPosition="left"
          options={["Stable", "Beta", "Experimental"]}
          value={releaseTrack}
          onChange={(event) => setReleaseTrack(event.target.value)}
        />
        <SwitchField
          id="notify-team"
          label="Notify team on publish"
          mode="flagged"
          labelPosition="right"
          checked={notifyTeam}
          onChange={(event) => setNotifyTeam(event.target.checked)}
        />
      </div>
    ),
  },
];`,
        ],
        state: [
          `const [activeTab, setActiveTab] = useState(${quote(s.activeValue)});`,
          `const [projectName, setProjectName] = useState("Opus");`,
          `const [releaseTrack, setReleaseTrack] = useState("Stable");`,
          `const [notifyTeam, setNotifyTeam] = useState(true);`,
        ],
        jsx: `<Tabs${formatSelfClosing(props)}`,
      });
    }
    case "accordion": {
      const s = settings as ControlSettingsBySlug["accordion"];
      const props = [
        formatStringProp("title", s.title),
        ...(s.defaultOpen ? [formatBoolProp("defaultOpen", true)] : []),
        ...(s.disabled ? [formatBoolProp("disabled", true)] : []),
      ];
      return `${importLine(["Accordion"])}

<Accordion${formatOpeningProps(props)}>
${formatJsxRichContent(s.content)}
</Accordion>`;
    }
    case "accordion-group": {
      const s = settings as ControlSettingsBySlug["accordion-group"];
      const groupProps = [
        ...(s.type !== "single" ? [formatStringProp("type", s.type)] : []),
        ...(s.collapsible ? [] : [formatBoolProp("collapsible", false)]),
        ...(s.defaultOpenFirst ? [formatStringProp("defaultValue", "getting-started")] : []),
      ];
      return `${importLine(["Accordion", "AccordionGroup"])}

<AccordionGroup${formatOpeningProps(groupProps)}>
  <Accordion title=${quote(s.itemOneTitle)} value="getting-started">
${formatJsxRichContent(s.itemOneContent, "    ")}
  </Accordion>
  <Accordion title=${quote(s.itemTwoTitle)} value="billing">
${formatJsxRichContent(s.itemTwoContent, "    ")}
  </Accordion>
  <Accordion title=${quote(s.itemThreeTitle)} value="support">
${formatJsxRichContent(s.itemThreeContent, "    ")}
  </Accordion>
</AccordionGroup>`;
    }
    case "show-more": {
      const s = settings as ControlSettingsBySlug["show-more"];
      const props = [
        ...(s.maxLines !== 3 ? [formatNumberProp("maxLines", s.maxLines)] : []),
        ...(s.showMoreLabel !== "Show more" ? [formatStringProp("showMoreLabel", s.showMoreLabel)] : []),
        ...(s.showLessLabel !== "Show less" ? [formatStringProp("showLessLabel", s.showLessLabel)] : []),
        ...(s.defaultExpanded ? [formatBoolProp("defaultExpanded", true)] : []),
      ];
      return `${importLine(["ShowMore"])}

<ShowMore${formatOpeningProps(props)}>
${formatJsxRichContent(s.content)}
</ShowMore>`;
    }
    case "empty-state": {
      const s = settings as ControlSettingsBySlug["empty-state"];
      const actionParts: string[] = [];
      if (s.secondaryAction) {
        actionParts.push(`<Button variant="secondary">${s.secondaryActionLabel}</Button>`);
      }
      if (s.primaryAction) {
        actionParts.push(`<Button variant="primary">${s.primaryActionLabel}</Button>`);
      }
      const props = [
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.showIcon ? [] : [formatExpressionProp("icon", "false")]),
        ...(s.showIcon ? [formatStringProp("icon", s.icon)] : []),
        ...(actionParts.length ? [formatExpressionProp("actions", `<>\n    ${actionParts.join("\n    ")}\n  </>`)] : []),
      ];
      const imports = actionParts.length ? ["Button", "EmptyState"] : ["EmptyState"];
      return `${importLine(imports)}

<EmptyState${formatSelfClosing(props)}`;
    }
    case "sidebar": {
      const s = settings as ControlSettingsBySlug["sidebar"];
      const sidebarProps = [
        ...(s.side !== "left" ? [formatStringProp("side", s.side)] : []),
        ...(s.collapsed ? [formatBoolProp("collapsed", true)] : []),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.showHeader ? [formatExpressionProp("header", `<SidebarHeader title=${quote(s.headerTitle)} />`)] : []),
        ...(s.showFooter ? [formatStringProp("footer", s.footerText)] : []),
      ];
      return `${importLine([
        "Sidebar",
        "SidebarGroup",
        "SidebarHeader",
        "SidebarLayout",
        "SidebarLink",
        "SidebarNav",
      ])}

<SidebarLayout main="Main content area"${s.side !== "left" ? ` side=${quote(s.side)}` : ""}>
  <Sidebar${formatOpeningProps(sidebarProps)}>
    <SidebarNav aria-label="Primary">
      <SidebarLink${s.activeItem === "overview" ? ' active' : ""}>Overview</SidebarLink>
      <SidebarGroup label="Library"${s.groupOpen ? "" : " defaultOpen={false}"}>
        <SidebarLink${s.activeItem === "library" ? ' active' : ""}>Components</SidebarLink>
        <SidebarLink>Templates</SidebarLink>
        <SidebarLink>Tokens</SidebarLink>
      </SidebarGroup>
      <SidebarLink${s.activeItem === "settings" ? ' active' : ""}>Settings</SidebarLink>
    </SidebarNav>
  </Sidebar>
</SidebarLayout>`;
    }
    case "mega-menu": {
      const s = settings as ControlSettingsBySlug["mega-menu"];
      const previewMenu = buildMegaMenuPreviewConfig(s);
      const props = [
        formatExpressionProp("menus", "menus"),
        formatBoolProp("staticPanel", true),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.closeOnOutside ? [] : [formatBoolProp("closeOnOutside", false)]),
        ...(s.closeOnEscape ? [] : [formatBoolProp("closeOnEscape", false)]),
      ];

      return `${importLine(["MegaMenu"])}

const menus = [
${formatMegaMenuMenusForUsage([previewMenu], { includeFeatured: s.featured })},
];

<MegaMenu${formatSelfClosing(props)}`;
    }
    case "top-navigation": {
      const s = settings as ControlSettingsBySlug["top-navigation"];
      const props = [
        formatExpressionProp("menus", "menus"),
        formatExpressionProp("activeMenu", "activeMenu"),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.closeOnOutside ? [] : [formatBoolProp("closeOnOutside", false)]),
        ...(s.closeOnEscape ? [] : [formatBoolProp("closeOnEscape", false)]),
        ...(s.closeOnSelect ? [] : [formatBoolProp("closeOnSelect", false)]),
        ...(s.showShortcuts ? [] : [formatBoolProp("showShortcuts", false)]),
        formatExpressionProp("onActiveMenuChange", "setActiveMenu"),
        formatExpressionProp("onSelect", "handleSelect"),
      ];
      const navProps = props.map((prop) => `      ${prop}`).join("\n");
      const menusBlock = formatTopNavigationMenusForUsage(topNavigationDemoMenus, {
        showShortcuts: s.showShortcuts,
      });

      return interactiveUsage({
        components: ["TopNavigation"],
        preamble: [
          "",
          "const menus = [",
          `${menusBlock},`,
          "];",
        ],
        state: [
          `const [activeMenu, setActiveMenu] = useState<string | null>(${s.activeMenu === "none" ? "null" : quote(s.activeMenu)});`,
          `const [lastAction, setLastAction] = useState("Waiting for action");`,
          "",
          "const handleSelect = (menuId: string, item: { id: string; label: string }) => {",
          "  setLastAction(`${menuId}: ${item.label}`);",
          "};",
        ],
        jsx: `(
  <>
    <TopNavigation
${navProps}
    />
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    default:
      return "";
  }
}

export function generateUsageCode(slug: ControlSlug, settings: ControlSettings) {
  return splitUsageCode(generateUsageCodeContent(slug, settings));
}
