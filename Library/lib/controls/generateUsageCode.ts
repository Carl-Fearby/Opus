import type {
  ComponentCategory,
  ControlSettings,
  ControlSettingsBySlug,
  ControlSlug,
} from "./types";
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
import {
  demoPipelineStages,
  formatPipelineStagesForUsage,
  formatPipelineTotalValue,
} from "./pipelineDemoData";
import { getDealsOverTimeDemoData } from "./dealsOverTimeDemoData";
import { demoRecentActivity } from "./recentActivityDemoData";
import { demoNotesActivity } from "./notesActivityDemoData";
import { testLayoutMenu } from "./testLayoutDemoData";
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
  formatChoiceChipOptionsForUsage,
  formatContentTimelineGroupsForUsage,
  formatContentTimelineItemsForUsage,
  formatDescriptionListItemsForUsage,
  formatDockLayoutProps,
  formatThreePaneLayoutProps,
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
import {
  generate403PlaygroundCode,
  generate404PlaygroundCode,
} from "./errorPageBoilerplate";

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

function formatSelfClosingElement(
  tagName: string,
  props: string[],
  indent = "",
): string {
  if (!props.length) {
    return `${indent}<${tagName} />`;
  }

  if (props.length === 1) {
    return `${indent}<${tagName} ${props[0]} />`;
  }

  return `${indent}<${tagName}\n${props.map((prop) => `${indent}  ${prop}`).join("\n")}\n${indent}/>`;
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
          return index === 0
            ? lineText
            : `\n${indent}  <br />\n${indent}  ${lineText}`;
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
          return index === 0
            ? lineNode
            : `\n${indent}  <br />\n${indent}  ${lineNode}`;
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
  options?: {
    dataComponent?: string;
    height?: string;
    title?: string;
    width?: string;
    wrap?: boolean;
  },
) {
  if (options?.wrap === false) {
    return `${importLine(components)}

${content}`;
  }

  const containerProps = [
    options?.title ? ` title=${quote(options.title)}` : "",
    options?.dataComponent
      ? ` data-component=${quote(options.dataComponent)}`
      : "",
    options?.height && options.height !== "auto"
      ? ` height=${quote(options.height)}`
      : "",
    options?.width ? ` width=${quote(options.width)}` : "",
  ].join("");

  return `${importLine(["DashboardContentContainer", ...components])}

<DashboardContentContainer${containerProps}>
${content}
</DashboardContentContainer>`;
}

function maybeWrapDashboardContent(
  content: string,
  options: {
    dataComponent: string;
    height?: string;
    width: string;
    wrap: boolean;
  },
) {
  if (!options.wrap) {
    return content;
  }

  const heightProp =
    options.height && options.height !== "auto"
      ? ` height=${quote(options.height)}`
      : "";

  return `<DashboardContentContainer data-component=${quote(options.dataComponent)}${heightProp} width=${quote(options.width)}>
${content
  .split("\n")
  .map((line) => (line ? `  ${line}` : line))
  .join("\n")}
</DashboardContentContainer>`;
}

function usageClientPrefix(includeUseState = true): string {
  return includeUseState
    ? `"use client";\n\nimport { useState } from "react";`
    : `"use client";`;
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
  const includeUseState = [...state, ...afterState].some((line) =>
    line.includes("useState"),
  );
  const importsBlock = [
    usageClientPrefix(includeUseState),
    ...extraImports,
    importLine(components),
    ...preamble,
    ...state,
    ...afterState,
  ]
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
      ...(s.highlightLabel
        ? [formatStringProp("highlightLabel", s.highlightLabel)]
        : []),
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

${
  includeSeries
    ? `const series = ${formatChartSeriesForUsage(chartDemoSeries)};

`
    : ""
}return <Chart${formatSelfClosing(props)};`;
  }

  switch (slug) {
    case "text-input": {
      const s = settings as ControlSettingsBySlug["text-input"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("type", "text"),
        ...(s.placeholderEnabled
          ? [formatStringProp("placeholder", s.placeholder)]
          : []),
        formatExpressionProp("value", state),
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.value)`,
        ),
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
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.value)`,
        ),
      ];
      return controlledFieldUsage(["TextField"], "TextField", state, props);
    }
    case "textarea": {
      const s = settings as ControlSettingsBySlug["textarea"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        ...(s.placeholderEnabled
          ? [formatStringProp("placeholder", s.placeholder)]
          : []),
        ...(s.maxCharsEnabled
          ? [formatNumberProp("maxChars", s.maxChars)]
          : []),
        formatExpressionProp("value", state),
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.value)`,
        ),
      ];
      return controlledFieldUsage(
        ["TextAreaField"],
        "TextAreaField",
        state,
        props,
      );
    }
    case "note-composer": {
      const s = settings as ControlSettingsBySlug["note-composer"];
      return interactiveUsage({
        components: ["NoteComposer"],
        state: ['const [note, setNote] = useState("");'],
        jsx: `<NoteComposer
  placeholder=${quote(s.placeholder)}
  saveButtonLabel=${quote(s.saveButtonLabel)}
  showAttach={${s.showAttach}}
  showMention={${s.showMention}}
  showEmoji={${s.showEmoji}}
  value={note}
  onChange={setNote}
  onSave={(value) => {
    console.log("Saved note", value);
    setNote("");
  }}
  onAttachClick={() => console.log("Attachment")}
  onMentionClick={() => console.log("Mention")}
  onEmojiSelect={(emoji) => console.log("Emoji", emoji)}
/>`,
      });
    }
    case "rich-text-field": {
      const s = settings as ControlSettingsBySlug["rich-text-field"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatNumberProp("minHeight", s.minHeight),
        ...(s.placeholderEnabled
          ? [formatStringProp("placeholder", s.placeholder)]
          : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(html) => ${toSetter(state)}(html)`),
      ];
      return controlledFieldUsage(
        ["RichTextField"],
        "RichTextField",
        state,
        props,
        {
          initial: quote(s.value),
        },
      );
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
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.value)`,
        ),
      ];
      return controlledFieldUsage(
        ["SelectField"],
        "SelectField",
        state,
        props,
        {
          initial: options[0] ? quote(options[0]) : '""',
        },
      );
    }
    case "country-picker": {
      const s = settings as ControlSettingsBySlug["country-picker"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        ...(s.placeholderEnabled
          ? [formatStringProp("placeholder", s.placeholder)]
          : []),
        formatStringProp("searchPlaceholder", s.searchPlaceholder),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", `(code) => ${toSetter(state)}(code)`),
      ];
      return controlledFieldUsage(
        ["CountryPickerField"],
        "CountryPickerField",
        state,
        props,
        {
          initial: quote(s.value),
        },
      );
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
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.value)`,
        ),
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
        ...(s.size && s.size !== "md"
          ? [formatStringProp("size", s.size)]
          : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];
      const children = radioOptions
        .map((option) => {
          const radioProps = [
            formatStringProp("value", option.value),
            ...(s.optionErrorsEnabled
              ? [formatStringProp("error", s.optionError)]
              : []),
          ];
          return `  <Radio${formatOpeningProps(radioProps)}>\n    ${option.label}\n  </Radio>`;
        })
        .join("\n");
      return controlledFieldUsage(
        ["Radio", "RadioGroup"],
        "RadioGroup",
        state,
        groupProps,
        {
          children,
          initial: quote(radioOptions[0]?.value ?? ""),
        },
      );
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
        ...(s.placeholderEnabled
          ? [formatStringProp("placeholder", s.placeholder)]
          : []),
        ...(s.disabled ? [formatBoolProp("disabled", true)] : []),
        ...(s.readOnly ? [formatBoolProp("readOnly", true)] : []),
        formatExpressionProp("value", state),
        formatExpressionProp("onChange", toSetter(state)),
      ];

      return controlledFieldUsage(["ChipInput"], "ChipInput", state, props, {
        initial: `[${chips.map((chip) => quote(chip)).join(", ")}]`,
      });
    }
    case "choice-chips": {
      const s = settings as ControlSettingsBySlug["choice-chips"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("options", "options"),
        ...(s.selectionMode !== "multiple"
          ? [formatStringProp("selectionMode", s.selectionMode)]
          : []),
        ...(s.variant !== "soft"
          ? [formatStringProp("variant", s.variant)]
          : []),
        ...(s.disabled ? [formatBoolProp("disabled", true)] : []),
        formatExpressionProp("value", state),
        formatExpressionProp(
          "onChange",
          `(next) => ${toSetter(state)}(Array.isArray(next) ? next : [next])`,
        ),
      ];

      return `${usageClientPrefix()}
${importLine(["ChoiceChips"])}

const options = ${formatChoiceChipOptionsForUsage(s.options)};

const [${state}, ${toSetter(state)}] = useState([${s.value.map((value) => quote(value)).join(", ")}]);

