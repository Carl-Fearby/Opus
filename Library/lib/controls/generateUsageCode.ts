import type { ComponentCategory, ControlSettings, ControlSettingsBySlug, ControlSlug } from "./types";
import {
  getSectionDemoSlots,
  getSectionLayoutConfigFromSettings,
  usesNestedContentRow,
} from "@/lib/layout/sectionLayout";
import {
  buildDataGridColumns,
  dataGridPivotConfig,
  dataGridRows,
  dataGridTreeRows,
  formatDataGridColumnsForUsage,
  formatDataGridRowsForUsage,
} from "./dataGridDemoData";
import {
  chartDemoSeries,
  chartUsesSeries,
  formatChartDataForUsage,
  formatChartSeriesForUsage,
  getChartPreviewData,
  getChartUsageDataMode,
} from "./chartDemoData";
import { worldMapRegionIds } from "opus-react";
import { isChartSlug } from "./chartCatalog";
import { formatPipelineStagesForUsage, formatPipelineTotalValue } from "./pipelineDemoData";
import { getDealsOverTimeDemoData } from "./dealsOverTimeDemoData";
import { demoRecentActivity } from "./recentActivityDemoData";
import { demoNotesActivity } from "./notesActivityDemoData";
import { demoTopPerformingUsers } from "./topPerformingUsersDemoData";
import {
  formatUserProfilePhotoUploadModalUsage,
  formatUserProfileUsageAfterState,
  parseUserProfileMenuItems,
} from "./userProfileDemoData";
import {
  formatAvatarGroupItemsForUsage,
  formatBottomNavItemsForUsage,
  formatBreadcrumbItemsForUsage,
  formatCalendarEventsForUsage,
  formatCascaderOptionsForUsage,
  formatContentTimelineGroupsForUsage,
  formatContentTimelineItemsForUsage,
  formatDescriptionListItemsForUsage,
  formatDockLayoutProps,
  formatDualListAvailableForUsage,
  formatDualListSelectedForUsage,
  formatFilterConditionsForUsage,
  formatFilterSelectGroupsForUsage,
  formatInspectorFieldsForUsage,
  formatJsonValueForUsage,
  formatKanbanCardsForUsage,
  formatKanbanColumnsForUsage,
  formatLayoutTileChildren,
  formatListItemsForUsage,
  formatMasonryItemsForUsage,
  formatMultiSelectOptionsForUsage,
  formatObjectLiteral,
  formatPermissionsForUsage,
  formatPermissionsResourcesForUsage,
  formatPermissionsRolesForUsage,
  formatPropertyInspectorItemsForUsage,
  formatPropertyItemsForUsage,
  formatQueryGroupForUsage,
  formatRailItemsForUsage,
  formatResourcePlannerItemsForUsage,
  formatResourcePlannerResourcesForUsage,
  formatRulesForUsage,
  formatSchedulerEventsForUsage,
  formatScrollAreaContent,
  formatSegmentedControlOptionsForUsage,
  formatSplitActionsForUsage,
  formatStatTilesForUsage,
  formatTilesForUsage,
  formatTransferListAvailableForUsage,
  formatTreeSelectNodesForUsage,
  formatTreeViewNodesForUsage,
} from "./usageDemoFormatters";
import { demoUpcomingTasks } from "./upcomingTasksDemoData";
import { formatModelAssetsForUsage } from "@/lib/models/vx27Assets";
import { formatIconBadgeToolbarUsage } from "./iconBadgeDemoData";
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
import {
  formatTopNavigationMenusForUsage,
  topNavigationDemoMenus,
} from "./topNavigationDemo";
import { formatFullUsageComponent, splitUsageCode } from "./usageCode";
import { generateAppSetupPlaygroundCode } from "./appSetupBoilerplate";
import { generate403PlaygroundCode, generate404PlaygroundCode } from "./errorPageBoilerplate";

const radioOptions = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
  { label: "Enterprise", value: "enterprise" },
];

type FieldUsageSettings = {
  error?: string;
  errorEnabled?: boolean;
  help?: string;
  helpEnabled?: boolean;
  label: string;
  labelPosition: string;
  mode: string;
  required?: boolean;
  size?: string;
};

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

function formatSelfClosingElement(tagName: string, props: string[], indent = ""): string {
  if (!props.length) {
    return `${indent}<${tagName} />`;
  }

  if (props.length === 1) {
    return `${indent}<${tagName} ${props[0]} />`;
  }

  return `${indent}<${tagName}\n${props.map((prop) => `${indent}  ${prop}`).join("\n")}\n${indent}/>`;
}

function formatOpeningElement(tagName: string, props: string[], indent = ""): string {
  if (!props.length) {
    return `${indent}<${tagName}>`;
  }

  if (props.length === 1) {
    return `${indent}<${tagName} ${props[0]}>`;
  }

  return `${indent}<${tagName}\n${props.map((prop) => `${indent}  ${prop}`).join("\n")}\n${indent}>`;
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

function escapeJsxText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/{/g, "&#123;")
    .replace(/}/g, "&#125;");
}

function formatJsxParagraphContent(content: string, indent = "  "): string {
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
        return `${indent}<p>${escapeJsxText(paragraph)}</p>`;
      }

      const body = lines
        .map((line, index) => {
          const lineText = escapeJsxText(line);
          return index === 0 ? lineText : `\n${indent}  <br />\n${indent}  ${lineText}`;
        })
        .join("");

      return `${indent}<p>\n${indent}  ${body}\n${indent}</p>`;
    })
    .join("\n");
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

function fieldProps(settings: FieldUsageSettings) {
  const props = [
    formatStringProp("label", settings.label),
    formatStringProp("mode", settings.mode),
    formatStringProp("labelPosition", settings.labelPosition),
  ];

  if (settings.required) {
    props.push(formatBoolProp("required", true));
  }

  if (settings.errorEnabled) {
    props.push(formatStringProp("error", settings.error ?? ""));
  }

  if (settings.helpEnabled) {
    props.push(formatStringProp("help", settings.help ?? ""));
  }

  if (settings.size && settings.size !== "md") {
    props.push(formatStringProp("size", settings.size));
  }

  return props;
}

function importLine(components: string[]): string {
  return `import { ${components.join(", ")} } from "opus-react";`;
}

function wrapDashboardWidget(
  content: string,
  components: string[],
  options?: { dataComponent?: string; title?: string; width?: string },
) {
  const containerProps = [
    options?.title ? ` title=${quote(options.title)}` : "",
    options?.dataComponent ? ` data-component=${quote(options.dataComponent)}` : "",
    options?.width ? ` width=${quote(options.width)}` : "",
  ].join("");

  return `${importLine(["DashboardContentContainer", ...components])}

<DashboardContentContainer${containerProps}>
${content}
</DashboardContentContainer>`;
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
  afterState = [],
  components,
  extraImports = [],
  preamble = [],
  state = [],
  jsx,
}: {
  afterState?: string[];
  components: string[];
  extraImports?: string[];
  preamble?: string[];
  state: string[];
  jsx: string;
}): string {
  const importsBlock = [usageClientPrefix(), ...extraImports, importLine(components), ...preamble, ...state, ...afterState]
    .filter(Boolean)
    .join("\n");
  const trimmedJsx = jsx.trim();
  const returnBody = trimmedJsx.startsWith("(")
    ? trimmedJsx.replace(/;$/, "")
    : trimmedJsx.startsWith("<")
      ? `(\n${trimmedJsx
          .split("\n")
          .map((line) => (line ? `  ${line}` : line))
          .join("\n")}\n)`
      : trimmedJsx.endsWith(";")
        ? trimmedJsx.slice(0, -1)
        : trimmedJsx;

  return `${importsBlock}\n\nreturn ${returnBody};`;
}