<ChoiceChips${formatSelfClosing(props)}`;
    }
    case "checkbox": {
      const s = settings as ControlSettingsBySlug["checkbox"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatStringProp("shape", s.shape),
        ...(s.size && s.size !== "md"
          ? [formatStringProp("size", s.size)]
          : []),
        formatExpressionProp("checked", state),
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.checked)`,
        ),
      ];
      return controlledFieldUsage(
        ["CheckboxField"],
        "CheckboxField",
        state,
        props,
        { initial: "false" },
      );
    }
    case "switch": {
      const s = settings as ControlSettingsBySlug["switch"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("checked", state),
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.checked)`,
        ),
      ];
      return controlledFieldUsage(
        ["SwitchField"],
        "SwitchField",
        state,
        props,
        { initial: "false" },
      );
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
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(Number(event.target.value))`,
        ),
      ];
      return controlledFieldUsage(["RangeField"], "RangeField", state, props, {
        initial: String(s.min),
      });
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
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(Number(event.target.value) || 0)`,
        ),
      ];
      return controlledFieldUsage(
        ["NumberField"],
        "NumberField",
        state,
        props,
        { initial: "0" },
      );
    }
    case "file-upload": {
      const s = settings as ControlSettingsBySlug["file-upload"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        ...(s.fileName ? [formatStringProp("fileName", s.fileName)] : []),
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.files?.[0]?.name ?? "")`,
        ),
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
        formatExpressionProp(
          "onCrop",
          `({ previewUrl }) => ${toSetter(state)}(previewUrl)`,
        ),
      ];
      return controlledFieldUsage(
        ["ImageCropUploadField"],
        "ImageCropUploadField",
        state,
        props,
        { initial: '""' },
      );
    }
    case "color-picker": {
      const s = settings as ControlSettingsBySlug["color-picker"];
      const state = toStateName(s.label);
      const props = [
        formatStringProp("id", id),
        ...fieldProps(s),
        formatExpressionProp("value", state),
        formatExpressionProp(
          "onChange",
          `(event) => ${toSetter(state)}(event.target.value)`,
        ),
      ];
      return controlledFieldUsage(["ColorField"], "ColorField", state, props, {
        initial: quote("#8f6cff"),
      });
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
        ...(s.showRequirements
          ? [formatBoolProp("showRequirements", true)]
          : []),
        formatExpressionProp("value", state),
        formatExpressionProp(
          "onChange",
          `(value) => ${toSetter(state)}(value)`,
        ),
      ];
      return controlledFieldUsage(
        ["PasswordStrengthField"],
        "PasswordStrengthField",
        state,
        props,
        {
          initial: quote(s.value),
        },
      );
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
      return controlledFieldUsage(
        ["RatingField"],
        "RatingField",
        state,
        props,
        {
          initial: String(s.value),
        },
      );
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
      return controlledFieldUsage(
        ["SliderRangeField"],
        "SliderRangeField",
        state,
        props,
        {
          initial: formatObjectLiteral(s.value),
        },
      );
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
        formatExpressionProp(
          "onChange",
          `(value) => ${toSetter(phoneState)}(value)`,
        ),
        formatExpressionProp(
          "onCountryCodeChange",
          `(code) => ${toSetter(countryState)}(code)`,
        ),
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
const [${state}, ${toSetter(state)}] = useState<string | null>(${s.value ? quote(s.value) : "null"});

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
      const buttonType =
        slug === "submit-button"
          ? "submit"
          : slug === "reset-button"
            ? "reset"
            : "button";
      const props = [
        formatStringProp("variant", s.variant),
        ...(buttonType !== "button"
          ? [formatStringProp("type", buttonType)]
          : []),
        ...(s.size && s.size !== "md"
          ? [formatStringProp("size", s.size)]
          : []),
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
      const secondary = s.secondaryValue ?? "#0284c7";
      const props = [
        formatStringProp("id", id),
        formatStringProp("label", s.label),
        formatStringProp("mode", s.mode),
        formatStringProp("labelPosition", s.labelPosition),
        formatExpressionProp("value", "accent"),
        formatExpressionProp("secondaryValue", "accentSecondary"),
        formatExpressionProp("onChange", "setAccent"),
        formatExpressionProp("onSecondaryChange", "setAccentSecondary"),
      ];
      return `${usageClientPrefix()}\nimport { AccentColorPicker, createAccentStyle } from "opus-react";

const [accent, setAccent] = useState(${quote(s.value)});
const [accentSecondary, setAccentSecondary] = useState(${quote(secondary)});
const accentStyle = createAccentStyle(accent, accentSecondary);

return (
  <div style={accentStyle}>
${formatSelfClosingElement("AccentColorPicker", props, "    ")}
  </div>
);`;
    }
    case "colour-clouds": {
      const s = settings as ControlSettingsBySlug["colour-clouds"];
      const props = [
        formatStringProp("label", s.label || "Demo colours"),
        s.compact ? formatExpressionProp("compact", "true") : null,
        formatExpressionProp("value", "clouds"),
        formatExpressionProp("open", "open"),
        formatExpressionProp("onOpenChange", "setOpen"),
      ].filter((prop): prop is string => Boolean(prop));
      const propLines = props.map((prop) => `    ${prop}`).join("\n");
      return `${usageClientPrefix()}\nimport { AccentColorPicker, ColourClouds, parseColourClouds } from "opus-react";

/** Lab demo data — not wired to app theme. */
const clouds = ${s.cloudsJson};
const [open, setOpen] = useState(${s.open ? "true" : "false"});
const [items, setItems] = useState(() => parseColourClouds(clouds).slice(0, 3));

return (
  <ColourClouds
${propLines}
  >
    {items.map((cloud, index) => (
      <AccentColorPicker
        key={cloud.id ?? index}
        label={cloud.label ?? \`Colour \${index + 1}\`}
        value={cloud.color}
        secondaryValue={cloud.secondary ?? cloud.color}
        variant="panel"
        onChange={(color) =>
          setItems((current) =>
            current.map((entry, i) => (i === index ? { ...entry, color } : entry)),
          )
        }
        onSecondaryChange={(secondary) =>
          setItems((current) =>
            current.map((entry, i) => (i === index ? { ...entry, secondary } : entry)),
          )
        }
      />
    ))}
  </ColourClouds>
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
        ...(s.dismissOnBackdrop
          ? []
          : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape
          ? []
          : [formatBoolProp("dismissOnEscape", false)]),
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
        ...(s.dismissOnBackdrop
          ? []
          : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape
          ? []
          : [formatBoolProp("dismissOnEscape", false)]),
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
          ? [
              "Button",
              "Drawer",
              "DrawerDefaultActions",
              "SelectField",
              "TextField",
            ]
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
          ? [
              `{ id: "archive", label: "Archive", disabled: true${s.showIcons ? ', icon: "⌁"' : ""} }`,
            ]
          : []),
        ...(s.showDestructive
          ? [
              `{ id: "delete", label: "Delete", destructive: true${s.showIcons ? ', icon: "!"' : ""} }`,
            ]
          : []),
      ];
      const props = [
        formatExpressionProp("open", "menuOpen"),
        formatStringProp("placement", s.placement),
        ...(s.closeOnOutside ? [] : [formatBoolProp("closeOnOutside", false)]),
        ...(s.closeOnEscape ? [] : [formatBoolProp("closeOnEscape", false)]),
        ...(s.closeOnSelect ? [] : [formatBoolProp("closeOnSelect", false)]),
        formatExpressionProp("items", "items"),
        formatExpressionProp(
          "trigger",
          '<Button variant="primary">Actions</Button>',
        ),
        formatExpressionProp("onOpenChange", "setMenuOpen"),
        formatExpressionProp("onSelect", "(item) => console.log(item.label)"),
      ];
      const menuProps = props.map((prop) => `  ${prop}`).join("\n");
      return interactiveUsage({
        components: ["Button", "DropdownMenu"],
        preamble: ["", "const items = [", `  ${items.join(",\n  ")},`, "];"],
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
          ? [
              `{ id: "archive", label: "Archive", disabled: true${s.showIcons ? ', icon: "⌁"' : ""} }`,
            ]
          : []),
        ...(s.showDestructive
          ? [
              `{ id: "delete", label: "Delete", destructive: true${s.showIcons ? ', icon: "!"' : ""} }`,
            ]
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
        ...(s.dismissOnBackdrop
          ? []
          : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape
          ? []
          : [formatBoolProp("dismissOnEscape", false)]),
        ...(s.closeOnSelect ? [] : [formatBoolProp("closeOnSelect", false)]),
        ...(s.showShortcuts ? [] : [formatBoolProp("showShortcuts", false)]),
        ...(s.showDescriptions
          ? []
          : [formatBoolProp("showDescriptions", false)]),
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
        ...(s.dismissOnBackdrop
          ? []
          : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape
          ? []
          : [formatBoolProp("dismissOnEscape", false)]),
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
          ? [
              "Button",
              "Modal",
              "ModalDefaultActions",
              "SelectField",
              "TextField",
            ]
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
        formatExpressionProp(
          "trigger",
          '<Button variant="primary">Open popover</Button>',
        ),
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
        ...(s.dismissible
          ? [
              formatBoolProp("dismissible", true),
              formatExpressionProp("onDismiss", "() => setAlertVisible(false)"),
            ]
          : []),
      ];
      return `${importLine(["Alert"])}\n\n<Alert${formatSelfClosing(props)}`;
    }
    case "toast": {
      const s = settings as ControlSettingsBySlug["toast"];
      const showProps = [
        formatStringProp("status", s.status),
        formatStringProp("title", s.title),
        ...(s.descriptionEnabled
          ? [formatStringProp("description", s.description)]
          : []),
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
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
        ...(s.media ? [formatExpressionProp("media", "<div />")] : []),
        ...(s.footerActions
          ? [formatStringProp("footer", "Updated 2 minutes ago")]
          : []),
        ...(s.footerActions
          ? [
              formatExpressionProp(
                "actions",
                '<Button variant="primary">Open</Button>',
              ),
            ]
          : []),
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
        formatExpressionProp(
          "icon",
          `<FontAwesomeIcon icon={${iconOption.importName}} />`,
        ),
        ...(s.showChange
          ? [
              formatStringProp("change", s.change),
              formatStringProp("trend", s.trend),
            ]
          : []),
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
      ];

      return `import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ${iconOption.importName} } from "@fortawesome/free-solid-svg-icons";
import "@/lib/fontawesome";
${wrapDashboardWidget(`<StatCard${formatSelfClosing(props)} />`, ["StatCard"], {
  width: s.width ?? "widget",
  wrap: s.wrapInContainer ?? true,
})}`;
    }
    case "sparkline": {
      const s = settings as ControlSettingsBySlug["sparkline"];
      return `const values = [18, 24, 21, 34, 29, 42, 38];

${wrapDashboardWidget(
  `<Sparkline label=${quote(s.label)} palette=${quote(s.palette)} values={values} variant="labeled" />`,
  ["Sparkline"],
  { width: s.width ?? "widget", wrap: s.wrapInContainer ?? true },
)}`;
    }
    case "progress-ring": {
      const s = settings as ControlSettingsBySlug["progress-ring"];
      return wrapDashboardWidget(
        `<ProgressRing label=${quote(s.label)} max={${s.max}} value={${s.value}} />`,
        ["ProgressRing"],
        { width: s.width ?? "widget", wrap: s.wrapInContainer ?? true },
      );
    }
    case "progress-bar": {
      const s = settings as ControlSettingsBySlug["progress-bar"];
      return wrapDashboardWidget(
        `<ProgressBar label=${quote(s.label)} max={${s.max}} value={${s.value}} />`,
        ["ProgressBar"],
        { width: s.width ?? "widget", wrap: s.wrapInContainer ?? true },
      );
    }
    case "gauge": {
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
        ...(s.variant !== "half"
          ? [formatStringProp("variant", s.variant)]
          : []),
        formatStringProp("change", s.change),
        formatStringProp("changeTrend", s.changeTrend),
        formatStringProp("summary", s.summary),
        ...(s.footerMetricCount > 0
          ? [formatExpressionProp("footer", "footerMetrics")]
          : []),
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
      ];

      if (s.footerMetricCount === 0) {
        const footerLines = gaugeFooter
          .map(
            (item) =>
              `//   { color: ${quote(item.color ?? "")}, label: ${quote(item.label)}, value: ${quote(item.value)}, trend: ${quote(item.trend ?? "up")} }`,
          )
          .join(",\n");

        return `${wrapDashboardWidget(
          `<Gauge${formatSelfClosing(props)}`,
          ["Gauge"],
          {
            width: s.width ?? "widget",
            wrap: s.wrapInContainer ?? true,
          },
        )}

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

${wrapDashboardWidget(`<Gauge${formatSelfClosing(props)}`, ["Gauge"], {
  width: s.width ?? "widget",
  wrap: s.wrapInContainer ?? true,
})}`;
    }
    case "speedometer": {
      const s = settings as ControlSettingsBySlug["speedometer"];
      return wrapDashboardWidget(
        `<Speedometer label=${quote(s.label)} max={${s.max}} value={${s.value}} />`,
        ["Speedometer"],
        { width: s.width ?? "widget", wrap: s.wrapInContainer ?? true },
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
  { width: s.width ?? "widget", wrap: s.wrapInContainer ?? true },
)}`;
    }
    case "map": {
      const s = settings as ControlSettingsBySlug["map"];
      return `${usageClientPrefix()}
${importLine((s.wrapInContainer ?? true) ? ["DashboardContentContainer", "Map"] : ["Map"])}

const markers = [
  { id: "birmingham", label: "Birmingham", description: "Central sales office", coordinates: [-1.8904, 52.4862], tone: "accent" },
  { id: "london", label: "London", description: "Customer success hub", coordinates: [-0.1276, 51.5072], tone: "blue" },
  { id: "manchester", label: "Manchester", description: "Northern operations", coordinates: [-2.2426, 53.4808], tone: "green" },
  { id: "bristol", label: "Bristol", description: "South West support centre", coordinates: [-2.5879, 51.4545], tone: "blue" },
  { id: "cardiff", label: "Cardiff", description: "Welsh regional office", coordinates: [-3.1791, 51.4816], tone: "warning" },
  { id: "edinburgh", label: "Edinburgh", description: "Scottish operations hub", coordinates: [-3.1883, 55.9533], tone: "accent" },
].slice(0, ${s.markerCount});

${s.wrapInContainer ?? true ? `<DashboardContentContainer width=${quote(s.width ?? "full")}>\n` : ""}<Map
  center={[${s.longitude}, ${s.latitude}]}
  zoom={${s.zoom}}
  markers={markers}
  interactive={${s.interactive}}
  showNavigation={${s.showNavigation}}
  showGeolocate={${s.showGeolocate ?? true}}
  showSearch={${s.showSearch ?? true}}
  showAttribution={${s.showAttribution}}
  showAddress={${s.showAddress ?? true}}
  showCoordinates={${(s.wrapInContainer ?? true) && (s.showCoordinates ?? true)}}
  showHotspots={${(s.wrapInContainer ?? true) && (s.showHotspots ?? true)}}
  onMarkerClick={(marker) => console.log(marker)}
/>${s.wrapInContainer ?? true ? "\n</DashboardContentContainer>" : ""}`;
    }
    case "dashboard-content-container": {
      const s =
        settings as ControlSettingsBySlug["dashboard-content-container"];
      return `${importLine(["DashboardContentContainer", "StatusIndicator"])}