function generateUsageCodeContent(
  slug: ControlSlug,
  settings: ControlSettings,
  category?: ComponentCategory,
): string {
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
              : "url";
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("type", inputType),
        ...(slug === "search-input" && s.placeholderEnabled
          ? [formatStringProp("placeholder", s.placeholder ?? "")]
          : []),
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
    case "note-composer": {
      const s = settings as ControlSettingsBySlug["note-composer"];
      return interactiveUsage({
        components: ["NoteComposer"],
        state: [
          'const [note, setNote] = useState("");',
          'const [lastAction, setLastAction] = useState("Waiting for action");',
        ],
        jsx: `(
  <>
    <NoteComposer
      placeholder=${quote(s.placeholder)}
      saveButtonLabel=${quote(s.saveButtonLabel)}
      showAttach={${s.showAttach}}
      showMention={${s.showMention}}
      showEmoji={${s.showEmoji}}
      value={note}
      onChange={setNote}
      onSave={(value) => {
        setLastAction(\`Saved note: \${value}\`);
        setNote("");
      }}
      onAttachClick={() => setLastAction("Attachment")}
      onMentionClick={() => setLastAction("Mention")}
      onEmojiSelect={(emoji) => setLastAction(\`Emoji: \${emoji}\`)}
    />
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    case "rich-text-field": {
      const s = settings as ControlSettingsBySlug["rich-text-field"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatNumberProp("minHeight", s.minHeight),
        ...(s.placeholderEnabled ? [formatStringProp("placeholder", s.placeholder)] : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(html) => ${toSetter(state)}(html)`),
      ];
      return controlledFieldUsage(["RichTextField"], "RichTextField", state, props, {
        initial: quote(s.value),
      });
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
    case "country-picker": {
      const s = settings as ControlSettingsBySlug["country-picker"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        ...(s.placeholderEnabled ? [formatStringProp("placeholder", s.placeholder)] : []),
        formatStringProp("searchPlaceholder", s.searchPlaceholder),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(code) => ${toSetter(state)}(code)`),
      ];
      return controlledFieldUsage(["CountryPickerField"], "CountryPickerField", state, props, {
        initial: quote(s.value),
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
        ...(s.size && s.size !== "md" ? [formatStringProp("size", s.size)] : []),
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
    case "chip-input": {
      const s = settings as ControlSettingsBySlug["chip-input"];
      const state = toStateName(s.label);
      const chips = Array.isArray(s.value)
        ? s.value
        : String(s.value)
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("variant", s.variant),
        ...(s.placeholderEnabled ? [formatStringProp("placeholder", s.placeholder)] : []),
        ...(s.disabled ? [formatBoolProp("disabled", true)] : []),
        ...(s.readOnly ? [formatBoolProp("readOnly", true)] : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];

      return controlledFieldUsage(["ChipInput"], "ChipInput", state, props, {
        initial: `[${chips.map((chip) => quote(chip)).join(", ")}]`,
      });
    }
    case "checkbox": {
      const s = settings as ControlSettingsBySlug["checkbox"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("shape", s.shape),
        ...(s.size && s.size !== "md" ? [formatStringProp("size", s.size)] : []),
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
    case "image-crop-upload": {
      const s = settings as ControlSettingsBySlug["image-crop-upload"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("uploadLabel", s.uploadLabel),
        formatStringProp("cropButtonLabel", s.cropButtonLabel),
        formatStringProp("changeButtonLabel", s.changeButtonLabel),
        formatStringProp("zoomLabel", s.zoomLabel),
        formatNumberProp("viewportSize", s.viewportSize),
        formatNumberProp("outputSize", s.outputSize),
        formatNumberProp("minZoom", s.minZoom),
        formatNumberProp("maxZoom", s.maxZoom),
        formatNumberProp("zoomStep", s.zoomStep),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
        formatExpressionProp("onCrop", `({ previewUrl }) => ${toSetter(state)}(previewUrl)`),
      ];
      return controlledFieldUsage(["ImageCropUploadField"], "ImageCropUploadField", state, props, { initial: '""' });
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
    case "filter-select": {
      const s = settings as ControlSettingsBySlug["filter-select"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("groups", "groups"),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      return `${usageClientPrefix()}
${importLine(["FilterSelectField"])}

const groups = ${formatFilterSelectGroupsForUsage()};
const [${state}, ${toSetter(state)}] = useState(${formatObjectLiteral(s.value)});

<FilterSelectField${formatSelfClosing(props)}`;
    }
    case "multi-select": {
      const s = settings as ControlSettingsBySlug["multi-select"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("options", "options"),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      return `${usageClientPrefix()}
${importLine(["MultiSelectField"])}

const options = ${formatMultiSelectOptionsForUsage(s.options)};
const [${state}, ${toSetter(state)}] = useState(${formatObjectLiteral(s.value)});

<MultiSelectField${formatSelfClosing(props)}`;
    }
    case "transfer-list": {
      const s = settings as ControlSettingsBySlug["transfer-list"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("available", "available"),
        formatExpressionProp("selected", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      return `${usageClientPrefix()}
${importLine(["TransferListField"])}

const available = ${formatTransferListAvailableForUsage(s.available)};
const [${state}, ${toSetter(state)}] = useState(${formatObjectLiteral(s.selected)});

<TransferListField${formatSelfClosing(props)}`;
    }
    case "password-strength-field": {
      const s = settings as ControlSettingsBySlug["password-strength-field"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        ...(s.showRequirements ? [formatBoolProp("showRequirements", true)] : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(value) => ${toSetter(state)}(value)`),
      ];
      return controlledFieldUsage(["PasswordStrengthField"], "PasswordStrengthField", state, props, {
        initial: quote(s.value),
      });
    }
    case "rating-input": {
      const s = settings as ControlSettingsBySlug["rating-input"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatNumberProp("max", s.max),
        formatStringProp("variant", s.variant),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      return controlledFieldUsage(["RatingField"], "RatingField", state, props, {
        initial: String(s.value),
      });
    }
    case "segmented-control": {
      const s = settings as ControlSettingsBySlug["segmented-control"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("options", "options"),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      return `${usageClientPrefix()}
${importLine(["SegmentedControlField"])}

const options = ${formatSegmentedControlOptionsForUsage(s.options)};
const [${state}, ${toSetter(state)}] = useState(${quote(s.value)});

<SegmentedControlField${formatSelfClosing(props)}`;
    }
    case "slider-range": {
      const s = settings as ControlSettingsBySlug["slider-range"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatNumberProp("min", s.min),
        formatNumberProp("max", s.max),
        formatNumberProp("step", s.step),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      return controlledFieldUsage(["SliderRangeField"], "SliderRangeField", state, props, {
        initial: formatObjectLiteral(s.value),
      });
    }
    case "phone-number-input": {
      const s = settings as ControlSettingsBySlug["phone-number-input"];
      const phoneState = toStateName(s.label);
      const countryState = `${phoneState}CountryCode`;
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("countryCode", countryState),
        formatExpressionProp("value", phoneState),
        formatExpressionProp("onChange", `(value) => ${toSetter(phoneState)}(value)`),
        formatExpressionProp("onCountryCodeChange", `(code) => ${toSetter(countryState)}(code)`),
      ];
      return `${usageClientPrefix()}
${importLine(["PhoneNumberField"])}

const [${phoneState}, ${toSetter(phoneState)}] = useState(${quote(s.value)});
const [${countryState}, ${toSetter(countryState)}] = useState(${quote(s.countryCode)});

<PhoneNumberField${formatSelfClosing(props)}`;
    }
    case "tree-select": {
      const s = settings as ControlSettingsBySlug["tree-select"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("nodes", "nodes"),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      return `${usageClientPrefix()}
${importLine(["TreeSelectField"])}

const nodes = ${formatTreeSelectNodesForUsage()};
const [${state}, ${toSetter(state)}] = useState(${quote(s.value)});

<TreeSelectField${formatSelfClosing(props)}`;
    }
    case "cascader": {
      const s = settings as ControlSettingsBySlug["cascader"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("options", "options"),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      return `${usageClientPrefix()}
${importLine(["CascaderField"])}

const options = ${formatCascaderOptionsForUsage()};
const [${state}, ${toSetter(state)}] = useState(${formatObjectLiteral(s.value)});

<CascaderField${formatSelfClosing(props)}`;
    }
    case "button":
    case "submit-button":
    case "reset-button": {
      const s = settings as ControlSettingsBySlug["button"];
      const buttonType = slug === "submit-button" ? "submit" : slug === "reset-button" ? "reset" : "button";
      const props = [
        formatStringProp("variant", s.variant),
        ...(buttonType !== "button" ? [formatStringProp("type", buttonType)] : []),
        ...(s.size && s.size !== "md" ? [formatStringProp("size", s.size)] : []),
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
      return `${usageClientPrefix()}\nimport { AccentColorPicker, createAccentStyle } from "opus-react";

const [accent, setAccent] = useState(${quote(s.value)});
const accentStyle = createAccentStyle(accent);

return (
  <div style={accentStyle}>
${formatSelfClosingElement("AccentColorPicker", props, "    ")}
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
import { IconPicker } from "opus-react";

const [icon, setIcon] = useState(${quote(s.value)});

return <IconPicker${formatSelfClosing(props)};`;
    }
    case "emoji-picker": {
      const s = settings as ControlSettingsBySlug["emoji-picker"];
      return interactiveUsage({
        components: ["Button", "CatalogIcon", "EmojiPicker"],
        state: [
          `const [emoji, setEmoji] = useState(${quote(s.lastSelected)});`,
          `const [open, setOpen] = useState(${s.open});`,
        ],
        jsx: `(
  <div>
    <EmojiPicker
      closeOnEscape={${s.closeOnEscape}}
      closeOnOutside={${s.closeOnOutside}}
      open={open}
      placement=${quote(s.placement)}
      searchPlaceholder=${quote(s.searchPlaceholder)}
      trigger={<Button variant="secondary"><CatalogIcon iconName="face-smile" /> Add emoji</Button>}
      onOpenChange={setOpen}
      onSelect={setEmoji}
    />
    <p>Selected: {emoji}</p>
  </div>
)`,
      });
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
      const dialogProps = props.map((prop) => `      ${prop}`).join("\n");
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
      const drawerProps = props.map((prop) => `      ${prop}`).join("\n");
      const children =
        s.contentType === "form"
          ? `      <TextField
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
          : formatJsxRichContent(s.content, "      ");
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
      const menuProps = props.map((prop) => `  ${prop}`).join("\n");
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
      const modalProps = props.map((prop) => `      ${prop}`).join("\n");
      const children =
        s.contentType === "form"
          ? `      <TextField
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
          : formatJsxRichContent(s.content, "      ");
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
      const popoverProps = props.map((prop) => `  ${prop}`).join("\n");
      const children =
        s.contentType === "form"
          ? `  <TextField
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
          : formatJsxRichContent(s.content, "  ");
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
${wrapDashboardWidget(`<StatCard${formatSelfClosing(props)} />`, ["StatCard"], { width: s.width ?? "widget" })}`;
    }
    case "sparkline": {
      const s = settings as ControlSettingsBySlug["sparkline"];
      return `const values = [18, 24, 21, 34, 29, 42, 38];

${wrapDashboardWidget(
        `<Sparkline label=${quote(s.label)} palette=${quote(s.palette)} values={values} variant="labeled" />`,
        ["Sparkline"],
        { width: s.width ?? "widget" },
      )}`;
    }
    case "progress-ring": {
      const s = settings as ControlSettingsBySlug["progress-ring"];
      return wrapDashboardWidget(
        `<ProgressRing label=${quote(s.label)} max={${s.max}} value={${s.value}} />`,
        ["ProgressRing"],
        { width: s.width ?? "widget" },
      );
    }
    case "progress-bar": {
      const s = settings as ControlSettingsBySlug["progress-bar"];
      return wrapDashboardWidget(
        `<ProgressBar label=${quote(s.label)} max={${s.max}} value={${s.value}} />`,
        ["ProgressBar"],
        { width: s.width ?? "widget" },
      );
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

        return `${wrapDashboardWidget(`<Gauge${formatSelfClosing(props)}`, ["Gauge"], { width: s.width ?? "widget" })}

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

      return `const footerMetrics = [
${footerBlock},
];

${wrapDashboardWidget(`<Gauge${formatSelfClosing(props)}`, ["Gauge"], { width: s.width ?? "widget" })}`;
    }
    case "speedometer": {
      const s = settings as ControlSettingsBySlug["speedometer"];
      return wrapDashboardWidget(
        `<Speedometer label=${quote(s.label)} max={${s.max}} value={${s.value}} />`,
        ["Speedometer"],
        { width: s.width ?? "widget" },
      );
    }
    case "metric-tile": {
      const s = settings as ControlSettingsBySlug["metric-tile"];
      const iconOption = getFontAwesomeIconOption(s.icon);
      return `import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ${iconOption.importName} } from "@fortawesome/free-solid-svg-icons";
import "@/lib/fontawesome";
${wrapDashboardWidget(
        `<MetricTile icon={<FontAwesomeIcon icon={${iconOption.importName}} />} label=${quote(s.label)} value=${quote(s.value)}${s.showSparkline ? " sparkline={[12, 18, 16, 24, 22, 30, 28]}" : ""} />`,
        ["MetricTile"],
        { width: s.width ?? "widget" },
      )}`;
    }
    case "dashboard-content-container": {
      const s = settings as ControlSettingsBySlug["dashboard-content-container"];
      return `${importLine(["DashboardContentContainer", "StatusIndicator"])}

<DashboardContentContainer title=${quote(s.title)} width=${quote(s.width ?? "widget")}>
  <StatusIndicator label="Systems healthy" status="success" />
</DashboardContentContainer>`;
    }
    case "pipeline-overview": {
      const s = settings as ControlSettingsBySlug["pipeline-overview"];
      return `const stages = ${formatPipelineStagesForUsage(s)};

${wrapDashboardWidget(
        `<PipelineOverview
  stages={stages}
  totalLabel=${quote(s.totalLabel)}
  totalValue=${quote(formatPipelineTotalValue(s))}
  period=${quote(s.period)}
  onPeriodChange={(nextPeriod) => {
    console.log("Period changed:", nextPeriod);
  }}
/>`,
        ["PipelineOverview"],
        { dataComponent: "pipeline-overview", title: s.title, width: s.width ?? "widget" },
      )}`;
    }
    case "deals-over-time": {
      const s = settings as ControlSettingsBySlug["deals-over-time"];
      const data = getDealsOverTimeDemoData(s.period);
      const maxValue = Math.max(1, Number(s.maxValue) || 100);
      return `const dealsData = ${JSON.stringify(data, null, 2)};

${wrapDashboardWidget(
        `<DealsOverTime
  title=${quote(s.title)}
  data={dealsData}
  maxValue={${maxValue}}
  period=${quote(s.period)}
  palette=${quote(s.palette ?? "purple")}
  valueLabel=${quote(s.valueLabel)}
  onPeriodChange={(nextPeriod) => {
    console.log("Period changed:", nextPeriod);
  }}
/>`,
        ["DealsOverTime"],
        { dataComponent: "deals-over-time", width: s.width ?? "widget" },
      )}`;
    }
    case "404-page": {
      return generate404PlaygroundCode();
    }
    case "403-page": {
      return generate403PlaygroundCode();
    }
    case "app-setup": {
      const s = settings as ControlSettingsBySlug["app-setup"];
      return generateAppSetupPlaygroundCode(s);
    }
    case "dashboard-list-columns": {
      const s = settings as ControlSettingsBySlug["dashboard-list-columns"];
      const containerWidth = s.width === "widget" ? "widget" : "full";
      return interactiveUsage({
        components: [
          "Columns",
          "DashboardContentContainer",
          "RecentActivity",
          "TopPerformingUsers",
          "UpcomingTasks",
        ],
        extraImports: [
          'import { demoUpcomingTasks } from "./upcomingTasksDemoData";',
          'import { demoRecentActivity } from "./recentActivityDemoData";',
          'import { demoTopPerformingUsers } from "./topPerformingUsersDemoData";',
        ],
        state: [
          'const [lastAction, setLastAction] = useState("Waiting for action");',
          "const [tasks, setTasks] = useState(demoUpcomingTasks);",
        ],
        jsx: `(
  <>
    <Columns direction=${quote(s.layout === "stacked" ? "column" : "row")} columns={3} gap={16}>
      <DashboardContentContainer data-component=${quote("upcoming-tasks")} width=${quote(containerWidth)}>
        <UpcomingTasks
          title=${quote(s.upcomingTasksTitle)}
          footerLabel=${quote(s.upcomingTasksFooterLabel)}
          checkboxSize=${quote(s.checkboxSize ?? "md")}
          tasks={tasks}
          onFooterClick={() => setLastAction(\`Last action: ${s.upcomingTasksFooterLabel}\`)}
          onTaskClick={(task) => setLastAction(\`Last action: \${task.title}\`)}
          onTaskCompleteChange={(task, completed) => {
            setTasks((current) =>
              current.map((entry) => (entry.id === task.id ? { ...entry, completed } : entry)),
            );
            setLastAction(completed ? \`Completed: \${task.title}\` : \`Reopened: \${task.title}\`);
          }}
        />
      </DashboardContentContainer>
      <DashboardContentContainer data-component=${quote("recent-activity")} width=${quote(containerWidth)}>
        <RecentActivity
          title=${quote(s.recentActivityTitle)}
          footerLabel=${quote(s.recentActivityFooterLabel)}
          items={demoRecentActivity}
          onFooterClick={() => setLastAction(\`Last action: ${s.recentActivityFooterLabel}\`)}
          onItemClick={(item) => setLastAction(\`Last action: \${item.title}\`)}
        />
      </DashboardContentContainer>
      <DashboardContentContainer data-component=${quote("top-performing-users")} width=${quote(containerWidth)}>
        <TopPerformingUsers
          title=${quote(s.topPerformingUsersTitle)}
          footerLabel=${quote(s.topPerformingUsersFooterLabel)}
          users={demoTopPerformingUsers}
          onFooterClick={() => setLastAction(\`Last action: ${s.topPerformingUsersFooterLabel}\`)}
          onPersonClick={(person) => setLastAction(\`Last action: \${person.name}\`)}
        />
      </DashboardContentContainer>
    </Columns>
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    case "notes-activity": {
      const s = settings as ControlSettingsBySlug["notes-activity"];
      return interactiveUsage({
        components: ["DashboardContentContainer", "NoteComposer", "NotesActivity"],
        preamble: [`const activity = ${JSON.stringify(demoNotesActivity, null, 2)};`],
        state: ['const [lastAction, setLastAction] = useState("Waiting for action");'],
        jsx: `(
  <>
    <DashboardContentContainer data-component=${quote("notes-activity")} width=${quote(s.width ?? "widget")}>
      <NotesActivity
        composerPlaceholder=${quote(s.composerPlaceholder)}
        footerLabel=${quote(s.footerLabel)}
        items={activity}
        saveButtonLabel=${quote(s.saveButtonLabel)}
        onFooterClick={() => setLastAction(\`Last action: ${s.footerLabel}\`)}
        onItemClick={(item) => setLastAction(\`Last action: \${item.body}\`)}
        onNoteSave={(note) => setLastAction(\`Saved note: \${note}\`)}
        onTabChange={(tab) => setLastAction(\`Tab: \${tab}\`)}
      />
    </DashboardContentContainer>
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    case "upcoming-tasks": {
      const s = settings as ControlSettingsBySlug["upcoming-tasks"];
      return interactiveUsage({
        components: ["DashboardContentContainer", "UpcomingTasks"],
        preamble: [`const initialTasks = ${JSON.stringify(demoUpcomingTasks, null, 2)};`],
        state: [
          'const [lastAction, setLastAction] = useState("Waiting for action");',
          "const [tasks, setTasks] = useState(initialTasks);",
        ],
        jsx: `(
  <>
    <DashboardContentContainer data-component=${quote("upcoming-tasks")} width=${quote(s.width ?? "widget")}>
      <UpcomingTasks
        title=${quote(s.title)}
        footerLabel=${quote(s.footerLabel)}
        checkboxSize=${quote(s.checkboxSize ?? "md")}
        tasks={tasks}
        onFooterClick={() => setLastAction(\`Last action: ${s.footerLabel}\`)}
        onTaskClick={(task) => setLastAction(\`Last action: \${task.title}\`)}
        onTaskCompleteChange={(task, completed) => {
          setTasks((current) =>
            current.map((entry) => (entry.id === task.id ? { ...entry, completed } : entry)),
          );
          setLastAction(completed ? \`Completed: \${task.title}\` : \`Reopened: \${task.title}\`);
        }}
      />
    </DashboardContentContainer>
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    case "recent-activity": {
      const s = settings as ControlSettingsBySlug["recent-activity"];
      return interactiveUsage({
        components: ["DashboardContentContainer", "RecentActivity"],
        preamble: [`const activity = ${JSON.stringify(demoRecentActivity, null, 2)};`],
        state: ['const [lastAction, setLastAction] = useState("Waiting for action");'],
        jsx: `(
  <>
    <DashboardContentContainer data-component=${quote("recent-activity")} width=${quote(s.width ?? "widget")}>
      <RecentActivity
        title=${quote(s.title)}
        footerLabel=${quote(s.footerLabel)}
        items={activity}
        onFooterClick={() => setLastAction(\`Last action: ${s.footerLabel}\`)}
        onItemClick={(item) => setLastAction(\`Last action: \${item.title}\`)}
      />
    </DashboardContentContainer>
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    case "top-performing-users": {
      const s = settings as ControlSettingsBySlug["top-performing-users"];
      return interactiveUsage({
        components: ["DashboardContentContainer", "TopPerformingUsers"],
        preamble: [`const users = ${JSON.stringify(demoTopPerformingUsers, null, 2)};`],
        state: ['const [lastAction, setLastAction] = useState("Waiting for action");'],
        jsx: `(
  <>
    <DashboardContentContainer data-component=${quote("top-performing-users")} width=${quote(s.width ?? "widget")}>
      <TopPerformingUsers
        title=${quote(s.title)}
        footerLabel=${quote(s.footerLabel)}
        users={users}
        onFooterClick={() => setLastAction(\`Last action: ${s.footerLabel}\`)}
        onPersonClick={(person) => setLastAction(\`Last action: \${person.name}\`)}
      />
    </DashboardContentContainer>
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    case "user-profile": {
      const s = settings as ControlSettingsBySlug["user-profile"];
      const menuItems = parseUserProfileMenuItems(s.menuItemsJson);
      const fieldId = "profile-photo-upload";
      const widgetProps = [
        formatStringProp("name", s.name),
        formatStringProp("role", s.role),
        formatStringProp("avatarSize", s.avatarSize),
        formatExpressionProp("src", "photo"),
        formatExpressionProp("menuItems", "menuItems"),
        ...(s.photoUploadEnabled ? [formatExpressionProp("onAvatarClick", "openPhotoUpload")] : []),
      ];
      const afterState = formatUserProfileUsageAfterState(menuItems, s.photoUploadEnabled, s.photoUploadMenuItemId);
      const propsBlock = widgetProps.map((prop) => `  ${prop}`).join("\n");
      const photoUploadState = s.photoUploadEnabled ? "const [photoUploadOpen, setPhotoUploadOpen] = useState(false);" : "";
      const state = [`const [photo, setPhoto] = useState(${s.srcEnabled && s.src ? quote(s.src) : '""'});`, photoUploadState].filter(Boolean);
      const modalBlock = s.photoUploadEnabled
        ? formatUserProfilePhotoUploadModalUsage(fieldId, s.photoUploadTitle)
        : "";
      const widgetBlock = `<UserProfileWidget
${propsBlock}
/>`;
      const indentContainerChild = (block: string) =>
        block
          .split("\n")
          .map((line) => (line ? `  ${line}` : line))
          .join("\n");
      const fragmentContent = s.photoUploadEnabled
        ? `<>
  ${widgetBlock}
  ${modalBlock}
</>`
        : widgetBlock;
      const returnContent = s.photoUploadEnabled ? `(\n  ${fragmentContent}\n)` : widgetBlock;
      const wrapped = s.wrapInContainer ?? category === "labs";
      const containerContent = s.photoUploadEnabled
        ? `${indentContainerChild(widgetBlock)}\n${indentContainerChild(modalBlock)}`
        : indentContainerChild(widgetBlock);
      const components = s.photoUploadEnabled
        ? wrapped
          ? ["DashboardContentContainer", "UserProfileWidget", "ProfilePhotoUploadModal"]
          : ["UserProfileWidget", "ProfilePhotoUploadModal"]
        : wrapped
          ? ["DashboardContentContainer", "UserProfileWidget"]
          : ["UserProfileWidget"];

      if (wrapped) {
        return interactiveUsage({
          afterState,
          components,
          state,
          jsx: `<DashboardContentContainer data-component=${quote("user-profile")} width=${quote(s.width ?? "widget")}>
${containerContent}
</DashboardContentContainer>`,
        });
      }

      return interactiveUsage({
        afterState,
        components,
        state,
        jsx: returnContent,
      });
    }
    case "profile-photo-upload": {
      const s = settings as ControlSettingsBySlug["profile-photo-upload"];
      const widgetProps = `title=${quote(s.title)}
        label=${quote(s.label)}
        uploadLabel=${quote(s.uploadLabel)}
        cropButtonLabel=${quote(s.cropButtonLabel)}
        changeButtonLabel=${quote(s.changeButtonLabel)}
        zoomLabel=${quote(s.zoomLabel)}
        viewportSize={${s.viewportSize}}
        outputSize={${s.outputSize}}
        minZoom={${s.minZoom}}
        maxZoom={${s.maxZoom}}
        zoomStep={${s.zoomStep}}
        value={photo}
        onChange={setPhoto}
        onCrop={({ previewUrl }) => {
          setPhoto(previewUrl);
          setLastAction("Last action: Photo cropped");
        }}`;

      return interactiveUsage({
        components: ["ImageCropUploadWidget"],
        state: [
          'const [lastAction, setLastAction] = useState("Waiting for action");',
          'const [photo, setPhoto] = useState("");',
        ],
        jsx: `(
  <>
    <ImageCropUploadWidget
      ${widgetProps}
    />
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    case "status-indicator": {
      const s = settings as ControlSettingsBySlug["status-indicator"];
      return wrapDashboardWidget(
        `<StatusIndicator label=${quote(s.label)} status=${quote(s.status)} />`,
        ["StatusIndicator"],
        { width: s.width ?? "widget" },
      );
    }
    case "trend-badge": {
      const s = settings as ControlSettingsBySlug["trend-badge"];
      return wrapDashboardWidget(
        `<TrendBadge direction=${quote(s.direction)} value=${quote(s.value)} />`,
        ["TrendBadge"],
        { width: s.width ?? "widget" },
      );
    }
    case "panel": {
      const s = settings as ControlSettingsBySlug["panel"];
      const props = [
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        ...(s.tone !== "default" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.divided ? [] : [formatBoolProp("divided", false)]),
        ...(s.bordered ? [] : [formatBoolProp("bordered", false)]),
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
      const demoRows = s.layout === "tree" ? dataGridTreeRows : dataGridRows;
      const props = [
        formatExpressionProp("columns", "columns"),
        formatExpressionProp("rows", "rows"),
        formatStringProp("caption", s.caption),
        ...(s.density !== "compact" ? [formatStringProp("density", s.density)] : []),
        ...(s.layout !== "flat" ? [formatStringProp("layout", s.layout)] : []),
        ...(s.layout === "grouped" ? [formatStringProp("groupBy", "group")] : []),
        ...(s.layout === "pivot"
          ? [formatExpressionProp("pivot", JSON.stringify(dataGridPivotConfig))]
          : []),
        ...(s.masterDetail && s.layout !== "pivot"
          ? [formatExpressionProp("getDetailContent", "(row) => `Detail for ${row.values.team}`")]
          : []),
        ...(s.virtualized ? [formatBoolProp("virtualized", true)] : []),
        ...(s.infiniteScroll && s.layout !== "tree" && s.layout !== "pivot"
          ? [
              formatBoolProp("hasMore", true),
              formatExpressionProp("onLoadMore", "() => loadMore()"),
            ]
          : []),
        ...(s.striped ? [] : [formatBoolProp("striped", false)]),
        ...(s.bordered ? [] : [formatBoolProp("bordered", false)]),
        ...(s.stickyHeader ? [] : [formatBoolProp("stickyHeader", false)]),
        ...(s.stickyFirstColumn ? [] : [formatBoolProp("stickyFirstColumn", false)]),
      ];
      return `${importLine(["DataGrid"])}

const columns = ${formatDataGridColumnsForUsage(columns)};

const rows = ${formatDataGridRowsForUsage(demoRows)};

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
${formatJsxParagraphContent(s.content)}
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
    case "badge": {
      const s = settings as ControlSettingsBySlug["badge"];
      const props = [
        formatStringProp("label", s.label),
        ...(s.tone !== "neutral" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.variant !== "soft" ? [formatStringProp("variant", s.variant)] : []),
        ...(s.size !== "md" ? [formatStringProp("size", s.size)] : []),
        ...(s.dot ? [formatBoolProp("dot", true)] : []),
      ];
      return `${importLine(["Badge"])}\n\n<Badge${formatSelfClosing(props)}`;
    }
    case "avatar": {
      const s = settings as ControlSettingsBySlug["avatar"];
      const props = [
        formatStringProp("name", s.name),
        ...(s.size !== "md" ? [formatStringProp("size", s.size)] : []),
        ...(s.shape !== "circle" ? [formatStringProp("shape", s.shape)] : []),
        ...(s.srcEnabled && s.src ? [formatStringProp("src", s.src)] : []),
      ];
      return `${importLine(["Avatar"])}\n\n<Avatar${formatSelfClosing(props)}`;
    }
    case "avatar-group": {
      const s = settings as ControlSettingsBySlug["avatar-group"];
      const props = [
        formatExpressionProp("items", "items"),
        ...(s.max !== 4 ? [formatNumberProp("max", s.max)] : []),
        ...(s.size !== "md" ? [formatStringProp("size", s.size)] : []),
      ];
      return `${importLine(["AvatarGroup"])}

const items = ${formatAvatarGroupItemsForUsage()};

<AvatarGroup${formatSelfClosing(props)}`;
    }
    case "list": {
      const s = settings as ControlSettingsBySlug["list"];
      const props = [
        formatExpressionProp("items", "items"),
        ...(s.density !== "comfortable" ? [formatStringProp("density", s.density)] : []),
        ...(s.ordered ? [formatBoolProp("ordered", true)] : []),
      ];
      return `${importLine(["List"])}

const items = ${formatListItemsForUsage(s.showIcons)};

<List${formatSelfClosing(props)}`;
    }
    case "description-list": {
      const s = settings as ControlSettingsBySlug["description-list"];
      const props = [
        formatExpressionProp("items", "items"),
        ...(s.layout !== "stacked" ? [formatStringProp("layout", s.layout)] : []),
      ];
      return `${importLine(["DescriptionList"])}

const items = ${formatDescriptionListItemsForUsage()};

<DescriptionList${formatSelfClosing(props)}`;
    }
    case "divider": {
      const s = settings as ControlSettingsBySlug["divider"];
      const props = [
        ...(s.orientation !== "horizontal" ? [formatStringProp("orientation", s.orientation)] : []),
        ...(s.tone !== "default" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.labelEnabled && s.orientation === "horizontal" ? [formatStringProp("label", s.label)] : []),
      ];
      return `${importLine(["Divider"])}\n\n<Divider${formatSelfClosing(props)}`;
    }
    case "content-timeline": {
      const s = settings as ControlSettingsBySlug["content-timeline"];

      if (s.includeGroups) {
        return `${importLine(["ContentTimeline"])}

const groups = ${formatContentTimelineGroupsForUsage(s.includeStatus, s.rowStyles, s.includeTags)};

<ContentTimeline groups={groups} />`;
      }

      return `${importLine(["ContentTimeline"])}

const items = ${formatContentTimelineItemsForUsage(s.includeStatus, s.rowStyles, s.includeTags)};

<ContentTimeline items={items} />`;
    }
    case "tree-view": {
      const s = settings as ControlSettingsBySlug["tree-view"];
      return `${importLine(["TreeView"])}

const nodes = ${formatTreeViewNodesForUsage()};

<TreeView nodes={nodes}${s.expandRoots ? ' defaultExpandedIds={["product", "engineering"]}' : ""} />`;
    }
    case "masonry-grid": {
      const s = settings as ControlSettingsBySlug["masonry-grid"];
      const props = [
        formatExpressionProp("items", "items"),
        ...(s.columns !== 3 ? [formatNumberProp("columns", s.columns)] : []),
        ...(s.gap !== 12 ? [formatNumberProp("gap", s.gap)] : []),
      ];
      return `${importLine(["MasonryGrid"])}

const items = ${formatMasonryItemsForUsage()};

<MasonryGrid${formatSelfClosing(props)}`;
    }
    case "property-grid": {
      const s = settings as ControlSettingsBySlug["property-grid"];
      return `${importLine(["PropertyGrid"])}

const items = ${formatPropertyItemsForUsage(s.copyable)};

<PropertyGrid items={items}${s.bordered ? " bordered" : ""} />`;
    }
    case "stack": {
      const s = settings as ControlSettingsBySlug["stack"];
      return `${importLine(["Stack"])}

<Stack direction="${s.direction}" gap={${s.gap}}${s.wrap ? " wrap" : ""}>
${formatLayoutTileChildren(4)}
</Stack>`;
    }
    case "columns": {
      const s = settings as ControlSettingsBySlug["columns"];
      const directionProp = s.direction !== "row" ? ` direction="${s.direction}"` : "";
      const columnsProp = s.columns !== 3 ? ` columns={${s.columns}}` : "";
      const gapProp = s.gap !== 16 ? ` gap={${s.gap}}` : "";
      return `${importLine(["Columns"])}

<Columns${directionProp}${columnsProp}${gapProp}>
${formatLayoutTileChildren()}
</Columns>`;
    }
    case "grid": {
      const s = settings as ControlSettingsBySlug["grid"];
      return `${importLine(["Grid"])}

<Grid columns={${s.columns}} gap={${s.gap}}>
${formatLayoutTileChildren()}
</Grid>`;
    }
    case "splitter": {
      const s = settings as ControlSettingsBySlug["splitter"];
      return `${importLine(["Splitter"])}

<Splitter orientation="${s.orientation}" defaultSize={${s.defaultSize}}>
  <div>Primary</div>
  <div>Secondary</div>
</Splitter>`;
    }
    case "resizable-panel": {
      const s = settings as ControlSettingsBySlug["resizable-panel"];
      return `${importLine(["ResizablePanel"])}

<ResizablePanel defaultWidth={${s.defaultWidth}} defaultHeight={${s.defaultHeight}}>
  Resizable content
</ResizablePanel>`;
    }
    case "dock-layout": {
      const s = settings as ControlSettingsBySlug["dock-layout"];
      const dockProps = formatDockLayoutProps(s);
      return `${importLine(["DockLayout"])}

<DockLayout${dockProps ? ` ${dockProps}` : ""}>
  Centre workspace
</DockLayout>`;
    }
    case "scroll-area": {
      const s = settings as ControlSettingsBySlug["scroll-area"];
      return `${importLine(["ScrollArea"])}

<ScrollArea maxHeight={${s.maxHeight}} orientation="${s.orientation}">
  <div style={{ padding: 12, display: "grid", gap: 6 }}>
${formatScrollAreaContent()}
  </div>
</ScrollArea>`;
    }
    case "aspect-ratio": {
      const s = settings as ControlSettingsBySlug["aspect-ratio"];
      return `${importLine(["AspectRatio"])}

<AspectRatio ratio="${s.ratio}">
  <img alt="" src="/hero.jpg" />
</AspectRatio>`;
    }
    case "container": {
      const s = settings as ControlSettingsBySlug["container"];
      return `${importLine(["Container"])}

<Container size="${s.size}"${s.padded ? "" : " padded={false}"}>
  Page content
</Container>`;
    }
    case "spacer": {
      const s = settings as ControlSettingsBySlug["spacer"];
      return `${importLine(["Spacer"])}

<div>
  <div>Above</div>
  <Spacer axis="${s.axis}" size={${s.size}}${s.flex ? " flex" : ""} />
  <div>Below</div>
</div>`;
    }
    case "breadcrumb": {
      const s = settings as ControlSettingsBySlug["breadcrumb"];
      return `${importLine(["Breadcrumb"])}

<Breadcrumb
  separator="${s.separator}"
  items={${formatBreadcrumbItemsForUsage()}}
/>`;
    }
    case "pagination": {
      const s = settings as ControlSettingsBySlug["pagination"];
      return `${importLine(["Pagination"])}

<Pagination page={${s.page}} pageCount={${s.pageCount}} onPageChange={(page) => console.log(page)} />`;
    }
    case "page-header": {
      const s = settings as ControlSettingsBySlug["page-header"];
      const breadcrumbs = s.showBreadcrumbs
        ? `\n  breadcrumbs={<Breadcrumb items={${formatBreadcrumbItemsForUsage()}} />}`
        : "";
      const actions = s.showActions
        ? `\n  actions={<><Button type="button" variant="secondary">Share</Button><Button type="button" variant="primary">Edit</Button></>}`
        : "";
      return `${importLine(["PageHeader", "Button", "Breadcrumb"])}

<PageHeader
  eyebrow="Navigation"
  title="Page header"
  description="Composable page chrome for documentation and application shells."${breadcrumbs}${actions}
/>`;
    }
    case "toolbar": {
      const s = settings as ControlSettingsBySlug["toolbar"];
      return `${importLine(["Toolbar", "Button"])}

<Toolbar${s.dense ? " dense" : ""} start={<Button variant="secondary">Filter</Button>} end={<Button>Publish</Button>}>
  <Button variant="light">Undo</Button>
</Toolbar>`;
    }
    case "bottom-navigation": {
      const s = settings as ControlSettingsBySlug["bottom-navigation"];
      return `${importLine(["BottomNavigation"])}

<BottomNavigation
  value="${s.value}"
  items={${formatBottomNavItemsForUsage()}}
  onChange={(id) => console.log(id)}
/>`;
    }
    case "navigation-rail": {
      const s = settings as ControlSettingsBySlug["navigation-rail"];
      return `${importLine(["NavigationRail"])}

<NavigationRail
  value="${s.value}"${s.collapsed ? "\n  collapsed" : ""}
  items={${formatRailItemsForUsage()}}
  onChange={(id) => console.log(id)}
/>`;
    }
    case "split-button": {
      const s = settings as ControlSettingsBySlug["split-button"];
      return `${importLine(["SplitButton"])}

<SplitButton
  variant="${s.variant}"
  actions={${formatSplitActionsForUsage()}}
>
  Save
</SplitButton>`;
    }
    case "fab": {
      const s = settings as ControlSettingsBySlug["fab"];
      return `${importLine(["FloatingActionButton"])}

<FloatingActionButton label="Create" icon="+" size="${s.size}"${s.extended ? " extended" : ""} />`;
    }
    case "tile": {
      const s = settings as ControlSettingsBySlug["tile"];
      return `${importLine(["Tile"])}

<Tile
  label="${s.label}"
  tone="${s.tone}"
  icon="${s.icon}"
  onClick={() => handleTile("${s.label.toLowerCase().replace(/\s+/g, "-")}")}
/>`;
    }
    case "tiles": {
      const s = settings as ControlSettingsBySlug["tiles"];
      return `${usageClientPrefix()}
${importLine(["Tiles"])}

const handleTile = (id) => console.log(id);
const items = ${formatTilesForUsage()};

<Tiles items={items} layout="${s.layout}" />`;
    }
    case "stat-tile": {
      const s = settings as ControlSettingsBySlug["stat-tile"];
      return `${importLine(["StatTile"])}

<StatTile
  label="${s.label}"
  value="${s.value}"
  icon="${s.icon}"
  tone="${s.tone}"
  trend="${s.trend}"
  trendValue="${s.trendValue}"
  comparison="${s.comparison}"
  onClick={() => handleStatTile("${s.label.toLowerCase().replace(/\s+/g, "-")}")}
/>`;
    }
    case "stat-tiles": {
      const s = settings as ControlSettingsBySlug["stat-tiles"];
      return `${usageClientPrefix()}
${importLine(["StatTiles"])}

const handleStatTile = (id) => console.log(id);
const items = ${formatStatTilesForUsage()};

<StatTiles items={items} layout="${s.layout}" />`;
    }
    case "property-inspector": {
      const s = settings as ControlSettingsBySlug["property-inspector"];
      return `${importLine(["PropertyInspector"])}

const items = ${formatPropertyInspectorItemsForUsage()};

<PropertyInspector items={items}${s.searchable ? " searchable" : ""} onChange={(id, value) => console.log(id, value)} />`;
    }
    case "filter-builder": {
      return `${usageClientPrefix()}
${importLine(["FilterBuilder"])}

const [conditions, setConditions] = useState(${formatFilterConditionsForUsage()});

<FilterBuilder conditions={conditions} fields={${formatInspectorFieldsForUsage()}} onChange={setConditions} />`;
    }
    case "query-builder": {
      const s = settings as ControlSettingsBySlug["query-builder"];
      return `${usageClientPrefix()}
${importLine(["QueryBuilder"])}

const [group, setGroup] = useState(${formatQueryGroupForUsage(s.combinator)});

<QueryBuilder fields={${formatInspectorFieldsForUsage()}} group={group} onChange={setGroup} />`;
    }
    case "rule-builder": {
      const s = settings as ControlSettingsBySlug["rule-builder"];
      return `${usageClientPrefix()}
${importLine(["RuleBuilder"])}

const [rules, setRules] = useState(${formatRulesForUsage(s.showDisabled)});

<RuleBuilder rules={rules} onChange={setRules} />`;
    }
    case "permissions-matrix": {
      return `${importLine(["PermissionsMatrix"])}

const permissions = ${formatPermissionsForUsage()};

<PermissionsMatrix
  roles={${formatPermissionsRolesForUsage()}}
  resources={${formatPermissionsResourcesForUsage()}}
  permissions={permissions}
  onChange={(role, resource, level) => console.log(role, resource, level)}
/>`;
    }
    case "dual-list-builder": {
      const s = settings as ControlSettingsBySlug["dual-list-builder"];
      return `${usageClientPrefix()}
${importLine(["DualListBuilder"])}

const available = ${formatDualListAvailableForUsage()};
const [selectedIds, setSelectedIds] = useState(${formatDualListSelectedForUsage(s.selectedCount)});

<DualListBuilder available={available} selectedIds={selectedIds} onChange={setSelectedIds} />`;
    }
    case "scheduler": {
      const s = settings as ControlSettingsBySlug["scheduler"];
      return `${importLine(["Scheduler"])}

const events = ${formatSchedulerEventsForUsage()};

<Scheduler events={events} startHour={${s.startHour}} endHour={${s.endHour}} />`;
    }
    case "kanban-board": {
      const s = settings as ControlSettingsBySlug["kanban-board"];
      return `${usageClientPrefix()}
${importLine(["KanbanBoard"])}

const cards = ${formatKanbanCardsForUsage()};
const [columns, setColumns] = useState(${formatKanbanColumnsForUsage()});

<KanbanBoard cards={cards} columns={columns}${s.interactive ? " onChange={setColumns}" : ""} />`;
    }
    case "calendar": {
      const s = settings as ControlSettingsBySlug["calendar"];
      const events = s.showEvents ? formatCalendarEventsForUsage() : "[]";
      return `${importLine(["Calendar", "useState"])}

function CalendarExample() {
  const [selectedDate, setSelectedDate] = useState<string>();

  return (
    <>
      <Calendar
        events={${events}}
        onSelectDate={setSelectedDate}${s.openDayOnSelect ? "" : "\n        openDayOnSelect={false}"}
        selectedDate={selectedDate}${s.showMonthYearPicker ? "" : "\n        showMonthYearPicker={false}"}
      />
      <p>{selectedDate ? \`Opened or selected: \${selectedDate}\` : "Click a day to open its schedule."}</p>
    </>
  );
}

<CalendarExample />`;
    }
    case "resource-planner": {
      const s = settings as ControlSettingsBySlug["resource-planner"];
      return `${importLine(["ResourcePlanner"])}

<ResourcePlanner
  startHour={${s.startHour}}
  endHour={${s.endHour}}
  resources={${formatResourcePlannerResourcesForUsage()}}
  items={${formatResourcePlannerItemsForUsage()}}
/>`;
    }
    case "json-viewer": {
      const s = settings as ControlSettingsBySlug["json-viewer"];
      const props = [
        formatExpressionProp("value", "value"),
        ...(s.collapsedDepth !== 1 ? [formatNumberProp("collapsedDepth", s.collapsedDepth)] : []),
      ];
      return `${importLine(["JsonViewer"])}

const value = ${formatJsonValueForUsage()};

<JsonViewer${formatSelfClosing(props)}`;
    }
    case "statistic": {
      const s = settings as ControlSettingsBySlug["statistic"];
      const props = [
        formatStringProp("label", s.label),
        formatStringProp("value", s.value),
        ...(s.prefix ? [formatStringProp("prefix", s.prefix)] : []),
        ...(s.suffix ? [formatStringProp("suffix", s.suffix)] : []),
        ...(s.trendEnabled ? [formatStringProp("trend", s.trend), formatStringProp("trendLabel", s.trendLabel)] : []),
      ];
      return `${importLine(["Statistic"])}\n\n<Statistic${formatSelfClosing(props)}`;
    }

    case "icon": {
      const s = settings as ControlSettingsBySlug["icon"];
      const props = [
        formatStringProp("name", s.name),
        ...(s.size !== "md" ? [formatStringProp("size", s.size)] : []),
        ...(s.tone !== "default" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.labelEnabled ? [formatStringProp("label", s.label)] : []),
      ];
      return `${importLine(["Icon"])}\n\n<Icon${formatSelfClosing(props)}`;
    }
    case "icon-badge": {
      const s = settings as ControlSettingsBySlug["icon-badge"];

      if (s.showToolbarDemo) {
        return interactiveUsage({
          components: ["IconBadge"],
          state: [
            'const [lastAction, setLastAction] = useState("Waiting for action");',
            'const reportAction = (label: string) => setLastAction(`Last action: ${label}`);',
          ],
          jsx: formatIconBadgeToolbarUsage(s.size, s.tone),
        });
      }

      const props = [
        formatStringProp("iconName", s.iconName),
        formatStringProp("label", s.label),
        ...(s.count ? [formatExpressionProp("count", String(s.count))] : []),
        ...(s.max !== 99 ? [formatExpressionProp("max", String(s.max))] : []),
        ...(s.size !== "md" ? [formatStringProp("size", s.size)] : []),
        ...(s.tone !== "muted" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.urgency !== "standard" ? [formatStringProp("urgency", s.urgency)] : []),
        ...(s.showZero ? [formatBoolProp("showZero", true)] : []),
        formatExpressionProp("onClick", `() => setLastAction(\`Last action: ${s.label}\`)`),
      ];
      return interactiveUsage({
        components: ["IconBadge"],
        state: ['const [lastAction, setLastAction] = useState("Waiting for action");'],
        jsx: `(
  <>
    <IconBadge${formatSelfClosing(props)}
    <p>{lastAction}</p>
  </>
)`,
      });
    }
    case "spinner": {
      const s = settings as ControlSettingsBySlug["spinner"];
      const props = [
        ...(s.size !== "md" ? [formatStringProp("size", s.size)] : []),
        ...(s.tone !== "accent" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.label !== "Loading" ? [formatStringProp("label", s.label)] : []),
      ];
      return `${importLine(["Spinner"])}\n\n<Spinner${formatSelfClosing(props)}`;
    }
    case "clock": {
      const s = settings as ControlSettingsBySlug["clock"];
      const props = [
        ...(s.size !== "md" ? [formatStringProp("size", s.size)] : []),
        ...(s.showAnalog ? [] : [formatBoolProp("showAnalog", false)]),
        ...(s.showDigital ? [] : [formatBoolProp("showDigital", false)]),
        ...(s.showDate ? [] : [formatBoolProp("showDate", false)]),
      ];
      return `${importLine(["Clock"])}\n\n<Clock${formatSelfClosing(props)}`;
    }
    case "portal": {
      const s = settings as ControlSettingsBySlug["portal"];
      return `${importLine(["Portal"])}\n\n<Portal${s.disabled ? " disabled" : ""}>\n  <div>{${JSON.stringify(s.message)}}</div>\n</Portal>`;
    }
    case "portal-host": {
      const s = settings as ControlSettingsBySlug["portal-host"];
      return `${importLine(["Portal", "PortalHost"])}\n\n<PortalHost id=${JSON.stringify(s.hostId)}>\n  <Portal>\n    <div>{${JSON.stringify(s.message)}}</div>\n  </Portal>\n</PortalHost>`;
    }
    case "visually-hidden": {
      const s = settings as ControlSettingsBySlug["visually-hidden"];
      return `${importLine(["VisuallyHidden"])}\n\n<VisuallyHidden>${s.text}</VisuallyHidden>`;
    }
    case "focus-trap": {
      const s = settings as ControlSettingsBySlug["focus-trap"];
      return `${importLine(["FocusTrap"])}\n\n<FocusTrap${s.active ? "" : " active={false}"}>\n  <button type="button">Focus me</button>\n</FocusTrap>`;
    }
    case "keyboard-shortcut": {
      const s = settings as ControlSettingsBySlug["keyboard-shortcut"];
      const keys = s.keys.split(/\\s*\\+\\s*|\\s+/).filter(Boolean);
      const props = [
        formatExpressionProp("keys", JSON.stringify(keys.length ? keys : ["⌘", "K"])),
        ...(s.size !== "md" ? [formatStringProp("size", s.size)] : []),
      ];
      return `${importLine(["KeyboardShortcut"])}\n\n<KeyboardShortcut${formatSelfClosing(props)}`;
    }
    case "hotkey-manager": {
      const s = settings as ControlSettingsBySlug["hotkey-manager"];
      return `${importLine(["HotkeyManager", "useHotkey"])}\n\n<HotkeyManager enabled={${s.enabled}}>\n  {/* useHotkey({ id: "save", key: ${JSON.stringify(s.key)}, meta: true }, handler) */}\n  {children}\n</HotkeyManager>`;
    }
    case "copy-button": {
      const s = settings as ControlSettingsBySlug["copy-button"];
      const props = [
        formatStringProp("value", s.value),
        ...(s.label !== "Copy" ? [formatStringProp("label", s.label)] : []),
        ...(s.copiedLabel !== "Copied" ? [formatStringProp("copiedLabel", s.copiedLabel)] : []),
      ];
      return `${importLine(["CopyButton"])}\n\n<CopyButton${formatSelfClosing(props)}`;
    }
    case "clipboard": {
      return `${importLine(["Clipboard", "useClipboard"])}\n\n<Clipboard>\n  {children}\n</Clipboard>`;
    }
    case "theme-provider": {
      const s = settings as ControlSettingsBySlug["theme-provider"];
      return `${importLine(["ThemeProvider"])}\n\n<ThemeProvider theme=${JSON.stringify(s.theme)}>\n  {children}\n</ThemeProvider>`;
    }
    case "theme-switcher": {
      const s = settings as ControlSettingsBySlug["theme-switcher"];
      return `${usageClientPrefix()}\n${importLine(["ThemeSwitcher"])}\n\nconst [theme, setTheme] = useState<"dark" | "light">(${JSON.stringify(s.theme)});\n\n<ThemeSwitcher label=${JSON.stringify(s.label)} value={theme} onChange={setTheme} />`;
    }
    case "resize-observer": {
      const s = settings as ControlSettingsBySlug["resize-observer"];
      return interactiveUsage({
        components: ["ResizeObserver"],
        state: [],
        jsx: `(
  <div data-fit-content="true">
    <ResizeObserver
      style={{
        boxSizing: "border-box",
        resize: "both",
        overflow: "auto",
        minWidth: 160,
        minHeight: 90,
        width: 240,
        height: 120,
        padding: 12,
        border: "1px dashed var(--opus-accent)",
        borderRadius: 12,
      }}
    >
      {(size) => (
        <>
          <div style={{ color: "var(--opus-muted)", marginBottom: 8 }}>${s.hint}</div>
          <strong>
            {size.width} × {size.height}
          </strong>
        </>
      )}
    </ResizeObserver>
  </div>
)`,
      });
    }
    case "intersection-observer": {
      const s = settings as ControlSettingsBySlug["intersection-observer"];
      return `${importLine(["IntersectionObserver"])}\n\n<IntersectionObserver threshold={${s.threshold}}>\n  {(visible) => <div>{visible ? "Visible" : "Hidden"}</div>}\n</IntersectionObserver>`;
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
${formatOpeningElement("Sidebar", sidebarProps, "  ")}
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

export function generateFullUsageCode(
  slug: ControlSlug,
  settings: ControlSettings,
  category?: ComponentCategory,
) {
  const content = generateUsageCodeContent(slug, settings, category);
  if (/export\s+default\s+function/.test(content.trim())) {
    return content.trim();
  }

  return formatFullUsageComponent(content);
}

export function generatePlaygroundSeedCode(
  slug: ControlSlug,
  settings: ControlSettings,
  category?: ComponentCategory,
) {
  return generateFullUsageCode(slug, settings, category);
}

export function generateUsageCode(slug: ControlSlug, settings: ControlSettings, category?: ComponentCategory) {
  const full = generateFullUsageCode(slug, settings, category);
  return {
    ...splitUsageCode(full),
    full,
  };
}