<DashboardContentContainer${(s.height ?? "auto") !== "auto" ? ` height=${quote(s.height)}` : ""} paddingBottom={${s.paddingBottom ?? true}} paddingLeft={${s.paddingLeft ?? true}} paddingRight={${s.paddingRight ?? true}} paddingTop={${s.paddingTop ?? true}} title=${quote(s.title)} width=${quote(s.width ?? "widget")}>
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
  {
    dataComponent: "pipeline-overview",
    title: s.title,
    width: s.width ?? "widget",
    wrap: s.wrapInContainer ?? true,
  },
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
  {
    dataComponent: "deals-over-time",
    width: s.width ?? "widget",
    wrap: s.wrapInContainer ?? true,
  },
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
    case "lab-dashboard-list-columns": {
      const s = settings as ControlSettingsBySlug["dashboard-list-columns"];
      const containerWidth = s.width === "widget" ? "widget" : "full";
      return interactiveUsage({
        components: [
          "Columns",
          "DashboardContentContainer",
          "DealsOverTime",
          "RecentActivity",
          "TopPerformingUsers",
          "UpcomingTasks",
        ],
        extraImports: [
          'import { demoUpcomingTasks } from "./upcomingTasksDemoData";',
          'import { demoRecentActivity } from "./recentActivityDemoData";',
          'import { demoTopPerformingUsers } from "./topPerformingUsersDemoData";',
        ],
        state: ["const [tasks, setTasks] = useState(demoUpcomingTasks);"],
        jsx: `<Columns direction=${quote(s.layout === "stacked" ? "column" : "row")} columns={3} gap={16}>
  <DashboardContentContainer data-component=${quote("upcoming-tasks")} width=${quote(containerWidth)}>
    <UpcomingTasks
      title=${quote(s.upcomingTasksTitle)}
      footerLabel=${quote(s.upcomingTasksFooterLabel)}
      checkboxSize=${quote(s.checkboxSize ?? "md")}
      tasks={tasks}
      onFooterClick={() => console.log(${quote(s.upcomingTasksFooterLabel)})}
      onTaskClick={(task) => console.log(task.title)}
      onTaskCompleteChange={(task, completed) => {
        setTasks((current) =>
          current.map((entry) => (entry.id === task.id ? { ...entry, completed } : entry)),
        );
        console.log(completed ? \`Completed: \${task.title}\` : \`Reopened: \${task.title}\`);
      }}
    />
  </DashboardContentContainer>
  <DashboardContentContainer data-component=${quote("recent-activity")} width=${quote(containerWidth)}>
    <RecentActivity
      title=${quote(s.recentActivityTitle)}
      footerLabel=${quote(s.recentActivityFooterLabel)}
      items={demoRecentActivity}
      onFooterClick={() => console.log(${quote(s.recentActivityFooterLabel)})}
      onItemClick={(item) => console.log(item.title)}
    />
  </DashboardContentContainer>
  <DashboardContentContainer data-component=${quote("top-performing-users")} width=${quote(containerWidth)}>
    <TopPerformingUsers
      title=${quote(s.topPerformingUsersTitle)}
      footerLabel=${quote(s.topPerformingUsersFooterLabel)}
      users={demoTopPerformingUsers}
      onFooterClick={() => console.log(${quote(s.topPerformingUsersFooterLabel)})}
      onPersonClick={(person) => console.log(person.name)}
    />
  </DashboardContentContainer>
</Columns>`,
      });
    }
    case "lab-contact-details": {
      const s = settings as ControlSettingsBySlug["lab-contact-details"];
      const recordLabel = s.isStaffRecord ? "User" : "Contact";
      const collectionLabel = s.isStaffRecord ? "Users" : "Contacts";
      const collectionId = s.isStaffRecord ? "users" : "contacts";
      const notesBlock = s.showNotes
        ? `
  <ContactNotesActivity
    activeTab="${s.notesActiveTab ?? "notes"}"
    onAction={(action) => console.log(action)}
    onAddNote={(note) => console.log(note)}${s.notesTabsVariant !== "card" ? `\n    tabsVariant="${s.notesTabsVariant}"` : ""}
  />`
        : "";
      return interactiveUsage({
        components: ["ContactDetails", "ContactNotesActivity", "PageHeader", "Breadcrumb"],
        state: [],
        jsx: `<div style={{ display: "grid", gap: 18, width: "100%" }}>
  <PageHeader
    title="${recordLabel} Details"
    breadcrumbs={
      <Breadcrumb
        separator="›"
        items={[
          { id: "${collectionId}", href: "#${collectionId}", label: "${collectionLabel}" },
          { id: "current", label: "Emma Winterhold-Smith" },
        ]}
      />
    }
  />
  <ContactDetails
    isStaffRecord={${s.isStaffRecord ?? false}}
    showActions={${s.showActions}}
    showStatus={${s.showStatus}}${s.summaryTabsVariant !== "card" ? `\n    tabsVariant="${s.summaryTabsVariant}"` : ""}
    onAction={(action) => console.log(action)}
    onAvatarChange={(previewUrl) => console.log(previewUrl)}
    onPasswordReset={() => console.log("reset-password")}
  />${notesBlock}
</div>`,
      });
    }
    case "lab-contact-card": {
      const s = settings as ControlSettingsBySlug["lab-contact-card"];
      const recordLabel = s.isStaffRecord ? "User" : "Contact";
      const collectionLabel = s.isStaffRecord ? "Users" : "Contacts";
      const collectionId = s.isStaffRecord ? "users" : "contacts";
      return interactiveUsage({
        components: ["ContactDetails", "PageHeader", "Breadcrumb"],
        state: [],
        jsx: `<div style={{ display: "grid", gap: 18, width: "100%" }}>
  <PageHeader
    title="${recordLabel} Card"
    breadcrumbs={
      <Breadcrumb
        separator="›"
        items={[
          { id: "${collectionId}", href: "#${collectionId}", label: "${collectionLabel}" },
          { id: "current", label: "Emma Winterhold-Smith" },
        ]}
      />
    }
  />
  <ContactDetails
    isStaffRecord={${s.isStaffRecord ?? false}}
    showActions={${s.showActions}}
    showStatus={${s.showStatus}}${s.summaryTabsVariant !== "card" ? `\n    tabsVariant="${s.summaryTabsVariant}"` : ""}
    onAction={(action) => console.log(action)}
    onAvatarChange={(previewUrl) => console.log(previewUrl)}
    onPasswordReset={() => console.log("reset-password")}
  />
</div>`,
      });
    }
    case "lab-contact-notes":
    case "lab-notes-activity": {
      const s = settings as ControlSettingsBySlug["notes-activity"];
      const tabsVariantProp =
        (s.tabsVariant ?? "card") !== "card" ? `\n  tabsVariant="${s.tabsVariant}"` : "";
      const activeTabProp =
        (s.activeTab ?? "notes") !== "notes" ? `\n  activeTab="${s.activeTab}"` : "";
      const widget = `<ContactNotesActivity
  onAction={(action) => console.log(action)}
  onAddNote={(note) => console.log(note)}${activeTabProp}${tabsVariantProp}
/>`;
      return interactiveUsage({
        components: ["ContactNotesActivity", "NotesActivity", "Tabs"],
        state: [],
        jsx: widget,
      });
    }
    case "lab-dashboard-welcome": {
      const s = settings as ControlSettingsBySlug["lab-dashboard-welcome"];
      const greetingProp = s.greeting === "auto"
        ? ""
        : `\n      greeting=${quote(`Good ${s.greeting}`)}`;
      const widget = `<section style={{ display: "grid", gap: 24, minWidth: 0 }}>
  <div style={{ alignItems: "flex-start", display: "flex", gap: 24, justifyContent: "space-between" }}>
    <WelcomeMessage
      name=${quote(s.name)}${greetingProp}
      showWave={${s.showWave}}
      subtitle=${quote(s.subtitle)}
    />
    ${s.showDate ? `<time style={{ alignItems: "center", background: "color-mix(in srgb, var(--dashboard-section-panel, var(--opus-panel)) 88%, transparent)", border: "1px solid var(--dashboard-section-border, var(--opus-border))", borderRadius: 10, color: "var(--dashboard-section-muted, var(--opus-muted))", display: "inline-flex", fontSize: "0.84rem", fontWeight: 650, gap: 10, minHeight: 44, padding: "0 16px", whiteSpace: "nowrap" }}>
      <span style={{ display: "inline-flex", flex: "0 0 16px", fontSize: 16, height: 16, width: 16 }}>
        <CatalogIcon iconName="calendar" />
      </span>
      {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", weekday: "long", year: "numeric" }).format(new Date())}
    </time>` : ""}
  </div>
  <Tiles items={quickActions} layout=${quote(s.tileLayout)} />
</section>`;
      return interactiveUsage({
        components: s.wrapInContainer
          ? ["CatalogIcon", "DashboardContentContainer", "Tiles", "WelcomeMessage"]
          : ["CatalogIcon", "Tiles", "WelcomeMessage"],
        preamble: [
          `const quickActions = [
  { id: "contacts", icon: "users", label: "Contact Manager", tone: "purple" },
  { id: "product-catalogues", icon: "boxes-stacked", label: "Product Catalogues", tone: "blue" },
  { id: "my-catalogue", icon: "book-open", label: "My Catalogue", tone: "purple" },
  { id: "opportunities", icon: "chart-line", label: "Sales Opportunities", tone: "blue" },
  { id: "communication", icon: "comments", label: "Communication", tone: "purple" },
  { id: "quotations", icon: "file-lines", label: "Quotations", tone: "blue" },
  { id: "sales-orders", icon: "cart-shopping", label: "Sales Orders", tone: "purple" },
  { id: "sales-invoices", icon: "file-invoice-dollar", label: "Sales Invoices", tone: "blue" },
  { id: "appointment-diary", icon: "calendar-days", label: "Appointment Diary", tone: "purple" },
  { id: "system-config", icon: "gears", label: "System Config", tone: "blue" },
  { id: "stock-control", icon: "warehouse", label: "Stock Control", tone: "purple" },
].map((item) => ({ ...item, onClick: () => console.log(item.label) }));`,
        ],
        state: [],
        jsx: s.wrapInContainer
          ? `<DashboardContentContainer data-component="dashboard-welcome" width="full">\n  ${widget.replaceAll("\n", "\n  ")}\n</DashboardContentContainer>`
          : widget,
      });
    }
    case "lab-login-form":
    case "lab-register-form":
    case "lab-otp-form":
    case "lab-passkey-login-form":
    case "lab-social-auth-form":
    case "lab-social-register-form": {
      const s = settings as ControlSettingsBySlug["lab-login-form"];
      const isSocialRegister = slug === "lab-social-register-form";
      const isRegister = slug === "lab-register-form" || isSocialRegister;
      const isOtp = slug === "lab-otp-form";
      const isPasskey = slug === "lab-passkey-login-form";
      const isSocial = slug === "lab-social-auth-form" || isSocialRegister;
      if (isOtp) {
        return interactiveUsage({
          components: ["Button", "DashboardContentContainer"],
          state: [`const [code, setCode] = useState(${quote(s.verificationCode)});`],
          jsx: `<DashboardContentContainer data-component="otp-form" width="widget">
  <form onSubmit={(event) => { event.preventDefault(); console.log("Verify code", code); }} style={{ display: "grid", gap: 16 }}>
    <img alt="Opus" src="/opus-logo.png" style={{ display: "block", height: "auto", margin: "0 auto", width: "12rem" }} />
    <header style={{ display: "grid", gap: 6, textAlign: "center" }}>
      <h2 style={{ margin: 0 }}>${s.title}</h2>
      <p style={{ margin: 0, color: "var(--opus-muted)" }}>${s.subtitle}</p>
    </header>
    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
      <legend style={{ marginBottom: 8, fontWeight: 650 }}>Six-digit verification code</legend>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
        {Array.from({ length: 6 }, (_, index) => (
          <input
            aria-label={\`Digit \${index + 1} of 6\`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            inputMode="numeric"
            key={index}
            maxLength={1}
            onChange={(event) => {
              const rawDigits = event.target.value.replace(/\\D/g, "");
              const inputs = Array.from(event.currentTarget.parentElement?.querySelectorAll("input") ?? []);
              if (rawDigits.length > 1) {
                const nextCode = rawDigits.slice(0, 6);
                setCode(nextCode);
                requestAnimationFrame(() => inputs[Math.min(nextCode.length, 5)]?.focus());
                return;
              }
              const digits = code.padEnd(6, " ").split("");
              digits[index] = rawDigits.slice(-1) || " ";
              setCode(digits.join("").trimEnd());
              if (rawDigits) requestAnimationFrame(() => inputs[index + 1]?.focus());
            }}
            onKeyDown={(event) => {
              if (event.key !== "Backspace" || event.currentTarget.value) return;
              const inputs = Array.from(event.currentTarget.parentElement?.querySelectorAll("input") ?? []);
              inputs[index - 1]?.focus();
            }}
            onPaste={(event) => {
              const nextCode = event.clipboardData.getData("text").replace(/\\D/g, "").slice(0, 6);
              if (!nextCode) return;
              event.preventDefault();
              const inputs = Array.from(event.currentTarget.parentElement?.querySelectorAll("input") ?? []);
              setCode(nextCode);
              requestAnimationFrame(() => inputs[Math.min(nextCode.length, 5)]?.focus());
            }}
            pattern="[0-9]*"
            value={code[index] ?? ""}
          />
        ))}
      </div>
    </fieldset>
    <Button type="submit">${s.submitLabel}</Button>
    <Button onClick={() => console.log("Resend code")} type="button" variant="link">Resend code</Button>
  </form>
</DashboardContentContainer>`,
        });
      }
      if (isPasskey) {
        return interactiveUsage({
          components: ["Button", "CatalogIcon", "DashboardContentContainer"],
          state: [],
          jsx: `<DashboardContentContainer data-component="passkey-login-form" width="widget">
  <form onSubmit={(event) => { event.preventDefault(); console.log("Start passkey sign-in"); }} style={{ display: "grid", gap: 16 }}>
    <img alt="Opus" src="/opus-logo.png" style={{ display: "block", height: "auto", margin: "0 auto", width: "12rem" }} />
    <header style={{ display: "grid", gap: 6, textAlign: "center" }}>
      <h2 style={{ margin: 0 }}>${s.title}</h2>
      <p style={{ margin: 0, color: "var(--opus-muted)" }}>${s.subtitle}</p>
    </header>
    <div aria-hidden="true" style={{ alignItems: "center", background: "color-mix(in srgb, var(--opus-accent) 12%, var(--opus-input-bg))", border: "1px solid color-mix(in srgb, var(--opus-accent) 40%, var(--opus-border))", borderRadius: "50%", color: "var(--opus-accent)", display: "flex", fontSize: 36, height: 80, justifyContent: "center", margin: "4px auto", width: 80 }}>
      <CatalogIcon iconName="fingerprint" />
    </div>
    <Button type="submit">${s.submitLabel}</Button>
    <Button onClick={() => console.log("Use password")} type="button" variant="link">Use password instead</Button>
  </form>
</DashboardContentContainer>`,
        });
      }
      if (isSocial) {
        return interactiveUsage({
          components: ["Button", "CheckboxField", "DashboardContentContainer", "TextField"],
          state: [
            `const [email, setEmail] = useState(${quote(s.email)});`,
            ...(isSocialRegister ? [`const [name, setName] = useState(${quote(s.name)});`] : []),
            `const [password, setPassword] = useState(${quote(s.password)});`,
            ...(isSocialRegister ? [`const [confirmPassword, setConfirmPassword] = useState(${quote(s.confirmPassword)});`] : []),
            `const [remember, setRemember] = useState(${s.remember});`,
          ],
          jsx: `<DashboardContentContainer data-component="${isSocialRegister ? "social-register-form" : "social-auth-form"}" width="widget">
  <form onSubmit={(event) => { event.preventDefault(); console.log("${isSocialRegister ? "Create account" : "Sign in"}", { email${isSocialRegister ? ", name" : ""} }); }} style={{ display: "grid", gap: 16 }}>
    <img alt="Opus" src="/opus-logo.png" style={{ display: "block", height: "auto", margin: "0 auto", width: "12rem" }} />
    <header style={{ display: "grid", gap: 6, textAlign: "center" }}>
      <h2 style={{ margin: 0 }}>${s.title}</h2>
      <p style={{ margin: 0, color: "var(--opus-muted)" }}>${s.subtitle}</p>
    </header>
    <button onClick={() => console.log("${isSocialRegister ? "Sign up with Google" : "Continue with Google"}")} style={{ alignItems: "center", background: "#fff", border: "1px solid #747775", borderRadius: 4, color: "#1f1f1f", cursor: "pointer", display: "flex", font: "500 14px Arial, sans-serif", gap: 12, justifyContent: "center", minHeight: 44, width: "100%" }} type="button">
      <svg aria-hidden="true" height="18" viewBox="0 0 18 18" width="18"><path d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.482h4.844c-.209 1.125-.843 2.078-1.797 2.716v2.258h2.909c1.702-1.567 2.684-3.874 2.684-6.615Z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.258c-.806.54-1.835.859-3.047.859-2.344 0-4.329-1.585-5.037-3.711H.956v2.333C2.437 15.983 5.482 18 9 18Z" fill="#34A853"/><path d="M3.963 10.71A5.423 5.423 0 0 1 3.68 9c0-.593.103-1.17.283-1.71V4.957H.956A9.002 9.002 0 0 0 0 9c0 1.451.347 2.827.956 4.043l3.007-2.333Z" fill="#FBBC05"/><path d="M9 3.579c1.321 0 2.508.454 3.44 1.346l2.582-2.581C13.464.892 11.426 0 9 0 5.482 0 2.437 2.017.956 4.957L3.963 7.29C4.67 5.164 6.656 3.579 9 3.579Z" fill="#EA4335"/></svg>
      ${isSocialRegister ? "Sign up with Google" : "Continue with Google"}
    </button>
    <button onClick={() => console.log("${isSocialRegister ? "Sign up with Apple" : "Continue with Apple"}")} style={{ alignItems: "center", background: "#000", border: "1px solid #000", borderRadius: 4, color: "#fff", cursor: "pointer", display: "flex", font: "500 15px -apple-system, BlinkMacSystemFont, sans-serif", gap: 12, justifyContent: "center", minHeight: 44, width: "100%" }} type="button">
      <svg aria-hidden="true" height="19" viewBox="0 0 384 512" width="15"><path d="M319.1 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7-55.8.9-115.1 44.5-115.1 133.2 0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zM262.5 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" fill="currentColor"/></svg>
      ${isSocialRegister ? "Sign up with Apple" : "Continue with Apple"}
    </button>
    <div role="separator" style={{ color: "var(--opus-muted)", textAlign: "center" }}>or continue with email</div>
    ${isSocialRegister ? '<TextField id="social-name" label="Full name" required type="text" value={name} onChange={(event) => setName(event.target.value)} />' : ""}
    <TextField id="social-email" label="Email address" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
    <TextField id="social-password" label="Password" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
    ${isSocialRegister ? '<TextField id="social-confirm-password" label="Confirm password" required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />' : ""}
    <CheckboxField checked={remember} fitContent id="social-remember" label="${isSocialRegister ? "I agree to the terms" : "Remember me"}" labelPosition="right" onChange={(event) => setRemember(event.target.checked)} />
    <Button type="submit">${s.submitLabel}</Button>
    <Button onClick={() => console.log("${isSocialRegister ? "Sign in" : "Create account"}")} type="button" variant="link">${isSocialRegister ? "Sign in" : "Create an account"}</Button>
  </form>
</DashboardContentContainer>`,
        });
      }
      return interactiveUsage({
        components: ["Button", "CheckboxField", "DashboardContentContainer", "TextField"],
        state: [
          `const [email, setEmail] = useState(${quote(s.email)});`,
          `const [name, setName] = useState(${quote(s.name)});`,
          `const [password, setPassword] = useState(${quote(s.password)});`,
          `const [confirmPassword, setConfirmPassword] = useState(${quote(s.confirmPassword)});`,
          `const [remember, setRemember] = useState(${s.remember});`,
        ],
        jsx: `<DashboardContentContainer data-component="${isRegister ? "register-form" : "login-form"}" width="widget">
  <form onSubmit={(event) => { event.preventDefault(); console.log(${isRegister ? '"Create account"' : '"Sign in"'}, { email${isRegister ? ", name" : ""} }); }} style={{ display: "grid", gap: 16 }}>
    <img alt="Opus" src="/opus-logo.png" style={{ display: "block", height: "auto", margin: "0 auto", width: "12rem" }} />
    <header style={{ display: "grid", gap: 6, textAlign: "center" }}>
      <h2 style={{ margin: 0 }}>${s.title}</h2>
      <p style={{ margin: 0, color: "var(--opus-muted)" }}>${s.subtitle}</p>
    </header>
    ${isRegister ? '<TextField id="register-name" label="Full name" required type="text" value={name} onChange={(event) => setName(event.target.value)} />' : ""}
    <TextField id="auth-email" label="Email address" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
    <TextField id="auth-password" label="Password" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
    ${isRegister ? '<TextField id="register-confirm-password" label="Confirm password" required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />' : ""}
    <CheckboxField checked={remember} fitContent id="auth-consent" label="${isRegister ? "I agree to the terms" : "Remember me"}" labelPosition="right" onChange={(event) => setRemember(event.target.checked)} />
    <Button type="submit">${s.submitLabel}</Button>
  </form>
</DashboardContentContainer>`,
      });
    }
    case "lab-test-layout": {
      const s = settings as ControlSettingsBySlug["lab-test-layout"];
      return interactiveUsage({
        components: [
          "ApplicationFooter",
          "ApplicationHeader",
          "CatalogIcon",
          "CustomScrollbar",
          "DashboardContentContainer",
          "DealsOverTime",
          "Icon",
          "NotesActivity",
          "PipelineOverview",
          "RecentActivity",
          "Sidebar",
          "StatTiles",
          "TopPerformingUsers",
          "ThreePaneLayout",
          "Tiles",
          "Tooltip",
          "UpcomingTasks",
          "WelcomeMessage",
        ],
        preamble: [
          `const menu = ${JSON.stringify(testLayoutMenu, null, 2)};`,
          `const activity = ${JSON.stringify(demoNotesActivity, null, 2)};`,
          `const homeTiles = [
  { id: "contacts", icon: "users", label: "Contact Manager", tone: "purple" },
  { id: "product-catalogues", icon: "boxes-stacked", label: "Product Catalogues", tone: "blue" },
  { id: "my-catalogue", icon: "book-open", label: "My Catalogue", tone: "purple" },
  { id: "opportunities", icon: "chart-line", label: "Sales Opportunities", tone: "blue" },
  { id: "communication", icon: "comments", label: "Communication", tone: "purple" },
  { id: "quotations", icon: "file-lines", label: "Quotations", tone: "blue" },
  { id: "sales-orders", icon: "cart-shopping", label: "Sales Orders", tone: "purple" },
  { id: "sales-invoices", icon: "file-invoice-dollar", label: "Sales Invoices", tone: "blue" },
  { id: "appointment-diary", icon: "calendar-days", label: "Appointment Diary", tone: "purple" },
  { id: "system-config", icon: "gears", label: "System Config", tone: "blue" },
  { id: "stock-control", icon: "warehouse", label: "Stock Control", tone: "purple" },
];`,
          `const pipelineStages = ${JSON.stringify(demoPipelineStages, null, 2)};`,
          `const dealsData = ${JSON.stringify(getDealsOverTimeDemoData("This Year"), null, 2)};`,
          `const upcomingTasks = ${JSON.stringify(demoUpcomingTasks, null, 2)};`,
          `const recentActivity = ${JSON.stringify(demoRecentActivity, null, 2)};`,
          `const topPerformers = ${JSON.stringify(demoTopPerformingUsers, null, 2)};`,
          `const homeStats = [
  { id: "total-contacts", label: "Total Contacts", value: "2,543", icon: "user", tone: "blue", trend: "up", trendValue: "12.5%", comparison: "vs last 30 days" },
  { id: "open-deals", label: "Open Deals", value: "127", icon: "sack-dollar", tone: "blue", trend: "up", trendValue: "8.2%", comparison: "vs last 30 days" },
  { id: "pipeline-value", label: "Pipeline Value", value: "£2.48M", icon: "chart-line", tone: "blue", trend: "up", trendValue: "15.3%", comparison: "vs last 30 days" },
  { id: "tasks-due", label: "Tasks Due Today", value: "18", icon: "list-check", tone: "blue", trend: "up", trendTone: "warning", trendValue: "3", comparison: "vs yesterday" },
  { id: "won-deals", label: "Won Deals (30d)", value: "23", icon: "trophy", tone: "blue", trend: "up", trendValue: "27.8%", comparison: "vs last 30 days" },
  { id: "conversion-rate", label: "Conversion Rate", value: "18.6%", icon: "chart-pie", tone: "blue", trend: "up", trendValue: "2.4%", comparison: "vs last 30 days" },
];`,
        ],
        state: [
          "const [sidebarCollapsed, setSidebarCollapsed] = useState(false);",
          "const [rightCollapsed, setRightCollapsed] = useState(false);",
          'const [rightTab, setRightTab] = useState("notes");',
          'const [headerSearch, setHeaderSearch] = useState("");',
          'const [workspaceLabel, setWorkspaceLabel] = useState("CRM");',
          'const [dashboardPeriod, setDashboardPeriod] = useState("This Year");',
          "const [dashboardTasks, setDashboardTasks] = useState(upcomingTasks);",
        ],
        jsx: `<div style={{ display: "grid", gridTemplateRows: "auto minmax(0, 1fr) auto", height: "100%" }}>
  <ApplicationHeader
    actions={[
      { id: "notifications", iconName: "bell", label: "Notifications", count: 8 },
      { id: "messages", iconName: "envelope", label: "Messages", count: 3 },
      { id: "calendar", iconName: "calendar", label: "Calendar", group: "utility" },
    ]}
    createItems={[
      { id: "company", label: "Add Company", iconName: "building", onSelect: () => console.log("Add Company") },
      { id: "contact", label: "Add Contact", iconName: "user-plus", onSelect: () => console.log("Add Contact") },
      { id: "task", label: "Add Task", iconName: "list-check", onSelect: () => console.log("Add Task") },
    ]}
    connected
    onSearchChange={setHeaderSearch}
    profile={{ name: "Carl Fearby", role: "Administrator", src: "/user-profile-carl.png" }}
    searchValue={headerSearch}
  />
  <ThreePaneLayout
    defaultLeftWidth={${s.defaultLeftWidth}}
    defaultRightWidth={${s.defaultRightWidth}}
    handleBackground="none"
    handleBorderRadius={${s.handleBorderRadius ?? 12}}
    handleHeight=${quote(s.handleHeight)}
    handleMarginBlock={${s.handleMarginBlock ?? 12}}
    leftCollapsed={sidebarCollapsed}
    minLeftWidth={${s.minLeftWidth === 180 ? 120 : s.minLeftWidth}}
    onLeftCollapsedChange={setSidebarCollapsed}
    onRightCollapsedChange={setRightCollapsed}
    minRightWidth={${Math.max(s.minRightWidth, 220)}}
    persist={${s.persist}}
    storageKey="crm-test-layout"
    rightCollapsed={rightCollapsed}
    style={{ height: "calc(100% - 8px)", minHeight: 0, marginTop: 8 }}
    left={
      <DashboardContentContainer data-component="sidebar" height="full" paddingLeft={false} paddingRight={false} width="full">
        <Sidebar
          collapsed={sidebarCollapsed}
          defaultActiveItem="dashboard"
          footer={
            <button
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((current) => !current)}
              style={{ alignItems: "center", background: "transparent", border: 0, color: "inherit", display: "flex", gap: 8, height: 32, justifyContent: sidebarCollapsed ? "center" : "flex-start", padding: "0 8px", width: "100%" }}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              type="button"
            >
              <Icon name={sidebarCollapsed ? "indent" : "outdent"} size="sm" />
              {sidebarCollapsed ? null : <span>Collapse</span>}
            </button>
          }
          footerPaddingLeft
          footerPaddingRight
          menu={menu}
          onSelect={(item) => setWorkspaceLabel(String(item.label))}
          paddingLeft
          paddingRight
          persistState={${s.persist}}
          renderIcon={(name) => <CatalogIcon iconName={name} />}
          storageKey="crm-test-layout-menu"
        />
      </DashboardContentContainer>
    }
    right={
      <DashboardContentContainer data-component="notes-activity" height="full" width="full">
        <div style={{ display: "grid", gridTemplateRows: "minmax(0, 1fr) auto", height: "100%", minHeight: 0, overflow: "hidden" }}>
          {rightCollapsed ? (
            <nav aria-label="Notes and activity shortcuts" style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              {[
                { icon: "note-sticky", label: "Notes", tab: "notes" },
                { icon: "clock-rotate-left", label: "Activity", tab: "activity" },
              ].map((item) => (
                <Tooltip content={item.label} key={item.tab} placement="left">
                  <button
                    aria-label={\`Open \${item.label}\`}
                    onClick={() => { setRightTab(item.tab); setRightCollapsed(false); }}
                    style={{ alignItems: "center", background: "transparent", border: "1px solid transparent", borderRadius: 8, color: "inherit", display: "inline-flex", height: 32, justifyContent: "center", padding: 0, width: 32 }}
                    type="button"
                  >
                    <Icon name={item.icon} size="sm" />
                  </button>
                </Tooltip>
              ))}
            </nav>
          ) : (
            <NotesActivity
              activeTab={rightTab}
              items={activity}
              notesFooterLabel="View all notes"
              activityFooterLabel="View all activities"
              onTabChange={setRightTab}
              saveButtonLabel="Save"
            />
          )}
          <button
            aria-label={rightCollapsed ? "Expand notes and activity" : "Collapse notes and activity"}
            onClick={() => setRightCollapsed((current) => !current)}
            style={{ alignItems: "center", background: "transparent", border: 0, borderTop: "1px solid var(--opus-border)", color: "inherit", display: "flex", flexShrink: 0, gap: 8, height: 40, justifyContent: rightCollapsed ? "center" : "flex-end", margin: rightCollapsed ? "0 auto" : 0, padding: rightCollapsed ? 0 : "8px 8px 0", width: rightCollapsed ? 28 : "100%" }}
            type="button"
          >
            <Icon name={rightCollapsed ? "outdent" : "indent"} size="sm" />
            {rightCollapsed ? null : <span>Collapse</span>}
          </button>
        </div>
      </DashboardContentContainer>
    }
  >
    <DashboardContentContainer data-component="crm-workspace" height="full" paddingBottom={false} paddingLeft={false} paddingRight={false} paddingTop={false} width="full">
      <CustomScrollbar label="CRM workspace content" orientation="vertical" trackInset={${s.workspaceScrollbarInset ?? -1}}>
      <div style={{ minHeight: "100%", padding: "14px 16px 12px" }}>
      {workspaceLabel === "CRM" || workspaceLabel === "Dashboard" ? (
        <main>
          <div style={{ alignItems: "start", display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
            <WelcomeMessage name="Carl" subtitle="Here’s what’s happening with your CRM today." />
            <time style={{ alignItems: "center", background: "color-mix(in srgb, var(--dashboard-section-panel, var(--opus-panel)) 88%, transparent)", border: "1px solid var(--dashboard-section-border, var(--opus-border))", borderRadius: 10, color: "var(--dashboard-section-muted, var(--opus-muted))", display: "inline-flex", fontSize: "0.84rem", fontWeight: 650, gap: 10, minHeight: 44, padding: "0 16px", whiteSpace: "nowrap" }}>
              <span style={{ display: "inline-flex", flex: "0 0 16px", fontSize: 16, height: 16, width: 16 }}>
                <CatalogIcon iconName="calendar" />
              </span>
              {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", weekday: "long", year: "numeric" }).format(new Date())}
            </time>
          </div>
          <Tiles
            items={homeTiles.map((item) => ({ ...item, onClick: () => console.log(item.label) }))}
            layout="fill"
          />
          <div style={{ marginTop: 18, padding: 12, border: "1px solid var(--opus-border)", borderRadius: 14 }}>
            <StatTiles items={homeStats} layout="fill" />
          </div>
          <section aria-label="CRM charts" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginTop: 18 }}>
            <DashboardContentContainer data-component="pipeline-overview" title="Pipeline Overview" width="full">
              <PipelineOverview
                period="This Month"
                stages={pipelineStages}
                totalLabel="Total Pipeline Value"
                totalValue="£2,480,000"
              />
            </DashboardContentContainer>
            <DashboardContentContainer data-component="deals-over-time" width="full">
              <DealsOverTime
                data={dealsData}
                onPeriodChange={setDashboardPeriod}
                period={dashboardPeriod}
              />
            </DashboardContentContainer>
          </section>
          <section aria-label="CRM dashboard lists" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 18 }}>
            <DashboardContentContainer data-component="upcoming-tasks" width="full">
              <UpcomingTasks
                onTaskCompleteChange={(task, completed) => setDashboardTasks((current) => current.map((entry) => entry.id === task.id ? { ...entry, completed } : entry))}
                tasks={dashboardTasks}
              />
            </DashboardContentContainer>
            <DashboardContentContainer data-component="recent-activity" width="full">
              <RecentActivity items={recentActivity} />
            </DashboardContentContainer>
            <DashboardContentContainer data-component="top-performing-users" width="full">
              <TopPerformingUsers title="Top Performing Users" users={topPerformers} />
            </DashboardContentContainer>
          </section>
        </main>
      ) : (
        <main>
          <p style={{ color: "var(--opus-accent)", fontWeight: 700 }}>{workspaceLabel} workspace</p>
          <h2>{workspaceLabel}</h2>
          <p>The centre workspace remains fluid between both resizable panes.</p>
        </main>
      )}
      </div>
      </CustomScrollbar>
    </DashboardContentContainer>
  </ThreePaneLayout>
  <div style={{ marginTop: 8 }}>
    <ApplicationFooter
      actions={[
        { id: "help", iconName: "circle-question", label: "Help", onSelect: () => console.log("Help") },
        { id: "guide", iconName: "book-open", label: "User guide", onSelect: () => console.log("User guide") },
        { id: "settings", iconName: "gear", label: "Settings", onSelect: () => console.log("Settings") },
      ]}
      productName="CRM"
      version="v1.0.0"
    />
  </div>
</div>`,
      });
    }
    case "upcoming-tasks": {
      const s = settings as ControlSettingsBySlug["upcoming-tasks"];
      const wrap = s.wrapInContainer ?? true;
      const widget = `<UpcomingTasks
  title=${quote(s.title)}
  footerLabel=${quote(s.footerLabel)}
  checkboxSize=${quote(s.checkboxSize ?? "md")}
  tasks={tasks}
  onFooterClick={() => console.log(${quote(s.footerLabel)})}
  onTaskClick={(task) => console.log(task.title)}
  onTaskCompleteChange={(task, completed) => {
    setTasks((current) =>
      current.map((entry) => (entry.id === task.id ? { ...entry, completed } : entry)),
    );
    console.log(completed ? \`Completed: \${task.title}\` : \`Reopened: \${task.title}\`);
  }}
/>`;
      return interactiveUsage({
        components: wrap
          ? ["DashboardContentContainer", "UpcomingTasks"]
          : ["UpcomingTasks"],
        preamble: [
          `const initialTasks = ${JSON.stringify(demoUpcomingTasks, null, 2)};`,
        ],
        state: ["const [tasks, setTasks] = useState(initialTasks);"],
        jsx: maybeWrapDashboardContent(widget, {
          dataComponent: "upcoming-tasks",
          width: s.width ?? "widget",
          wrap,
        }),
      });
    }
    case "recent-activity": {
      const s = settings as ControlSettingsBySlug["recent-activity"];
      const wrap = s.wrapInContainer ?? true;
      const widget = `<RecentActivity
  title=${quote(s.title)}
  footerLabel=${quote(s.footerLabel)}
  items={activity}
  onFooterClick={() => console.log(${quote(s.footerLabel)})}
  onItemClick={(item) => console.log(item.title)}
/>`;
      return interactiveUsage({
        components: wrap
          ? ["DashboardContentContainer", "RecentActivity"]
          : ["RecentActivity"],
        preamble: [
          `const activity = ${JSON.stringify(demoRecentActivity, null, 2)};`,
        ],
        state: [],
        jsx: maybeWrapDashboardContent(widget, {
          dataComponent: "recent-activity",
          width: s.width ?? "widget",
          wrap,
        }),
      });
    }
    case "top-performing-users": {
      const s = settings as ControlSettingsBySlug["top-performing-users"];
      const wrap = s.wrapInContainer ?? true;
      const widget = `<TopPerformingUsers
  title=${quote(s.title)}
  footerLabel=${quote(s.footerLabel)}
  users={users}
  onFooterClick={() => console.log(${quote(s.footerLabel)})}
  onPersonClick={(person) => console.log(person.name)}
/>`;
      return interactiveUsage({
        components: wrap
          ? ["DashboardContentContainer", "TopPerformingUsers"]
          : ["TopPerformingUsers"],
        preamble: [
          `const users = ${JSON.stringify(demoTopPerformingUsers, null, 2)};`,
        ],
        state: [],
        jsx: maybeWrapDashboardContent(widget, {
          dataComponent: "top-performing-users",
          width: s.width ?? "widget",
          wrap,
        }),
      });
    }
    case "user-profile":
    case "lab-user-profile": {
      const s = settings as ControlSettingsBySlug["user-profile"];
      const menuItems = parseUserProfileMenuItems(s.menuItemsJson);
      const fieldId = "profile-photo-upload";
      const widgetProps = [
        formatStringProp("name", s.name),
        formatStringProp("role", s.role),
        formatStringProp("avatarSize", s.avatarSize),
        formatExpressionProp("src", "photo"),
        formatExpressionProp("menuItems", "menuItems"),
        ...(s.photoUploadEnabled
          ? [formatExpressionProp("onAvatarClick", "openPhotoUpload")]
          : []),
      ];
      const afterState = formatUserProfileUsageAfterState(
        menuItems,
        s.photoUploadEnabled,
        s.photoUploadMenuItemId,
      );
      const propsBlock = widgetProps.map((prop) => `  ${prop}`).join("\n");
      const photoUploadState = s.photoUploadEnabled
        ? "const [photoUploadOpen, setPhotoUploadOpen] = useState(false);"
        : "";
      const state = [
        `const [photo, setPhoto] = useState(${s.srcEnabled && s.src ? quote(s.src) : '""'});`,
        photoUploadState,
      ].filter(Boolean);
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
      const returnContent = s.photoUploadEnabled
        ? `(\n  ${fragmentContent}\n)`
        : widgetBlock;
      const wrapped = s.wrapInContainer ?? true;
      const containerContent = s.photoUploadEnabled
        ? `${indentContainerChild(widgetBlock)}\n${indentContainerChild(modalBlock)}`
        : indentContainerChild(widgetBlock);
      const components = s.photoUploadEnabled
        ? wrapped
          ? [
              "DashboardContentContainer",
              "UserProfileWidget",
              "ProfilePhotoUploadModal",
            ]
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
      const wrap = s.wrapInContainer ?? true;
      const widget = `<ImageCropUploadWidget
  title=${quote(s.title)}
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
    console.log("Photo cropped");
  }}
/>`;

      return interactiveUsage({
        components: wrap
          ? ["DashboardContentContainer", "ImageCropUploadWidget"]
          : ["ImageCropUploadWidget"],
        state: ['const [photo, setPhoto] = useState("");'],
        jsx: maybeWrapDashboardContent(widget, {
          dataComponent: "profile-photo-upload",
          width: s.width ?? "widget",
          wrap,
        }),
      });
    }
    case "status-indicator": {
      const s = settings as ControlSettingsBySlug["status-indicator"];
      return wrapDashboardWidget(
        `<StatusIndicator label=${quote(s.label)} status=${quote(s.status)} />`,
        ["StatusIndicator"],
        { width: s.width ?? "widget", wrap: s.wrapInContainer ?? true },
      );
    }
    case "trend-badge": {
      const s = settings as ControlSettingsBySlug["trend-badge"];
      return wrapDashboardWidget(
        `<TrendBadge direction=${quote(s.direction)} value=${quote(s.value)} />`,
        ["TrendBadge"],
        { width: s.width ?? "widget", wrap: s.wrapInContainer ?? true },
      );
    }
    case "panel": {
      const s = settings as ControlSettingsBySlug["panel"];
      const props = [
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        ...(s.tone !== "default" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
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
        ...(s.sidebar !== "none"
          ? [formatStringProp("sidebar", s.sidebar)]
          : []),
        ...(s.columns !== 1 ? [formatNumberProp("columns", s.columns)] : []),
        ...(s.gap !== "md" ? [formatStringProp("gap", s.gap)] : []),
        ...(s.stackBelow !== "mobile"
          ? [formatStringProp("stackBelow", s.stackBelow)]
          : []),
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
          ...(s.stackBelow !== "mobile"
            ? [`stackBelow="${s.stackBelow}"`]
            : []),
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
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
        ...(s.striped ? [formatBoolProp("striped", true)] : []),
        ...(s.bordered ? [formatBoolProp("bordered", true)] : []),
        ...(s.showCaption ? [] : [formatBoolProp("showCaption", false)]),
        ...(s.showEmpty
          ? [
              formatStringProp(
                "emptyMessage",
                "No component adoption data available.",
              ),
            ]
          : []),
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
        ...(s.density !== "compact"
          ? [formatStringProp("density", s.density)]
          : []),
        ...(s.layout !== "flat" ? [formatStringProp("layout", s.layout)] : []),
        ...(s.layout === "grouped"
          ? [formatStringProp("groupBy", "group")]
          : []),
        ...(s.layout === "pivot"
          ? [formatExpressionProp("pivot", JSON.stringify(dataGridPivotConfig))]
          : []),
        ...(s.masterDetail && s.layout !== "pivot"
          ? [
              formatExpressionProp(
                "getDetailContent",
                "(row) => `Detail for ${row.values.team}`",
              ),
            ]
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
        ...(s.stickyFirstColumn
          ? []
          : [formatBoolProp("stickyFirstColumn", false)]),
      ];
      return `${importLine(["DataGrid"])}

const columns = ${formatDataGridColumnsForUsage(columns)};

const rows = ${formatDataGridRowsForUsage(demoRows)};

<DataGrid${formatSelfClosing(props)}`;
    }
    case "skeleton": {
      const s = settings as ControlSettingsBySlug["skeleton"];
      const props = [
        ...(s.variant !== "text"
          ? [formatStringProp("variant", s.variant)]
          : []),
        ...(s.animation !== "shimmer"
          ? [formatStringProp("animation", s.animation)]
          : []),
        ...(s.lines !== 3 ? [formatNumberProp("lines", s.lines)] : []),
      ];
      return `${importLine(["Skeleton"])}

<Skeleton${formatSelfClosing(props)}`;
    }
    case "carousel": {
      const s = settings as ControlSettingsBySlug["carousel"];
      const props = [
        formatExpressionProp("images", "images"),
        ...(s.initialIndex !== 0
          ? [formatNumberProp("initialIndex", s.initialIndex)]
          : []),
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
    case "video-player": {
      const s = settings as ControlSettingsBySlug["video-player"];
      const props = [
        formatExpressionProp("tracks", "tracks"),
        ...(s.initialIndex !== 0
          ? [formatNumberProp("initialIndex", s.initialIndex)]
          : []),
        ...(s.showTitle ? [] : [formatBoolProp("showTitle", false)]),
        ...(s.autoPlay ? [formatBoolProp("autoPlay", true)] : []),
        ...(s.loop ? [formatBoolProp("loop", true)] : []),
        ...(s.loopPlaylist ? [] : [formatBoolProp("loopPlaylist", false)]),
        ...(s.muted ? [formatBoolProp("muted", true)] : []),
      ];
      return `${importLine(["VideoPlayer"])}

const tracks = [
  {
    id: "mirror-acoustic",
    src: "/media/demo-video.mp4",
    title: "I Look in the Mirror",
    previewTime: 10,
  },
  {
    id: "into-the-abyss",
    src: "/media/demo-video-abyss.mp4",
    title: "Into the Abyss",
    previewTime: 8,
  },
];

<VideoPlayer${formatSelfClosing(props)}`;
    }
    case "audio-player": {
      const s = settings as ControlSettingsBySlug["audio-player"];
      const props = [
        formatExpressionProp("tracks", "tracks"),
        ...(s.initialIndex !== 0
          ? [formatNumberProp("initialIndex", s.initialIndex)]
          : []),
        ...(s.showArtwork ? [] : [formatBoolProp("showArtwork", false)]),
        ...(s.autoPlay ? [formatBoolProp("autoPlay", true)] : []),
        ...(s.loop ? [formatBoolProp("loop", true)] : []),
        ...(s.loopPlaylist ? [] : [formatBoolProp("loopPlaylist", false)]),
      ];
      return `${importLine(["AudioPlayer"])}

const tracks = [
  {
    id: "mirror-acoustic",
    src: "/media/demo-audio.mp3",
    title: "I Look in the Mirror",
    artist: "Acoustic Mix",
  },
  {
    id: "abysmal-3",
    src: "/media/demo-audio-abysmal.mp3",
    title: "Abysmal",
    artist: "neofuture",
    artworkSrc: "/media/demo-audio-abysmal-art.jpg",
  },
];

<AudioPlayer${formatSelfClosing(props)}`;
    }
    case "lightbox": {
      const s = settings as ControlSettingsBySlug["lightbox"];
      const props = [
        formatExpressionProp("image", "image"),
        formatStringProp("triggerLabel", s.triggerLabel),
        ...(s.showCaptions ? [] : [formatBoolProp("showCaption", false)]),
        ...(s.dismissOnBackdrop
          ? []
          : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape
          ? []
          : [formatBoolProp("dismissOnEscape", false)]),
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
        ...(s.thumbnailSize !== "small"
          ? [formatStringProp("thumbnailSize", s.thumbnailSize)]
          : []),
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
        ...(s.dismissOnBackdrop
          ? []
          : [formatBoolProp("dismissOnBackdrop", false)]),
        ...(s.dismissOnEscape
          ? []
          : [formatBoolProp("dismissOnEscape", false)]),
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
        ...(s.thumbnailSize !== "small"
          ? [formatStringProp("thumbnailSize", s.thumbnailSize)]
          : []),
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
        ...(s.orientation !== "horizontal"
          ? [formatStringProp("orientation", s.orientation)]
          : []),
        ...(s.variant !== "line"
          ? [formatStringProp("variant", s.variant)]
          : []),
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
        ...(s.defaultOpenFirst
          ? [formatStringProp("defaultValue", "getting-started")]
          : []),
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
        ...(s.showMoreLabel !== "Show more"
          ? [formatStringProp("showMoreLabel", s.showMoreLabel)]
          : []),
        ...(s.showLessLabel !== "Show less"
          ? [formatStringProp("showLessLabel", s.showLessLabel)]
          : []),
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
        actionParts.push(
          `<Button variant="secondary">${s.secondaryActionLabel}</Button>`,
        );
      }
      if (s.primaryAction) {
        actionParts.push(
          `<Button variant="primary">${s.primaryActionLabel}</Button>`,
        );
      }
      const props = [
        formatStringProp("title", s.title),
        formatStringProp("description", s.description),
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
        ...(s.showIcon ? [] : [formatExpressionProp("icon", "false")]),
        ...(s.showIcon ? [formatStringProp("icon", s.icon)] : []),
        ...(actionParts.length
          ? [
              formatExpressionProp(
                "actions",
                `<>\n    ${actionParts.join("\n    ")}\n  </>`,
              ),
            ]
          : []),
      ];
      const imports = actionParts.length
        ? ["Button", "EmptyState"]
        : ["EmptyState"];
      return `${importLine(imports)}

<EmptyState${formatSelfClosing(props)}`;
    }
    case "badge": {
      const s = settings as ControlSettingsBySlug["badge"];
      const props = [
        formatStringProp("label", s.label),
        ...(s.tone !== "neutral" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.variant !== "soft"
          ? [formatStringProp("variant", s.variant)]
          : []),
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
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
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
        ...(s.layout !== "stacked"
          ? [formatStringProp("layout", s.layout)]
          : []),
      ];
      return `${importLine(["DescriptionList"])}

const items = ${formatDescriptionListItemsForUsage()};

<DescriptionList${formatSelfClosing(props)}`;
    }
    case "divider": {
      const s = settings as ControlSettingsBySlug["divider"];
      const props = [
        ...(s.orientation !== "horizontal"
          ? [formatStringProp("orientation", s.orientation)]
          : []),
        ...(s.tone !== "default" ? [formatStringProp("tone", s.tone)] : []),
        ...(s.labelEnabled && s.orientation === "horizontal"
          ? [formatStringProp("label", s.label)]
          : []),
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
      const directionProp =
        s.direction !== "row" ? ` direction="${s.direction}"` : "";
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
    case "resize-handle": {
      const s = settings as ControlSettingsBySlug["resize-handle"];
      const isHorizontal = s.orientation === "horizontal";
      const primaryLabel = "Pane A";
      const stateName = isHorizontal ? "topHeight" : "leftWidth";
      const setterName = isHorizontal ? "setTopHeight" : "setLeftWidth";
      const minName = isHorizontal ? "MIN_TOP_HEIGHT" : "MIN_LEFT_WIDTH";
      const maxName = isHorizontal ? "MAX_TOP_HEIGHT" : "MAX_LEFT_WIDTH";
      const startCoordinate = isHorizontal ? "startY" : "startX";
      const startSize = isHorizontal ? "startHeight" : "startWidth";
      const clientCoordinate = isHorizontal ? "clientY" : "clientX";
      const cssTemplate = isHorizontal
        ? `gridTemplateRows: ${stateName} + "px 8px minmax(0, 1fr)"`
        : `gridTemplateColumns: ${stateName} + "px 8px minmax(0, 1fr)"`;
      const containerSize = isHorizontal ? "height: 320" : "minHeight: 220";
      const firstPane = "Pane A";
      const secondPane = "Pane B";
      const decreaseKey = isHorizontal ? "ArrowUp" : "ArrowLeft";
      const increaseKey = isHorizontal ? "ArrowDown" : "ArrowRight";
      const initialSize = isHorizontal ? 96 : 260;
      const minSize = isHorizontal ? 64 : 160;
      const maxSize = isHorizontal ? 180 : 420;
      return `${usageClientPrefix()}
${importLine(["ResizeHandle"])}

const ${minName} = ${minSize};
const ${maxName} = ${maxSize};

export default function ResizeHandleExample() {
  const [${stateName}, ${setterName}] = useState(${initialSize});

  const clampSize = (size) => Math.min(Math.max(size, ${minName}), ${maxName});
  const resizeBy = (delta) => ${setterName}((current) => clampSize(current + delta));

  const startResize = (event) => {
    event.preventDefault();
    const ${startCoordinate} = event.${clientCoordinate};
    const ${startSize} = ${stateName};

    const handlePointerMove = (moveEvent) => {
      ${setterName}(clampSize(${startSize} + moveEvent.${clientCoordinate} - ${startCoordinate}));
    };

    const stopResize = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize, { once: true });
  };

  const handleKeyDown = (event) => {
    if (event.key === "${decreaseKey}") {
      event.preventDefault();
      resizeBy(-16);
    }

    if (event.key === "${increaseKey}") {
      event.preventDefault();
      resizeBy(16);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        ${cssTemplate},
        ${containerSize},
      }}
    >
      <aside style={{ padding: 16 }}>${firstPane}</aside>
      <ResizeHandle
        aria-label="Resize ${primaryLabel}"
        aria-valuemax={${maxName}}
        aria-valuemin={${minName}}
        aria-valuenow={${stateName}}
        background="${s.background}"
        height="${s.height}"
        orientation="${s.orientation}"
        onKeyDown={handleKeyDown}
        onPointerDown={startResize}
      />
      <main style={{ padding: 16 }}>${secondPane}</main>
    </div>
  );
}`;
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
    case "three-pane-layout": {
      const s = settings as ControlSettingsBySlug["three-pane-layout"];
      const layoutProps = formatThreePaneLayoutProps(s);
      return `${importLine(["ThreePaneLayout"])}

<ThreePaneLayout
  ${layoutProps}
>
  <section>
    <h2>Workspace</h2>
    <p>Main content stays fluid while sidebars keep persisted widths.</p>
  </section>
</ThreePaneLayout>`;
    }
    case "custom-scrollbar": {
      const s = settings as ControlSettingsBySlug["custom-scrollbar"];
      return `${importLine(["CustomScrollbar"])}

<CustomScrollbar
  autoHide={${s.autoHide}}
  horizontalThumbShape="${s.horizontalThumbShape}"
  horizontalTrackShape="${s.horizontalTrackShape}"
  maxHeight={${s.maxHeight}}
  minThumbSize={${s.minThumbSize}}
  orientation="${s.orientation}"
  thickness={${s.thickness}}
  trackInset={${s.trackInset}}
  verticalThumbShape="${s.verticalThumbShape}"
  verticalTrackShape="${s.verticalTrackShape}"
>
  <div style={{ padding: 12, display: "grid", gap: 6 }}>
${formatScrollAreaContent()}
  </div>
</CustomScrollbar>`;
    }
    case "scroll-area": {
      const s = settings as ControlSettingsBySlug["scroll-area"];
      return `${importLine(["ScrollArea"])}

<ScrollArea autoHide={${s.autoHide}} maxHeight={${s.maxHeight}} orientation="${s.orientation}" thickness={${s.thickness}}>
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
    case "application-footer": {
      return `${importLine(["ApplicationFooter"])}\n\n<ApplicationFooter actions={[{ id: "help", iconName: "circle-question", label: "Help", onSelect: () => console.log("Help") }, { id: "guide", iconName: "book-open", label: "User guide" }, { id: "settings", iconName: "gear", label: "Settings" }]} productName="CRM" version="v1.0.0" />`;
    }
    case "application-header": {
      const s = settings as ControlSettingsBySlug["application-header"];
      return `${importLine(["ApplicationHeader"])}

<ApplicationHeader
  actions={[
    { id: "notifications", iconName: "bell", label: "Notifications", count: 8 },
    { id: "messages", iconName: "envelope", label: "Messages", count: 3 },
    { id: "calendar", iconName: "calendar", label: "Calendar" },
  ]}
  createItems={[
    { id: "company", label: "Add Company", iconName: "building", onSelect: () => console.log("add company") },
    { id: "contact", label: "Add Contact", iconName: "user-plus", onSelect: () => console.log("add contact") },
    { id: "task", label: "Add Task", iconName: "list-check", onSelect: () => console.log("add task") },
  ]}
  onCreateSelect={(item) => console.log("selected", item.id)}${s.showSearch ? "" : "\n  showSearch={false}"}${s.showProfile ? '\n  profile={{ name: "Carl Fearby", role: "Administrator", src: "/user-profile-carl.png" }}' : ""}
/>`;
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
        ...(s.collapsedDepth !== 1
          ? [formatNumberProp("collapsedDepth", s.collapsedDepth)]
          : []),
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
        ...(s.trendEnabled
          ? [
              formatStringProp("trend", s.trend),
              formatStringProp("trendLabel", s.trendLabel),
            ]
          : []),
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
          state: [],
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
        ...(s.urgency !== "standard"
          ? [formatStringProp("urgency", s.urgency)]
          : []),
        ...(s.showZero ? [formatBoolProp("showZero", true)] : []),
        formatExpressionProp("onClick", `() => console.log(${quote(s.label)})`),
      ];
      return `${importLine(["IconBadge"])}\n\n<IconBadge${formatSelfClosing(props)}`;
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
        formatExpressionProp(
          "keys",
          JSON.stringify(keys.length ? keys : ["⌘", "K"]),
        ),
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
        ...(s.copiedLabel !== "Copied"
          ? [formatStringProp("copiedLabel", s.copiedLabel)]
          : []),
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

    case "sidebar":
    case "lab-sidebar": {
      const s = settings as ControlSettingsBySlug["sidebar"];
      const wrapped = s.wrapInContainer ?? category === "labs";
      const sidebarProps = [
        ...(s.side !== "left" ? [formatStringProp("side", s.side)] : []),
        ...(s.collapsed ? [formatBoolProp("collapsed", true)] : []),
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
        formatStringProp("defaultActiveItem", s.activeItem),
        ...(s.showHeader
          ? [
              formatExpressionProp(
                "header",
                `<SidebarHeader title=${quote(s.headerTitle)} />`,
              ),
            ]
          : []),
        ...(s.showFooter ? [formatStringProp("footer", s.footerText)] : []),
        ...(s.footerPaddingBottom ? [formatBoolProp("footerPaddingBottom", true)] : []),
        ...(s.footerPaddingLeft ? [formatBoolProp("footerPaddingLeft", true)] : []),
        ...(s.footerPaddingRight ? [formatBoolProp("footerPaddingRight", true)] : []),
        ...(s.footerPaddingTop ? [formatBoolProp("footerPaddingTop", true)] : []),
        ...(s.persistState ? [formatBoolProp("persistState", true)] : []),
        ...(s.paddingBottom ? [formatBoolProp("paddingBottom", true)] : []),
        ...(s.paddingLeft ? [formatBoolProp("paddingLeft", true)] : []),
        ...(s.paddingRight ? [formatBoolProp("paddingRight", true)] : []),
        ...(s.paddingTop ? [formatBoolProp("paddingTop", true)] : []),
      ];
      const sidebarMarkup = `<Sidebar${formatSelfClosing([
        ...sidebarProps,
        formatExpressionProp("menu", "menu"),
        formatExpressionProp(
          "renderIcon",
          `(iconName) => <CatalogIcon iconName={iconName} />`,
        ),
        formatExpressionProp("onSelect", "handleMenuSelect"),
      ])}`;
      const sidebarContainerHeight =
        (s.height ?? "auto") !== "auto" ? ` height=${quote(s.height)}` : "";
      const returnMarkup = wrapped
        ? `<DashboardContentContainer data-component="sidebar"${sidebarContainerHeight} width="widget">
    ${sidebarMarkup
      .split("\n")
      .map((line) => (line ? `  ${line}` : line))
      .join("\n")}
  </DashboardContentContainer>`
        : sidebarMarkup
            .split("\n")
            .map((line) => (line ? `  ${line}` : line))
            .join("\n");
      return `${usageClientPrefix(false)}
${importLine([
  "CatalogIcon",
  ...(wrapped ? ["DashboardContentContainer"] : []),
  "Sidebar",
  "SidebarHeader",
])}

const handleMenuSelect = (item) => {
  console.log("Menu callback", item.label);
};

const handleItemSelect = (label) => {
  console.log("Item callback", label);
};

const menu = [
  {
    id: "overview",
    label: "Overview",
    icon: "grid-2",
    onSelect: () => handleItemSelect("Overview"),
  },
  {
    type: "group",
    id: "library-group",
    label: "Library",
    icon: "layer-group",
    defaultOpen: ${s.groupOpen},
    children: [
      {
        id: "library",
        label: "Components",
        icon: "cube",
        onSelect: () => handleItemSelect("Components"),
      },
      {
        id: "templates",
        label: "Templates",
        icon: "copy",
        onSelect: () => handleItemSelect("Templates"),
      },
      {
        id: "tokens",
        label: "Tokens",
        icon: "swatchbook",
        onSelect: () => handleItemSelect("Tokens"),
      },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: "gear",
    onSelect: () => handleItemSelect("Settings"),
  },
];

return (
  ${returnMarkup}
);`;
    }
    case "mega-menu": {
      const s = settings as ControlSettingsBySlug["mega-menu"];
      const previewMenu = buildMegaMenuPreviewConfig(s);
      const props = [
        formatExpressionProp("menus", "menus"),
        formatBoolProp("staticPanel", true),
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
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
        ...(s.density !== "comfortable"
          ? [formatStringProp("density", s.density)]
          : []),
        ...(s.closeOnOutside ? [] : [formatBoolProp("closeOnOutside", false)]),
        ...(s.closeOnEscape ? [] : [formatBoolProp("closeOnEscape", false)]),
        ...(s.closeOnSelect ? [] : [formatBoolProp("closeOnSelect", false)]),
        ...(s.showShortcuts ? [] : [formatBoolProp("showShortcuts", false)]),
        formatExpressionProp("onActiveMenuChange", "setActiveMenu"),
        formatExpressionProp("onSelect", "handleSelect"),
      ];
      const navProps = props.map((prop) => `      ${prop}`).join("\n");
      const menusBlock = formatTopNavigationMenusForUsage(
        topNavigationDemoMenus,
        {
          showShortcuts: s.showShortcuts,
        },
      );

      return interactiveUsage({
        components: ["TopNavigation"],
        preamble: ["", "const menus = [", `${menusBlock},`, "];"],
        state: [
          `const [activeMenu, setActiveMenu] = useState<string | null>(${s.activeMenu === "none" ? "null" : quote(s.activeMenu)});`,
          "",
          "const handleSelect = (menuId: string, item: { id: string; label: string }) => {",
          "  console.log(`${menuId}: ${item.label}`);",
          "};",
        ],
        jsx: `<TopNavigation
${navProps}
/>`,
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

export function generateUsageCode(
  slug: ControlSlug,
  settings: ControlSettings,
  category?: ComponentCategory,
) {
  const full = generateFullUsageCode(slug, settings, category);
  return {
    ...splitUsageCode(full),
    full,
  };
}
