"use client";

import type {
  BaseFieldSettings,
  ControlSettings,
  ControlSettingsBySlug,
  ControlSlug,
} from "@/lib/controls/types";
import {
  isCartesianChartSlug,
  isChartSlug,
  isMatrixChartSlug,
} from "@/lib/controls/chartCatalog";
import { chartVerticalBar36MonthData } from "@/lib/controls/chartDemoData";
import {
  gaugePaletteOptions,
  gaugeTrackToneOptions,
  gaugeValueToneOptions,
} from "@/lib/controls/dashboardWidgetData";
import {
  DashboardHeightSetting,
  DashboardPreviewLayoutSetting,
  DashboardWidthSetting,
  SettingInput,
  SettingSelect,
  SettingTextarea,
  SettingToggle,
} from "./SettingField";

const pipelineStageCountOptions = ["1", "2", "3", "4", "5"].map((value) => ({
  label: `${value} stage${value === "1" ? "" : "s"}`,
  value,
}));

const pipelineStageValueFields = [
  { label: "Qualification value", valueKey: "qualificationValue" },
  { label: "Proposal value", valueKey: "proposalValue" },
  { label: "Negotiation value", valueKey: "negotiationValue" },
  { label: "Closing value", valueKey: "closingValue" },
  { label: "Won value", valueKey: "wonValue" },
] as const;

const pipelineValueOptions = [
  "£120,000",
  "£144,000",
  "£220,000",
  "£331,000",
  "£420,000",
  "£542,000",
  "£621,000",
  "£760,000",
  "£842,000",
  "£1,050,000",
].map((value) => ({ label: value, value }));

import { IconPicker } from "opus-react";
import shellStyles from "@/components/development/ComponentsShell/ComponentsShell.module.css";

const buttonVariants = [
  "primary",
  "secondary",
  "success",
  "danger",
  "warning",
  "info",
  "light",
  "dark",
  "link",
] as const;

const dialogActionCopy = {
  ok: {
    title: "Action completed",
    description: "Your changes have been saved successfully.",
  },
  "ok-cancel": {
    title: "Ready to continue",
    description: "Everything looks good. Confirm to move forward.",
  },
  "yes-no": {
    title: "Continue with this choice?",
    description:
      "Choose yes to continue, or no to go back and review the details.",
  },
  delete: {
    title: "Delete this item?",
    description: "This will permanently remove the item and cannot be undone.",
  },
} as const;

type ControlSettingsPanelProps = {
  slug: ControlSlug;
  settings: ControlSettings;
  onChange: (next: ControlSettings) => void;
};

function CommonFieldSettings({
  settings,
  onChange,
  includeValue = true,
  showDensity = true,
  showErrorSettings = true,
}: {
  settings: BaseFieldSettings & Record<string, unknown>;
  onChange: (next: BaseFieldSettings & Record<string, unknown>) => void;
  includeValue?: boolean;
  showDensity?: boolean;
  showErrorSettings?: boolean;
}) {
  return (
    <>
      <SettingSelect
        label="Layout mode"
        value={settings.mode}
        onChange={(mode) =>
          onChange({ ...settings, mode: mode as typeof settings.mode })
        }
        options={[
          { label: "Stacked", value: "stacked" },
          { label: "Flagged", value: "flagged" },
        ]}
      />
      <SettingSelect
        label="Label position"
        value={settings.labelPosition}
        onChange={(labelPosition) =>
          onChange({
            ...settings,
            labelPosition: labelPosition as typeof settings.labelPosition,
          })
        }
        options={[
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ]}
      />
      {showDensity ? (
        <SettingSelect
          label="Density"
          value={settings.size ?? "md"}
          onChange={(size) =>
            onChange({ ...settings, size: size as typeof settings.size })
          }
          options={[
            { label: "Compact", value: "sm" },
            { label: "Comfortable", value: "md" },
            { label: "Spacious", value: "lg" },
          ]}
        />
      ) : null}
      <SettingInput
        label="Label"
        value={settings.label}
        onChange={(label) => onChange({ ...settings, label })}
      />
      <SettingToggle
        label="Required"
        checked={settings.required}
        onChange={(required) => onChange({ ...settings, required })}
      />
      {showErrorSettings ? (
        <>
          <SettingToggle
            label="Show error"
            checked={settings.errorEnabled}
            onChange={(errorEnabled) => onChange({ ...settings, errorEnabled })}
          />
          {settings.errorEnabled ? (
            <SettingInput
              label="Error text"
              value={settings.error}
              onChange={(error) => onChange({ ...settings, error })}
            />
          ) : null}
        </>
      ) : null}
      <SettingToggle
        label="Show help text"
        checked={settings.helpEnabled}
        onChange={(helpEnabled) => onChange({ ...settings, helpEnabled })}
      />
      {settings.helpEnabled ? (
        <div className={shellStyles.settingsFullWidth}>
          <SettingTextarea
            label="Help text"
            value={settings.help}
            onChange={(help) => onChange({ ...settings, help })}
          />
        </div>
      ) : null}
      {includeValue && "value" in settings ? (
        <SettingInput
          label="Value"
          value={String(settings.value)}
          onChange={(value) =>
            onChange({ ...settings, value } as typeof settings)
          }
        />
      ) : null}
    </>
  );
}

function HelpTextSettings<T extends { helpEnabled: boolean; help: string }>({
  settings,
  onChange,
}: {
  settings: T;
  onChange: (next: ControlSettings) => void;
}) {
  return (
    <>
      <SettingToggle
        label="Show help text"
        checked={settings.helpEnabled}
        onChange={(helpEnabled) =>
          onChange({ ...settings, helpEnabled } as ControlSettings)
        }
      />
      {settings.helpEnabled ? (
        <div className={shellStyles.settingsFullWidth}>
          <SettingTextarea
            label="Help text"
            value={settings.help}
            onChange={(help) =>
              onChange({ ...settings, help } as ControlSettings)
            }
          />
        </div>
      ) : null}
    </>
  );
}

function DashboardWidgetWidthSetting<
  T extends { width?: "full" | "widget"; wrapInContainer?: boolean },
>({
  settings,
  onChange,
}: {
  settings: T;
  onChange: (next: ControlSettings) => void;
}) {
  return (settings.wrapInContainer ?? true) ? (
    <DashboardWidthSetting
      value={settings.width ?? "widget"}
      onChange={(width) => onChange({ ...settings, width } as ControlSettings)}
    />
  ) : null;
}

export function ControlSettingsPanel({
  slug,
  settings,
  onChange,
}: ControlSettingsPanelProps) {
  if (isChartSlug(slug)) {
    const s = settings as ControlSettingsBySlug[typeof slug];
    const supportsAxes = isCartesianChartSlug(slug) || isMatrixChartSlug(slug);
    const supportsAxisTitles = isCartesianChartSlug(slug);
    return (
      <div className={shellStyles.settingsGrid}>
        <SettingSelect
          label="Palette"
          value={s.palette}
          onChange={(palette) =>
            onChange({
              ...s,
              palette: palette as typeof s.palette,
            } as ControlSettings)
          }
          options={[
            { label: "Opus", value: "opus" },
            { label: "Cool", value: "cool" },
            { label: "Warm", value: "warm" },
            { label: "Mono", value: "mono" },
          ]}
        />
        <SettingInput
          label="Height"
          type="number"
          value={String(s.height)}
          onChange={(height) =>
            onChange({
              ...s,
              height: Math.min(Math.max(Number(height) || 220, 180), 520),
            } as ControlSettings)
          }
        />
        {supportsAxes ? (
          <SettingToggle
            label="Axes"
            checked={s.showAxis}
            onChange={(showAxis) =>
              onChange({ ...s, showAxis } as ControlSettings)
            }
          />
        ) : null}
        <SettingToggle
          label="Grid"
          checked={s.showGrid}
          onChange={(showGrid) =>
            onChange({ ...s, showGrid } as ControlSettings)
          }
        />
        <SettingToggle
          label="Legend"
          checked={s.showLegend}
          onChange={(showLegend) =>
            onChange({ ...s, showLegend } as ControlSettings)
          }
        />
        <SettingToggle
          label="Values"
          checked={s.showValues}
          onChange={(showValues) =>
            onChange({ ...s, showValues } as ControlSettings)
          }
        />
        <SettingToggle
          label="Maximise width"
          checked={s.maximise}
          onChange={(maximise) =>
            onChange({ ...s, maximise } as ControlSettings)
          }
        />
        <SettingSelect
          label="Preview layout"
          value={s.previewLayout}
          onChange={(previewLayout) =>
            onChange({
              ...s,
              previewLayout: previewLayout as typeof s.previewLayout,
            } as ControlSettings)
          }
          options={[
            { label: "1 full width", value: "single" },
            { label: "2 side by side", value: "split" },
          ]}
        />
        <div className={shellStyles.settingsFullWidth}>
          <SettingInput
            label="Title"
            value={s.title}
            onChange={(title) => onChange({ ...s, title } as ControlSettings)}
          />
        </div>
        {supportsAxisTitles && s.showAxis ? (
          <>
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="X axis label"
                value={s.xAxisLabel}
                onChange={(xAxisLabel) =>
                  onChange({ ...s, xAxisLabel } as ControlSettings)
                }
              />
            </div>
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Y axis label"
                value={s.yAxisLabel}
                onChange={(yAxisLabel) =>
                  onChange({ ...s, yAxisLabel } as ControlSettings)
                }
              />
            </div>
          </>
        ) : null}
        {slug === "bar-chart-vertical" ? (
          <SettingSelect
            label="Highlighted bar"
            value={s.highlightLabel}
            onChange={(highlightLabel) =>
              onChange({ ...s, highlightLabel } as ControlSettings)
            }
            options={[
              { label: "None", value: "" },
              ...chartVerticalBar36MonthData
                .filter((_, index) => index % 3 === 0)
                .map((item) => ({ label: item.label, value: item.label })),
            ]}
          />
        ) : null}
      </div>
    );
  }

  switch (slug) {
    case "text-input": {
      const s = settings as ControlSettingsBySlug["text-input"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingToggle
            label="Show placeholder"
            checked={s.placeholderEnabled}
            onChange={(placeholderEnabled) =>
              onChange({ ...s, placeholderEnabled } as ControlSettings)
            }
          />
          {s.placeholderEnabled ? (
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) =>
                onChange({ ...s, placeholder } as ControlSettings)
              }
            />
          ) : null}
        </div>
      );
    }
    case "email-input":
    case "password-input":
    case "search-input":
    case "url-input":
    case "date-picker":
    case "datetime-picker":
    case "month-picker":
    case "time-picker":
    case "week-picker":
    case "select": {
      const s = settings as ControlSettingsBySlug[typeof slug];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          {slug === "select" ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingTextarea
                label="Options (comma-separated)"
                value={(s as ControlSettingsBySlug["select"]).options}
                onChange={(options) =>
                  onChange({ ...s, options } as ControlSettings)
                }
              />
            </div>
          ) : null}
          {slug === "search-input" ? (
            <>
              <SettingToggle
                label="Show placeholder"
                checked={
                  (s as ControlSettingsBySlug["search-input"])
                    .placeholderEnabled ?? false
                }
                onChange={(placeholderEnabled) =>
                  onChange({ ...s, placeholderEnabled } as ControlSettings)
                }
              />
              {(s as ControlSettingsBySlug["search-input"])
                .placeholderEnabled ? (
                <SettingInput
                  label="Placeholder"
                  value={
                    (s as ControlSettingsBySlug["search-input"]).placeholder ??
                    ""
                  }
                  onChange={(placeholder) =>
                    onChange({ ...s, placeholder } as ControlSettings)
                  }
                />
              ) : null}
            </>
          ) : null}
        </div>
      );
    }
    case "textarea": {
      const s = settings as ControlSettingsBySlug["textarea"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingToggle
            label="Character limit"
            checked={s.maxCharsEnabled}
            onChange={(maxCharsEnabled) =>
              onChange({ ...s, maxCharsEnabled } as ControlSettings)
            }
          />
          {s.maxCharsEnabled ? (
            <SettingInput
              label="Max characters"
              type="number"
              value={String(s.maxChars)}
              onChange={(value) =>
                onChange({
                  ...s,
                  maxChars: Number(value) || 0,
                } as ControlSettings)
              }
            />
          ) : null}
          <SettingToggle
            label="Show placeholder"
            checked={s.placeholderEnabled}
            onChange={(placeholderEnabled) =>
              onChange({ ...s, placeholderEnabled } as ControlSettings)
            }
          />
          {s.placeholderEnabled ? (
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) =>
                onChange({ ...s, placeholder } as ControlSettings)
              }
            />
          ) : null}
        </div>
      );
    }
    case "note-composer": {
      const s = settings as ControlSettingsBySlug["note-composer"];
      return (
        <div className={shellStyles.settingsGrid}>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) =>
                onChange({ ...s, placeholder } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Save button label"
              value={s.saveButtonLabel}
              onChange={(saveButtonLabel) =>
                onChange({ ...s, saveButtonLabel } as ControlSettings)
              }
            />
          </div>
          <SettingToggle
            label="Show attach"
            checked={s.showAttach}
            onChange={(showAttach) =>
              onChange({ ...s, showAttach } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show mention"
            checked={s.showMention}
            onChange={(showMention) =>
              onChange({ ...s, showMention } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show emoji"
            checked={s.showEmoji}
            onChange={(showEmoji) =>
              onChange({ ...s, showEmoji } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Preview value"
              value={s.value}
              onChange={(value) => onChange({ ...s, value } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "rich-text-field": {
      const s = settings as ControlSettingsBySlug["rich-text-field"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingInput
            label="Min height (px)"
            type="number"
            value={String(s.minHeight)}
            onChange={(value) =>
              onChange({
                ...s,
                minHeight: Number(value) || 160,
              } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show placeholder"
            checked={s.placeholderEnabled}
            onChange={(placeholderEnabled) =>
              onChange({ ...s, placeholderEnabled } as ControlSettings)
            }
          />
          {s.placeholderEnabled ? (
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) =>
                onChange({ ...s, placeholder } as ControlSettings)
              }
            />
          ) : null}
        </div>
      );
    }
    case "filter-select":
    case "tree-select": {
      const s = settings as ControlSettingsBySlug[typeof slug];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
        </div>
      );
    }
    case "multi-select": {
      const s = settings as ControlSettingsBySlug["multi-select"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Options (comma-separated)"
              value={s.options}
              onChange={(options) =>
                onChange({ ...s, options } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "transfer-list": {
      const s = settings as ControlSettingsBySlug["transfer-list"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Available items (comma-separated)"
              value={s.available}
              onChange={(available) =>
                onChange({ ...s, available } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "password-strength-field": {
      const s = settings as ControlSettingsBySlug["password-strength-field"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingToggle
            label="Show requirements"
            checked={s.showRequirements}
            onChange={(showRequirements) =>
              onChange({ ...s, showRequirements } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "rating-input": {
      const s = settings as ControlSettingsBySlug["rating-input"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingSelect
            label="Variant"
            value={s.variant}
            options={[
              { label: "Stars", value: "stars" },
              { label: "Hearts", value: "hearts" },
              { label: "Numeric", value: "numeric" },
            ]}
            onChange={(variant) =>
              onChange({ ...s, variant } as ControlSettings)
            }
          />
          <SettingInput
            label="Maximum rating"
            type="number"
            value={String(s.max)}
            onChange={(value) =>
              onChange({ ...s, max: Number(value) || 5 } as ControlSettings)
            }
          />
          <SettingInput
            label="Value"
            type="number"
            value={String(s.value)}
            onChange={(value) =>
              onChange({ ...s, value: Number(value) || 0 } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "segmented-control": {
      const s = settings as ControlSettingsBySlug["segmented-control"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Options (comma-separated)"
              value={s.options}
              onChange={(options) =>
                onChange({ ...s, options } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "slider-range": {
      const s = settings as ControlSettingsBySlug["slider-range"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingInput
            label="Minimum value"
            type="number"
            value={String(s.value[0])}
            onChange={(value) =>
              onChange({
                ...s,
                value: [Number(value) || s.min, s.value[1]],
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Maximum value"
            type="number"
            value={String(s.value[1])}
            onChange={(value) =>
              onChange({
                ...s,
                value: [s.value[0], Number(value) || s.max],
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Range min"
            type="number"
            value={String(s.min)}
            onChange={(value) =>
              onChange({ ...s, min: Number(value) || 0 } as ControlSettings)
            }
          />
          <SettingInput
            label="Range max"
            type="number"
            value={String(s.max)}
            onChange={(value) =>
              onChange({ ...s, max: Number(value) || 100 } as ControlSettings)
            }
          />
          <SettingInput
            label="Step"
            type="number"
            value={String(s.step)}
            onChange={(value) =>
              onChange({ ...s, step: Number(value) || 1 } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "phone-number-input": {
      const s = settings as ControlSettingsBySlug["phone-number-input"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingSelect
            label="Country"
            value={s.countryCode}
            options={[
              { label: "United Kingdom", value: "GB" },
              { label: "United States", value: "US" },
              { label: "Germany", value: "DE" },
              { label: "France", value: "FR" },
              { label: "Ireland", value: "IE" },
            ]}
            onChange={(countryCode) =>
              onChange({ ...s, countryCode } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "country-picker": {
      const s = settings as ControlSettingsBySlug["country-picker"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingSelect
            label="Default country"
            value={s.value}
            options={[
              { label: "United Kingdom", value: "GB" },
              { label: "United States", value: "US" },
              { label: "Germany", value: "DE" },
              { label: "France", value: "FR" },
              { label: "Ireland", value: "IE" },
            ]}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
          />
          <SettingToggle
            label="Show placeholder"
            checked={s.placeholderEnabled}
            onChange={(placeholderEnabled) =>
              onChange({ ...s, placeholderEnabled } as ControlSettings)
            }
          />
          {s.placeholderEnabled ? (
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) =>
                onChange({ ...s, placeholder } as ControlSettings)
              }
            />
          ) : null}
          <SettingInput
            label="Search placeholder"
            value={s.searchPlaceholder}
            onChange={(searchPlaceholder) =>
              onChange({ ...s, searchPlaceholder } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "cascader": {
      const s = settings as ControlSettingsBySlug["cascader"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
        </div>
      );
    }
    case "color-picker": {
      const s = settings as ControlSettingsBySlug["color-picker"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingInput
            label="Value"
            type="color"
            value={s.value}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
          />
        </div>
      );
    }
    case "radio-group": {
      const s = settings as ControlSettingsBySlug["radio-group"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            showErrorSettings={false}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingSelect
            label="Selected value"
            value={s.value}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
            options={[
              { label: "Personal", value: "personal" },
              { label: "Business", value: "business" },
              { label: "Enterprise", value: "enterprise" },
            ]}
          />
          <SettingSelect
            label="Shape"
            value={s.shape}
            onChange={(shape) =>
              onChange({
                ...s,
                shape: shape as typeof s.shape,
              } as ControlSettings)
            }
            options={[
              { label: "Round", value: "round" },
              { label: "Square", value: "square" },
            ]}
          />
          <SettingToggle
            label="Show global error"
            checked={s.errorEnabled}
            onChange={(errorEnabled) =>
              onChange({ ...s, errorEnabled } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show option errors"
            checked={s.optionErrorsEnabled}
            onChange={(optionErrorsEnabled) =>
              onChange({ ...s, optionErrorsEnabled } as ControlSettings)
            }
          />
          {s.errorEnabled ? (
            <SettingInput
              label="Global error text"
              value={s.error}
              onChange={(error) => onChange({ ...s, error } as ControlSettings)}
            />
          ) : null}
          {s.optionErrorsEnabled ? (
            <SettingInput
              label="Option error text"
              value={s.optionError}
              onChange={(optionError) =>
                onChange({ ...s, optionError } as ControlSettings)
              }
            />
          ) : null}
        </div>
      );
    }
    case "chip-input": {
      const s = settings as ControlSettingsBySlug["chip-input"];
      const presetDefaults = {
        "chip-input": { label: "Keywords", placeholder: "Add keyword…" },
        "tag-input": { label: "Tags", placeholder: "Add a tag…" },
        "token-input": { label: "Recipients", placeholder: "Add recipient…" },
      } as const;

      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingSelect
            label="Preset"
            value={s.preset}
            onChange={(preset) => {
              const defaults =
                presetDefaults[preset as keyof typeof presetDefaults];
              onChange({
                ...s,
                preset: preset as typeof s.preset,
                label: defaults.label,
                placeholder: defaults.placeholder,
              } as ControlSettings);
            }}
            options={[
              { label: "Chip input", value: "chip-input" },
              { label: "Tag input", value: "tag-input" },
              { label: "Token input", value: "token-input" },
            ]}
          />
          <SettingSelect
            label="Chip variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({
                ...s,
                variant: variant as typeof s.variant,
              } as ControlSettings)
            }
            options={[
              { label: "Filled", value: "filled" },
              { label: "Outlined", value: "outlined" },
              { label: "Soft", value: "soft" },
              { label: "Glass", value: "glass" },
              { label: "Gradient", value: "gradient" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Chips (one per line)"
              value={s.value.join("\n")}
              onChange={(text) =>
                onChange({
                  ...s,
                  value: text
                    .split("\n")
                    .map((entry) => entry.trim())
                    .filter(Boolean),
                } as ControlSettings)
              }
            />
          </div>
          <SettingToggle
            label="Show placeholder"
            checked={s.placeholderEnabled}
            onChange={(placeholderEnabled) =>
              onChange({ ...s, placeholderEnabled } as ControlSettings)
            }
          />
          {s.placeholderEnabled ? (
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) =>
                onChange({ ...s, placeholder } as ControlSettings)
              }
            />
          ) : null}
          <SettingToggle
            label="Disabled"
            checked={s.disabled}
            onChange={(disabled) =>
              onChange({ ...s, disabled } as ControlSettings)
            }
          />
          <SettingToggle
            label="Read only"
            checked={s.readOnly}
            onChange={(readOnly) =>
              onChange({ ...s, readOnly } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "choice-chips": {
      const s = settings as ControlSettingsBySlug["choice-chips"];

      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingSelect
            label="Selection mode"
            value={s.selectionMode}
            onChange={(selectionMode) =>
              onChange({
                ...s,
                selectionMode: selectionMode as typeof s.selectionMode,
              } as ControlSettings)
            }
            options={[
              { label: "Multiple", value: "multiple" },
              { label: "Single", value: "single" },
            ]}
          />
          <SettingSelect
            label="Variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({
                ...s,
                variant: variant as typeof s.variant,
              } as ControlSettings)
            }
            options={[
              { label: "Filled", value: "filled" },
              { label: "Outlined", value: "outlined" },
              { label: "Soft", value: "soft" },
              { label: "Glass", value: "glass" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Options (Label:value, comma separated)"
              value={s.options}
              onChange={(options) =>
                onChange({ ...s, options } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Selected values (one per line)"
              value={s.value.join("\n")}
              onChange={(text) =>
                onChange({
                  ...s,
                  value: text
                    .split("\n")
                    .map((entry) => entry.trim())
                    .filter(Boolean),
                } as ControlSettings)
              }
            />
          </div>
          <SettingToggle
            label="Disabled"
            checked={s.disabled}
            onChange={(disabled) =>
              onChange({ ...s, disabled } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "checkbox": {
      const s = settings as ControlSettingsBySlug["checkbox"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingToggle
            label="Checked"
            checked={s.checked}
            onChange={(checked) =>
              onChange({ ...s, checked } as ControlSettings)
            }
          />
          <SettingSelect
            label="Shape"
            value={s.shape}
            onChange={(shape) =>
              onChange({
                ...s,
                shape: shape as typeof s.shape,
              } as ControlSettings)
            }
            options={[
              { label: "Square", value: "square" },
              { label: "Round", value: "round" },
            ]}
          />
        </div>
      );
    }
    case "switch": {
      const s = settings as ControlSettingsBySlug["switch"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingToggle
            label="Checked"
            checked={s.checked}
            onChange={(checked) =>
              onChange({ ...s, checked } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "range-slider": {
      const s = settings as ControlSettingsBySlug["range-slider"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingInput
            label="Value"
            numberStep={s.step}
            type="number"
            value={String(s.value)}
            onChange={(value) =>
              onChange({ ...s, value: Number(value) || 0 } as ControlSettings)
            }
          />
          <SettingInput
            label="Step"
            numberStep={0.001}
            type="number"
            value={String(s.step)}
            onChange={(step) =>
              onChange({ ...s, step: Number(step) || 1 } as ControlSettings)
            }
          />
          <SettingInput
            label="Min"
            numberStep={s.step}
            type="number"
            value={String(s.min)}
            onChange={(min) =>
              onChange({ ...s, min: Number(min) || 0 } as ControlSettings)
            }
          />
          <SettingInput
            label="Max"
            numberStep={s.step}
            type="number"
            value={String(s.max)}
            onChange={(max) =>
              onChange({ ...s, max: Number(max) || 0 } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "number-input": {
      const s = settings as ControlSettingsBySlug["number-input"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingInput
            label="Value"
            numberStep={s.step}
            type="number"
            value={String(s.value)}
            onChange={(value) =>
              onChange({ ...s, value: Number(value) || 0 } as ControlSettings)
            }
          />
          <SettingInput
            label="Step"
            numberStep={0.001}
            type="number"
            value={String(s.step)}
            onChange={(step) =>
              onChange({ ...s, step: Number(step) || 1 } as ControlSettings)
            }
          />
          <SettingInput
            label="Min"
            numberStep={s.step}
            type="number"
            value={String(s.min)}
            onChange={(min) =>
              onChange({ ...s, min: Number(min) || 0 } as ControlSettings)
            }
          />
          <SettingInput
            label="Max"
            numberStep={s.step}
            type="number"
            value={String(s.max)}
            onChange={(max) =>
              onChange({ ...s, max: Number(max) || 0 } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "file-upload": {
      const s = settings as ControlSettingsBySlug["file-upload"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingInput
            label="File name display"
            value={s.fileName}
            onChange={(fileName) =>
              onChange({ ...s, fileName } as ControlSettings)
            }
            placeholder="Leave empty for placeholder state"
          />
        </div>
      );
    }
    case "image-crop-upload": {
      const s = settings as ControlSettingsBySlug["image-crop-upload"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingInput
            label="Upload label"
            value={s.uploadLabel}
            onChange={(uploadLabel) =>
              onChange({ ...s, uploadLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Crop button label"
            value={s.cropButtonLabel}
            onChange={(cropButtonLabel) =>
              onChange({ ...s, cropButtonLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Change button label"
            value={s.changeButtonLabel}
            onChange={(changeButtonLabel) =>
              onChange({ ...s, changeButtonLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Zoom label"
            value={s.zoomLabel}
            onChange={(zoomLabel) =>
              onChange({ ...s, zoomLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Viewport size (px)"
            value={String(s.viewportSize)}
            onChange={(viewportSize) =>
              onChange({
                ...s,
                viewportSize: Number(viewportSize) || 240,
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Output size (px)"
            value={String(s.outputSize)}
            onChange={(outputSize) =>
              onChange({
                ...s,
                outputSize: Number(outputSize) || 256,
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Min zoom"
            value={String(s.minZoom)}
            onChange={(minZoom) =>
              onChange({
                ...s,
                minZoom: Number(minZoom) || 1,
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Max zoom"
            value={String(s.maxZoom)}
            onChange={(maxZoom) =>
              onChange({
                ...s,
                maxZoom: Number(maxZoom) || 3,
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Zoom step"
            value={String(s.zoomStep)}
            onChange={(zoomStep) =>
              onChange({
                ...s,
                zoomStep: Number(zoomStep) || 0.05,
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "hidden-input": {
      const s = settings as ControlSettingsBySlug["hidden-input"];
      return (
        <div className={shellStyles.settingsGrid}>
          <CommonFieldSettings
            includeValue={false}
            settings={s}
            onChange={(next) => onChange({ ...s, ...next })}
          />
          <SettingInput
            label="Name"
            value={s.name}
            onChange={(name) => onChange({ ...s, name } as ControlSettings)}
          />
          <SettingInput
            label="Value"
            value={s.value}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
          />
        </div>
      );
    }
    case "button":
    case "submit-button":
    case "reset-button": {
      const s = settings as ControlSettingsBySlug["button"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Density"
            value={s.size ?? "md"}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Compact", value: "sm" },
              { label: "Comfortable", value: "md" },
              { label: "Spacious", value: "lg" },
            ]}
          />
          <SettingSelect
            label="Variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({
                ...s,
                variant: variant as typeof s.variant,
              } as ControlSettings)
            }
            options={buttonVariants.map((variant) => ({
              label: variant[0].toUpperCase() + variant.slice(1),
              value: variant,
            }))}
          />
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <SettingToggle
            label="Disabled"
            checked={s.disabled}
            onChange={(disabled) =>
              onChange({ ...s, disabled } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "theme-toggle": {
      const s = settings as ControlSettingsBySlug["theme-toggle"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Layout mode"
            value={s.mode}
            onChange={(mode) =>
              onChange({ ...s, mode: mode as typeof s.mode } as ControlSettings)
            }
            options={[
              { label: "Stacked", value: "stacked" },
              { label: "Flagged", value: "flagged" },
            ]}
          />
          <SettingSelect
            label="Label position"
            value={s.labelPosition}
            onChange={(labelPosition) =>
              onChange({
                ...s,
                labelPosition: labelPosition as typeof s.labelPosition,
              } as ControlSettings)
            }
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
          />
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <HelpTextSettings settings={s} onChange={onChange} />
          <SettingSelect
            label="Value"
            value={s.value}
            onChange={(value) =>
              onChange({
                ...s,
                value: value as typeof s.value,
              } as ControlSettings)
            }
            options={[
              { label: "Dark", value: "dark" },
              { label: "Light", value: "light" },
            ]}
          />
        </div>
      );
    }
    case "accent-color-picker": {
      const s = settings as ControlSettingsBySlug["accent-color-picker"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Layout mode"
            value={s.mode}
            onChange={(mode) =>
              onChange({ ...s, mode: mode as typeof s.mode } as ControlSettings)
            }
            options={[
              { label: "Stacked", value: "stacked" },
              { label: "Flagged", value: "flagged" },
            ]}
          />
          <SettingSelect
            label="Label position"
            value={s.labelPosition}
            onChange={(labelPosition) =>
              onChange({
                ...s,
                labelPosition: labelPosition as typeof s.labelPosition,
              } as ControlSettings)
            }
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
          />
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <HelpTextSettings settings={s} onChange={onChange} />
          <SettingSelect
            label="Value"
            value={s.value}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
            options={[
              { label: "Purple", value: "#8f6cff" },
              { label: "Blue", value: "#3b82f6" },
              { label: "Cyan", value: "#06b6d4" },
              { label: "Green", value: "#22c55e" },
              { label: "Amber", value: "#f59e0b" },
              { label: "Rose", value: "#f43f5e" },
            ]}
          />
        </div>
      );
    }
    case "icon-picker": {
      const s = settings as ControlSettingsBySlug["icon-picker"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Layout mode"
            value={s.mode}
            onChange={(mode) =>
              onChange({ ...s, mode: mode as typeof s.mode } as ControlSettings)
            }
            options={[
              { label: "Stacked", value: "stacked" },
              { label: "Flagged", value: "flagged" },
            ]}
          />
          <SettingSelect
            label="Label position"
            value={s.labelPosition}
            onChange={(labelPosition) =>
              onChange({
                ...s,
                labelPosition: labelPosition as typeof s.labelPosition,
              } as ControlSettings)
            }
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          </div>
          <HelpTextSettings settings={s} onChange={onChange} />
          <div className={shellStyles.settingsFullWidth}>
            <IconPicker
              id="settings-icon-picker"
              label="Value"
              labelPosition="left"
              mode="stacked"
              value={s.value}
              onChange={(value) => onChange({ ...s, value } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "emoji-picker": {
      const s = settings as ControlSettingsBySlug["emoji-picker"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Picker open"
            checked={s.open}
            onChange={(open) => onChange({ ...s, open } as ControlSettings)}
          />
          <SettingToggle
            label="Outside dismiss"
            checked={s.closeOnOutside}
            onChange={(closeOnOutside) =>
              onChange({ ...s, closeOnOutside } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.closeOnEscape}
            onChange={(closeOnEscape) =>
              onChange({ ...s, closeOnEscape } as ControlSettings)
            }
          />
          <SettingSelect
            label="Placement"
            value={s.placement}
            onChange={(placement) =>
              onChange({
                ...s,
                placement: placement as typeof s.placement,
              } as ControlSettings)
            }
            options={[
              { label: "Top", value: "top" },
              { label: "Bottom", value: "bottom" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Search placeholder"
              value={s.searchPlaceholder}
              onChange={(searchPlaceholder) =>
                onChange({ ...s, searchPlaceholder } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Last selected"
              value={s.lastSelected}
              onChange={(lastSelected) =>
                onChange({ ...s, lastSelected } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "tooltip": {
      const s = settings as ControlSettingsBySlug["tooltip"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Demo label"
            value={s.demoLabel}
            onChange={(demoLabel) =>
              onChange({ ...s, demoLabel } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Tooltip content"
              value={s.content}
              onChange={(content) =>
                onChange({ ...s, content } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "dialog": {
      const s = settings as ControlSettingsBySlug["dialog"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Dialog open"
            checked={s.open}
            onChange={(open) => onChange({ ...s, open } as ControlSettings)}
          />
          <SettingToggle
            label="Background dismiss"
            checked={s.dismissOnBackdrop}
            onChange={(dismissOnBackdrop) =>
              onChange({ ...s, dismissOnBackdrop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.dismissOnEscape}
            onChange={(dismissOnEscape) =>
              onChange({ ...s, dismissOnEscape } as ControlSettings)
            }
          />
          <SettingSelect
            label="Action type"
            value={s.actionSet}
            onChange={(actionSet) => {
              const nextActionSet = actionSet as typeof s.actionSet;
              const copy = dialogActionCopy[nextActionSet];
              onChange({
                ...s,
                actionSet: nextActionSet,
                description: copy.description,
                title: copy.title,
              } as ControlSettings);
            }}
            options={[
              { label: "OK", value: "ok" },
              { label: "OK / Cancel", value: "ok-cancel" },
              { label: "Yes / No", value: "yes-no" },
              { label: "Delete confirmation", value: "delete" },
            ]}
          />
          <SettingSelect
            label="Status"
            value={s.status}
            onChange={(status) =>
              onChange({
                ...s,
                status: status as typeof s.status,
              } as ControlSettings)
            }
            options={[
              { label: "Error", value: "error" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Info", value: "info" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Description"
              value={s.description}
              onChange={(description) =>
                onChange({ ...s, description } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "drawer": {
      const s = settings as ControlSettingsBySlug["drawer"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Drawer open"
            checked={s.open}
            onChange={(open) => onChange({ ...s, open } as ControlSettings)}
          />
          <SettingToggle
            label="Background dismiss"
            checked={s.dismissOnBackdrop}
            onChange={(dismissOnBackdrop) =>
              onChange({ ...s, dismissOnBackdrop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.dismissOnEscape}
            onChange={(dismissOnEscape) =>
              onChange({ ...s, dismissOnEscape } as ControlSettings)
            }
          />
          <SettingToggle
            label="Close button"
            checked={s.closeButton}
            onChange={(closeButton) =>
              onChange({ ...s, closeButton } as ControlSettings)
            }
          />
          <SettingToggle
            label="Footer actions"
            checked={s.footerActions}
            onChange={(footerActions) =>
              onChange({ ...s, footerActions } as ControlSettings)
            }
          />
          <SettingSelect
            label="Content type"
            value={s.contentType}
            onChange={(contentType) =>
              onChange({
                ...s,
                contentType: contentType as typeof s.contentType,
              } as ControlSettings)
            }
            options={[
              { label: "HTML content", value: "html" },
              { label: "Form fields", value: "form" },
            ]}
          />
          <SettingSelect
            label="Side"
            value={s.side}
            onChange={(side) =>
              onChange({ ...s, side: side as typeof s.side } as ControlSettings)
            }
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
              { label: "Top", value: "top" },
              { label: "Bottom", value: "bottom" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Description"
              value={s.description}
              onChange={(description) =>
                onChange({ ...s, description } as ControlSettings)
              }
            />
          </div>
          {s.contentType === "html" ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingTextarea
                label="Content"
                value={s.content}
                onChange={(content) =>
                  onChange({ ...s, content } as ControlSettings)
                }
              />
            </div>
          ) : null}
        </div>
      );
    }
    case "dropdown-menu": {
      const s = settings as ControlSettingsBySlug["dropdown-menu"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Menu open"
            checked={s.open}
            onChange={(open) => onChange({ ...s, open } as ControlSettings)}
          />
          <SettingToggle
            label="Outside dismiss"
            checked={s.closeOnOutside}
            onChange={(closeOnOutside) =>
              onChange({ ...s, closeOnOutside } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.closeOnEscape}
            onChange={(closeOnEscape) =>
              onChange({ ...s, closeOnEscape } as ControlSettings)
            }
          />
          <SettingToggle
            label="Close on select"
            checked={s.closeOnSelect}
            onChange={(closeOnSelect) =>
              onChange({ ...s, closeOnSelect } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show icons"
            checked={s.showIcons}
            onChange={(showIcons) =>
              onChange({ ...s, showIcons } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <p className={shellStyles.settingsHint}>
              The icon column appears only when at least one item includes an
              icon or checked state.
            </p>
          </div>
          <SettingToggle
            label="Disabled item"
            checked={s.showDisabled}
            onChange={(showDisabled) =>
              onChange({ ...s, showDisabled } as ControlSettings)
            }
          />
          <SettingToggle
            label="Destructive item"
            checked={s.showDestructive}
            onChange={(showDestructive) =>
              onChange({ ...s, showDestructive } as ControlSettings)
            }
          />
          <SettingSelect
            label="Placement"
            value={s.placement}
            onChange={(placement) =>
              onChange({
                ...s,
                placement: placement as typeof s.placement,
              } as ControlSettings)
            }
            options={[
              { label: "Bottom start", value: "bottom-start" },
              { label: "Bottom end", value: "bottom-end" },
              { label: "Top start", value: "top-start" },
              { label: "Top end", value: "top-end" },
            ]}
          />
        </div>
      );
    }
    case "context-menu": {
      const s = settings as ControlSettingsBySlug["context-menu"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Target label"
            value={s.targetLabel}
            onChange={(targetLabel: string) =>
              onChange({ ...s, targetLabel } as ControlSettings)
            }
          />
          <SettingToggle
            label="Menu open"
            checked={s.open}
            onChange={(open) => onChange({ ...s, open } as ControlSettings)}
          />
          <SettingToggle
            label="Outside dismiss"
            checked={s.closeOnOutside}
            onChange={(closeOnOutside) =>
              onChange({ ...s, closeOnOutside } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.closeOnEscape}
            onChange={(closeOnEscape) =>
              onChange({ ...s, closeOnEscape } as ControlSettings)
            }
          />
          <SettingToggle
            label="Close on select"
            checked={s.closeOnSelect}
            onChange={(closeOnSelect) =>
              onChange({ ...s, closeOnSelect } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show icons"
            checked={s.showIcons}
            onChange={(showIcons) =>
              onChange({ ...s, showIcons } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <p className={shellStyles.settingsHint}>
              The icon column appears only when at least one item includes an
              icon or checked state.
            </p>
          </div>
          <SettingToggle
            label="Disabled item"
            checked={s.showDisabled}
            onChange={(showDisabled) =>
              onChange({ ...s, showDisabled } as ControlSettings)
            }
          />
          <SettingToggle
            label="Destructive item"
            checked={s.showDestructive}
            onChange={(showDestructive) =>
              onChange({ ...s, showDestructive } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "command-palette": {
      const s = settings as ControlSettingsBySlug["command-palette"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Palette open"
            checked={s.open}
            onChange={(open) => onChange({ ...s, open } as ControlSettings)}
          />
          <SettingToggle
            label="Outside dismiss"
            checked={s.dismissOnBackdrop}
            onChange={(dismissOnBackdrop) =>
              onChange({ ...s, dismissOnBackdrop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.dismissOnEscape}
            onChange={(dismissOnEscape) =>
              onChange({ ...s, dismissOnEscape } as ControlSettings)
            }
          />
          <SettingToggle
            label="Close on select"
            checked={s.closeOnSelect}
            onChange={(closeOnSelect) =>
              onChange({ ...s, closeOnSelect } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show shortcuts"
            checked={s.showShortcuts}
            onChange={(showShortcuts) =>
              onChange({ ...s, showShortcuts } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show descriptions"
            checked={s.showDescriptions}
            onChange={(showDescriptions) =>
              onChange({ ...s, showDescriptions } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show groups"
            checked={s.showGroups}
            onChange={(showGroups) =>
              onChange({ ...s, showGroups } as ControlSettings)
            }
          />
          <SettingToggle
            label="Preview empty results"
            checked={s.showEmptyResults}
            onChange={(showEmptyResults) =>
              onChange({ ...s, showEmptyResults } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) =>
                onChange({ ...s, placeholder } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Empty message"
              value={s.emptyMessage}
              onChange={(emptyMessage) =>
                onChange({ ...s, emptyMessage } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "modal": {
      const s = settings as ControlSettingsBySlug["modal"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Modal open"
            checked={s.open}
            onChange={(open) => onChange({ ...s, open } as ControlSettings)}
          />
          <SettingToggle
            label="Background dismiss"
            checked={s.dismissOnBackdrop}
            onChange={(dismissOnBackdrop) =>
              onChange({ ...s, dismissOnBackdrop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.dismissOnEscape}
            onChange={(dismissOnEscape) =>
              onChange({ ...s, dismissOnEscape } as ControlSettings)
            }
          />
          <SettingToggle
            label="Close button"
            checked={s.closeButton}
            onChange={(closeButton) =>
              onChange({ ...s, closeButton } as ControlSettings)
            }
          />
          <SettingToggle
            label="Footer actions"
            checked={s.footerActions}
            onChange={(footerActions) =>
              onChange({ ...s, footerActions } as ControlSettings)
            }
          />
          <SettingSelect
            label="Content type"
            value={s.contentType}
            onChange={(contentType) =>
              onChange({
                ...s,
                contentType: contentType as typeof s.contentType,
              } as ControlSettings)
            }
            options={[
              { label: "HTML content", value: "html" },
              { label: "Form fields", value: "form" },
            ]}
          />
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
              { label: "Fullscreen", value: "fullscreen" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Description"
              value={s.description}
              onChange={(description) =>
                onChange({ ...s, description } as ControlSettings)
              }
            />
          </div>
          {s.contentType === "html" ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingTextarea
                label="Content"
                value={s.content}
                onChange={(content) =>
                  onChange({ ...s, content } as ControlSettings)
                }
              />
            </div>
          ) : null}
        </div>
      );
    }
    case "popover": {
      const s = settings as ControlSettingsBySlug["popover"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Popover open"
            checked={s.open}
            onChange={(open) => onChange({ ...s, open } as ControlSettings)}
          />
          <SettingToggle
            label="Outside dismiss"
            checked={s.closeOnOutside}
            onChange={(closeOnOutside) =>
              onChange({ ...s, closeOnOutside } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.closeOnEscape}
            onChange={(closeOnEscape) =>
              onChange({ ...s, closeOnEscape } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show arrow"
            checked={s.showArrow}
            onChange={(showArrow) =>
              onChange({ ...s, showArrow } as ControlSettings)
            }
          />
          <SettingSelect
            label="Content type"
            value={s.contentType}
            onChange={(contentType) =>
              onChange({
                ...s,
                contentType: contentType as typeof s.contentType,
              } as ControlSettings)
            }
            options={[
              { label: "HTML content", value: "html" },
              { label: "Form fields", value: "form" },
            ]}
          />
          <SettingSelect
            label="Placement"
            value={s.placement}
            onChange={(placement) =>
              onChange({
                ...s,
                placement: placement as typeof s.placement,
              } as ControlSettings)
            }
            options={[
              { label: "Top", value: "top" },
              { label: "Right", value: "right" },
              { label: "Bottom", value: "bottom" },
              { label: "Left", value: "left" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          {s.contentType === "html" ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingTextarea
                label="Content"
                value={s.content}
                onChange={(content) =>
                  onChange({ ...s, content } as ControlSettings)
                }
              />
            </div>
          ) : null}
        </div>
      );
    }
    case "alert": {
      const s = settings as ControlSettingsBySlug["alert"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Show alert"
            checked={s.visible}
            onChange={(visible) =>
              onChange({ ...s, visible } as ControlSettings)
            }
          />
          <SettingSelect
            label="Status"
            value={s.status}
            onChange={(status) =>
              onChange({
                ...s,
                status: status as typeof s.status,
              } as ControlSettings)
            }
            options={[
              { label: "Error", value: "error" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Info", value: "info" },
            ]}
          />
          <SettingToggle
            label="Dismissible"
            checked={s.dismissible}
            onChange={(dismissible) =>
              onChange({ ...s, dismissible } as ControlSettings)
            }
          />
          <SettingToggle
            label="Flagged icon"
            checked={s.iconFlagged}
            onChange={(iconFlagged) =>
              onChange({ ...s, iconFlagged } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Description"
              value={s.description}
              onChange={(description) =>
                onChange({ ...s, description } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "toast": {
      const s = settings as ControlSettingsBySlug["toast"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Vertical position"
            value={s.positionVertical}
            onChange={(positionVertical) =>
              onChange({
                ...s,
                positionVertical: positionVertical as typeof s.positionVertical,
              } as ControlSettings)
            }
            options={[
              { label: "Top", value: "top" },
              { label: "Bottom", value: "bottom" },
            ]}
          />
          <SettingSelect
            label="Horizontal position"
            value={s.positionHorizontal}
            onChange={(positionHorizontal) =>
              onChange({
                ...s,
                positionHorizontal:
                  positionHorizontal as typeof s.positionHorizontal,
              } as ControlSettings)
            }
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
          />
          <SettingSelect
            label="Status"
            value={s.status}
            onChange={(status) =>
              onChange({
                ...s,
                status: status as typeof s.status,
              } as ControlSettings)
            }
            options={[
              { label: "Error", value: "error" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Info", value: "info" },
            ]}
          />
          <SettingToggle
            label="Dismissible"
            checked={s.dismissible}
            onChange={(dismissible) =>
              onChange({ ...s, dismissible } as ControlSettings)
            }
          />
          <SettingToggle
            label="Auto dismiss (3s)"
            checked={s.autoDismissEnabled}
            onChange={(autoDismissEnabled) =>
              onChange({ ...s, autoDismissEnabled } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show description"
            checked={s.descriptionEnabled}
            onChange={(descriptionEnabled) =>
              onChange({ ...s, descriptionEnabled } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          {s.descriptionEnabled ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingTextarea
                label="Description"
                value={s.description}
                onChange={(description) =>
                  onChange({ ...s, description } as ControlSettings)
                }
              />
            </div>
          ) : null}
        </div>
      );
    }
    case "card": {
      const s = settings as ControlSettingsBySlug["card"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Tone"
            value={s.tone}
            onChange={(tone) =>
              onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)
            }
            options={[
              { label: "Default", value: "default" },
              { label: "Accent", value: "accent" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Danger", value: "danger" },
              { label: "Info", value: "info" },
            ]}
          />
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Media"
            checked={s.media}
            onChange={(media) => onChange({ ...s, media } as ControlSettings)}
          />
          <SettingToggle
            label="Footer actions"
            checked={s.footerActions}
            onChange={(footerActions) =>
              onChange({ ...s, footerActions } as ControlSettings)
            }
          />
          <SettingInput
            label="Eyebrow"
            value={s.eyebrow}
            onChange={(eyebrow) =>
              onChange({ ...s, eyebrow } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Content"
              value={s.content}
              onChange={(content) =>
                onChange({ ...s, content } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "kpi-card":
    case "stat-card": {
      const s = settings as ControlSettingsBySlug["stat-card"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <div className={shellStyles.settingsFullWidth}>
            <IconPicker
              id="opus-setting-stat-card-icon"
              label="Icon"
              labelPosition="left"
              mode="stacked"
              value={s.icon}
              onChange={(icon) => onChange({ ...s, icon } as ControlSettings)}
            />
          </div>
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Trend badge"
            checked={s.showChange}
            onChange={(showChange) =>
              onChange({ ...s, showChange } as ControlSettings)
            }
          />
          {s.showChange ? (
            <SettingSelect
              label="Trend"
              value={s.trend}
              onChange={(trend) =>
                onChange({
                  ...s,
                  trend: trend as typeof s.trend,
                } as ControlSettings)
              }
              options={[
                { label: "Up", value: "up" },
                { label: "Down", value: "down" },
              ]}
            />
          ) : null}
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Value"
              value={s.value}
              onChange={(value) => onChange({ ...s, value } as ControlSettings)}
            />
          </div>
          {s.showChange ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Change"
                value={s.change}
                onChange={(change) =>
                  onChange({ ...s, change } as ControlSettings)
                }
              />
            </div>
          ) : null}
        </div>
      );
    }
    case "gauge": {
      const s = settings as ControlSettingsBySlug["gauge"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <SettingSelect
            label="Variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({
                ...s,
                variant: variant as typeof s.variant,
              } as ControlSettings)
            }
            options={[
              { label: "Half", value: "half" },
              { label: "Full", value: "full" },
            ]}
          />
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingSelect
            label="Palette"
            value={s.palette}
            onChange={(palette) =>
              onChange({
                ...s,
                palette: palette as typeof s.palette,
              } as ControlSettings)
            }
            options={gaugePaletteOptions.map((palette) => ({
              label:
                palette === "opus"
                  ? "Opus"
                  : palette.charAt(0).toUpperCase() + palette.slice(1),
              value: palette,
            }))}
          />
          <SettingSelect
            label="Track colour"
            value={s.trackTone}
            onChange={(trackTone) =>
              onChange({
                ...s,
                trackTone: trackTone as typeof s.trackTone,
              } as ControlSettings)
            }
            options={gaugeTrackToneOptions.map((trackTone) => ({
              label:
                trackTone === "palette"
                  ? "From palette"
                  : trackTone.charAt(0).toUpperCase() + trackTone.slice(1),
              value: trackTone,
            }))}
          />
          <SettingSelect
            label="Range colour"
            value={s.valueTone}
            onChange={(valueTone) =>
              onChange({
                ...s,
                valueTone: valueTone as typeof s.valueTone,
              } as ControlSettings)
            }
            options={gaugeValueToneOptions.map((valueTone) => ({
              label:
                valueTone === "palette"
                  ? "From palette"
                  : valueTone.charAt(0).toUpperCase() + valueTone.slice(1),
              value: valueTone,
            }))}
          />
          <SettingSelect
            label="Footer metrics"
            value={String(s.footerMetricCount)}
            onChange={(footerMetricCount) =>
              onChange({
                ...s,
                footerMetricCount: Number(footerMetricCount),
              } as ControlSettings)
            }
            options={[
              { label: "None", value: "0" },
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5", value: "5" },
            ]}
          />
          <SettingSelect
            label="Change trend"
            value={s.changeTrend}
            onChange={(changeTrend) =>
              onChange({
                ...s,
                changeTrend: changeTrend as typeof s.changeTrend,
              } as ControlSettings)
            }
            options={[
              { label: "Up", value: "up" },
              { label: "Down", value: "down" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Subtitle"
              value={s.subtitle}
              onChange={(subtitle) =>
                onChange({ ...s, subtitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Change"
              value={s.change}
              onChange={(change) =>
                onChange({ ...s, change } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Summary"
              value={s.summary}
              onChange={(summary) =>
                onChange({ ...s, summary } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "sparkline": {
      const s = settings as ControlSettingsBySlug["sparkline"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <SettingSelect
            label="Palette"
            value={s.palette}
            onChange={(palette) =>
              onChange({
                ...s,
                palette: palette as typeof s.palette,
              } as ControlSettings)
            }
            options={[
              { label: "Opus", value: "opus" },
              { label: "Cool", value: "cool" },
              { label: "Warm", value: "warm" },
              { label: "Mono", value: "mono" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "progress-ring":
    case "progress-bar":
    case "speedometer": {
      const s = settings as ControlSettingsBySlug["progress-ring"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <SettingInput
            label="Value"
            type="number"
            value={String(s.value)}
            onChange={(value) =>
              onChange({ ...s, value: Number(value) || 0 } as ControlSettings)
            }
          />
          <SettingInput
            label="Max"
            type="number"
            value={String(s.max)}
            onChange={(max) =>
              onChange({ ...s, max: Number(max) || 100 } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "metric-tile": {
      const s = settings as ControlSettingsBySlug["metric-tile"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <div className={shellStyles.settingsFullWidth}>
            <IconPicker
              id="opus-setting-metric-tile-icon"
              label="Icon"
              labelPosition="left"
              mode="stacked"
              value={s.icon}
              onChange={(icon) => onChange({ ...s, icon } as ControlSettings)}
            />
          </div>
          <SettingToggle
            label="Sparkline"
            checked={s.showSparkline}
            onChange={(showSparkline) =>
              onChange({ ...s, showSparkline } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Value"
              value={s.value}
              onChange={(value) => onChange({ ...s, value } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "map": {
      const s = settings as ControlSettingsBySlug["map"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout ?? "single"}
            onChange={(previewLayout) => onChange({ ...s, previewLayout } as ControlSettings)}
          />
          <SettingToggle
            label="Widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) => onChange({ ...s, wrapInContainer } as ControlSettings)}
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <SettingInput label="Longitude" type="number" value={String(s.longitude)} onChange={(value) => onChange({ ...s, longitude: Number(value) || 0 } as ControlSettings)} />
          <SettingInput label="Latitude" type="number" value={String(s.latitude)} onChange={(value) => onChange({ ...s, latitude: Number(value) || 0 } as ControlSettings)} />
          <SettingInput label="Zoom" type="number" value={String(s.zoom)} onChange={(value) => onChange({ ...s, zoom: Math.max(0, Math.min(20, Number(value) || 0)) } as ControlSettings)} />
          <SettingSelect
            label="Markers"
            value={String(s.markerCount)}
            options={[0, 1, 2, 3, 4, 5, 6].map((value) => ({ label: String(value), value: String(value) }))}
            onChange={(value) => onChange({ ...s, markerCount: Number(value) } as ControlSettings)}
          />
          <SettingToggle label="Interactive" checked={s.interactive} onChange={(interactive) => onChange({ ...s, interactive } as ControlSettings)} />
          <SettingToggle label="Navigation" checked={s.showNavigation} onChange={(showNavigation) => onChange({ ...s, showNavigation } as ControlSettings)} />
          <SettingToggle label="Current location" checked={s.showGeolocate ?? true} onChange={(showGeolocate) => onChange({ ...s, showGeolocate } as ControlSettings)} />
          <SettingToggle label="Place search" checked={s.showSearch ?? true} onChange={(showSearch) => onChange({ ...s, showSearch } as ControlSettings)} />
          <SettingToggle label="Attribution" checked={s.showAttribution} onChange={(showAttribution) => onChange({ ...s, showAttribution } as ControlSettings)} />
          <SettingToggle label="Coordinates" checked={s.showCoordinates ?? true} onChange={(showCoordinates) => onChange({ ...s, showCoordinates } as ControlSettings)} />
          <SettingToggle label="Resolved address" checked={s.showAddress ?? true} onChange={(showAddress) => onChange({ ...s, showAddress } as ControlSettings)} />
          <SettingToggle label="Hotspot panel" checked={s.showHotspots ?? true} onChange={(showHotspots) => onChange({ ...s, showHotspots } as ControlSettings)} />
        </div>
      );
    }
    case "dashboard-content-container": {
      const s =
        settings as ControlSettingsBySlug["dashboard-content-container"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <DashboardWidthSetting
            value={s.width ?? "widget"}
            onChange={(width) => onChange({ ...s, width } as ControlSettings)}
          />
          <DashboardHeightSetting
            value={s.height ?? "auto"}
            onChange={(height) => onChange({ ...s, height } as ControlSettings)}
          />
          <SettingToggle
            label="Padding top"
            checked={s.paddingTop ?? true}
            onChange={(paddingTop) =>
              onChange({ ...s, paddingTop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Padding bottom"
            checked={s.paddingBottom ?? true}
            onChange={(paddingBottom) =>
              onChange({ ...s, paddingBottom } as ControlSettings)
            }
          />
          <SettingToggle
            label="Padding left"
            checked={s.paddingLeft ?? true}
            onChange={(paddingLeft) =>
              onChange({ ...s, paddingLeft } as ControlSettings)
            }
          />
          <SettingToggle
            label="Padding right"
            checked={s.paddingRight ?? true}
            onChange={(paddingRight) =>
              onChange({ ...s, paddingRight } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "pipeline-overview": {
      const s = settings as ControlSettingsBySlug["pipeline-overview"];
      const stageCount = Math.min(5, Math.max(1, Number(s.stageCount) || 5));
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Total label"
              value={s.totalLabel}
              onChange={(totalLabel) =>
                onChange({ ...s, totalLabel } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Total value"
              value={s.totalValue}
              onChange={(totalValue) =>
                onChange({ ...s, totalValue } as ControlSettings)
              }
            />
          </div>
          <SettingSelect
            label="Funnel stages"
            value={String(stageCount)}
            onChange={(stageCountValue) =>
              onChange({ ...s, stageCount: stageCountValue } as ControlSettings)
            }
            options={pipelineStageCountOptions}
          />
          {pipelineStageValueFields.slice(0, stageCount).map((field) => (
            <SettingSelect
              key={field.valueKey}
              label={field.label}
              value={s[field.valueKey]}
              onChange={(nextValue) =>
                onChange({
                  ...s,
                  [field.valueKey]: nextValue,
                } as ControlSettings)
              }
              options={pipelineValueOptions}
            />
          ))}
          <SettingSelect
            label="Period"
            value={s.period}
            onChange={(period) => onChange({ ...s, period } as ControlSettings)}
            options={[
              { label: "This Month", value: "This Month" },
              { label: "Last Month", value: "Last Month" },
              { label: "This Quarter", value: "This Quarter" },
              { label: "This Year", value: "This Year" },
            ]}
          />
        </div>
      );
    }
    case "deals-over-time": {
      const s = settings as ControlSettingsBySlug["deals-over-time"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <SettingSelect
            label="Period"
            value={s.period}
            onChange={(period) => onChange({ ...s, period } as ControlSettings)}
            options={[
              { label: "This Month", value: "This Month" },
              { label: "Last Month", value: "Last Month" },
              { label: "This Quarter", value: "This Quarter" },
              { label: "This Year", value: "This Year" },
            ]}
          />
          <SettingSelect
            label="Palette"
            value={s.palette ?? "purple"}
            onChange={(palette) =>
              onChange({ ...s, palette } as ControlSettings)
            }
            options={[
              { label: "Purple", value: "purple" },
              { label: "Blue", value: "blue" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <SettingInput
            label="Y-axis max"
            value={s.maxValue}
            onChange={(maxValue) =>
              onChange({ ...s, maxValue } as ControlSettings)
            }
          />
          <SettingInput
            label="Value label"
            value={s.valueLabel}
            onChange={(valueLabel) =>
              onChange({ ...s, valueLabel } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "lab-dashboard-list-columns": {
      const s = settings as ControlSettingsBySlug["dashboard-list-columns"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <DashboardWidthSetting
            value={s.width ?? "full"}
            onChange={(width) => onChange({ ...s, width } as ControlSettings)}
          />
          <SettingSelect
            label="Layout"
            value={s.layout}
            onChange={(layout) =>
              onChange({
                ...s,
                layout: layout as typeof s.layout,
              } as ControlSettings)
            }
            options={[
              { label: "Side by side", value: "row" },
              { label: "Stacked", value: "stacked" },
            ]}
          />
          <SettingSelect
            label="Checkbox size"
            value={s.checkboxSize ?? "md"}
            onChange={(checkboxSize) =>
              onChange({
                ...s,
                checkboxSize: checkboxSize as typeof s.checkboxSize,
              } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Upcoming tasks title"
              value={s.upcomingTasksTitle}
              onChange={(upcomingTasksTitle) =>
                onChange({ ...s, upcomingTasksTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Upcoming tasks footer"
              value={s.upcomingTasksFooterLabel}
              onChange={(upcomingTasksFooterLabel) =>
                onChange({ ...s, upcomingTasksFooterLabel } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Recent activity title"
              value={s.recentActivityTitle}
              onChange={(recentActivityTitle) =>
                onChange({ ...s, recentActivityTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Recent activity footer"
              value={s.recentActivityFooterLabel}
              onChange={(recentActivityFooterLabel) =>
                onChange({ ...s, recentActivityFooterLabel } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Top people title"
              value={s.topPerformingUsersTitle}
              onChange={(topPerformingUsersTitle) =>
                onChange({ ...s, topPerformingUsersTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Top people footer"
              value={s.topPerformingUsersFooterLabel}
              onChange={(topPerformingUsersFooterLabel) =>
                onChange({
                  ...s,
                  topPerformingUsersFooterLabel,
                } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "lab-contact-details": {
      const s = settings as ControlSettingsBySlug["lab-contact-details"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Staff / user record"
            checked={s.isStaffRecord ?? false}
            onChange={(isStaffRecord) => onChange({ ...s, isStaffRecord } as ControlSettings)}
          />
          <SettingToggle
            label="Header actions"
            checked={s.showActions}
            onChange={(showActions) => onChange({ ...s, showActions } as ControlSettings)}
          />
          <SettingToggle
            label="Contact status"
            checked={s.showStatus}
            onChange={(showStatus) => onChange({ ...s, showStatus } as ControlSettings)}
          />
          <SettingToggle
            label="Notes activity (host)"
            checked={s.showNotes}
            onChange={(showNotes) => onChange({ ...s, showNotes } as ControlSettings)}
          />
          <SettingSelect
            label="Summary tabs variant"
            value={s.summaryTabsVariant}
            onChange={(summaryTabsVariant) =>
              onChange({
                ...s,
                summaryTabsVariant: summaryTabsVariant as typeof s.summaryTabsVariant,
              } as ControlSettings)
            }
            options={[
              { label: "Line", value: "line" },
              { label: "Contained", value: "contained" },
              { label: "Card", value: "card" },
            ]}
          />
          <SettingSelect
            label="Notes active tab"
            value={s.notesActiveTab ?? "notes"}
            onChange={(notesActiveTab) =>
              onChange({
                ...s,
                notesActiveTab: notesActiveTab as typeof s.notesActiveTab,
              } as ControlSettings)
            }
            options={[
              { label: "Notes", value: "notes" },
              { label: "Activities", value: "activities" },
              { label: "Documents", value: "documents" },
              { label: "Other Details", value: "additional" },
            ]}
          />
          <SettingSelect
            label="Notes tabs variant"
            value={s.notesTabsVariant}
            onChange={(notesTabsVariant) =>
              onChange({
                ...s,
                notesTabsVariant: notesTabsVariant as typeof s.notesTabsVariant,
              } as ControlSettings)
            }
            options={[
              { label: "Line", value: "line" },
              { label: "Contained", value: "contained" },
              { label: "Card", value: "card" },
            ]}
          />
        </div>
      );
    }
    case "lab-contact-card": {
      const s = settings as ControlSettingsBySlug["lab-contact-card"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Staff / user record"
            checked={s.isStaffRecord ?? false}
            onChange={(isStaffRecord) => onChange({ ...s, isStaffRecord } as ControlSettings)}
          />
          <SettingToggle
            label="Header actions"
            checked={s.showActions}
            onChange={(showActions) => onChange({ ...s, showActions } as ControlSettings)}
          />
          <SettingToggle
            label="Contact status"
            checked={s.showStatus}
            onChange={(showStatus) => onChange({ ...s, showStatus } as ControlSettings)}
          />
          <SettingSelect
            label="Summary tabs variant"
            value={s.summaryTabsVariant}
            onChange={(summaryTabsVariant) =>
              onChange({
                ...s,
                summaryTabsVariant: summaryTabsVariant as typeof s.summaryTabsVariant,
              } as ControlSettings)
            }
            options={[
              { label: "Line", value: "line" },
              { label: "Contained", value: "contained" },
              { label: "Card", value: "card" },
            ]}
          />
        </div>
      );
    }
    case "lab-dashboard-welcome": {
      const s = settings as ControlSettingsBySlug["lab-dashboard-welcome"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Name"
            value={s.name}
            onChange={(name) => onChange({ ...s, name } as ControlSettings)}
          />
          <SettingInput
            label="Subtitle"
            value={s.subtitle}
            onChange={(subtitle) => onChange({ ...s, subtitle } as ControlSettings)}
          />
          <SettingSelect
            label="Greeting"
            value={s.greeting}
            onChange={(greeting) => onChange({ ...s, greeting } as ControlSettings)}
            options={[
              { label: "Automatic", value: "auto" },
              { label: "Morning", value: "morning" },
              { label: "Afternoon", value: "afternoon" },
              { label: "Evening", value: "evening" },
            ]}
          />
          <SettingSelect
            label="Tiles"
            value={s.tileLayout}
            onChange={(tileLayout) => onChange({ ...s, tileLayout } as ControlSettings)}
            options={[
              { label: "Stretch", value: "fill" },
              { label: "Scroll", value: "fixed" },
            ]}
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer}
            onChange={(wrapInContainer) => onChange({ ...s, wrapInContainer } as ControlSettings)}
          />
          <SettingToggle
            label="Wave"
            checked={s.showWave}
            onChange={(showWave) => onChange({ ...s, showWave } as ControlSettings)}
          />
          <SettingToggle
            label="Date"
            checked={s.showDate}
            onChange={(showDate) => onChange({ ...s, showDate } as ControlSettings)}
          />
        </div>
      );
    }
    case "lab-login-form":
    case "lab-register-form":
    case "lab-otp-form":
    case "lab-passkey-login-form":
    case "lab-social-auth-form":
    case "lab-social-register-form": {
      const s = settings as ControlSettingsBySlug["lab-login-form"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Title"
            value={s.title}
            onChange={(title) => onChange({ ...s, title } as ControlSettings)}
          />
          <SettingInput
            label="Subtitle"
            value={s.subtitle}
            onChange={(subtitle) => onChange({ ...s, subtitle } as ControlSettings)}
          />
          <SettingInput
            label="Submit label"
            value={s.submitLabel}
            onChange={(submitLabel) => onChange({ ...s, submitLabel } as ControlSettings)}
          />
        </div>
      );
    }
    case "lab-contact-notes":
    case "lab-notes-activity": {
      const s = settings as ControlSettingsBySlug["notes-activity"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Active tab"
            value={s.activeTab ?? "notes"}
            onChange={(activeTab) =>
              onChange({
                ...s,
                activeTab: activeTab as typeof s.activeTab,
              } as ControlSettings)
            }
            options={[
              { label: "Notes", value: "notes" },
              { label: "Activities", value: "activities" },
              { label: "Documents", value: "documents" },
              { label: "Other Details", value: "additional" },
            ]}
          />
          <SettingSelect
            label="Tabs variant"
            value={s.tabsVariant ?? "card"}
            onChange={(tabsVariant) =>
              onChange({
                ...s,
                tabsVariant: tabsVariant as typeof s.tabsVariant,
              } as ControlSettings)
            }
            options={[
              { label: "Line", value: "line" },
              { label: "Contained", value: "contained" },
              { label: "Card", value: "card" },
            ]}
          />
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <DashboardHeightSetting
            value={s.height ?? "auto"}
            onChange={(height) => onChange({ ...s, height } as ControlSettings)}
          />
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Add note button"
              value={s.addNoteButtonLabel ?? "Add note"}
              onChange={(addNoteButtonLabel) =>
                onChange({ ...s, addNoteButtonLabel } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Modal title"
              value={s.addNoteModalTitle ?? "Add a note"}
              onChange={(addNoteModalTitle) =>
                onChange({ ...s, addNoteModalTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Modal description"
              value={
                s.addNoteModalDescription ??
                "Capture supporting detail, attach files, or mention teammates."
              }
              onChange={(addNoteModalDescription) =>
                onChange({ ...s, addNoteModalDescription } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Composer placeholder"
              value={s.composerPlaceholder}
              onChange={(composerPlaceholder) =>
                onChange({ ...s, composerPlaceholder } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Save button label"
              value={s.saveButtonLabel}
              onChange={(saveButtonLabel) =>
                onChange({ ...s, saveButtonLabel } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Notes footer label"
              value={s.notesFooterLabel}
              onChange={(notesFooterLabel) =>
                onChange({ ...s, notesFooterLabel } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Activity footer label"
              value={s.activityFooterLabel}
              onChange={(activityFooterLabel) =>
                onChange({ ...s, activityFooterLabel } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "user-profile":
    case "lab-user-profile": {
      const s = settings as ControlSettingsBySlug["user-profile"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Name"
              value={s.name}
              onChange={(name) => onChange({ ...s, name } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Role"
              value={s.role}
              onChange={(role) => onChange({ ...s, role } as ControlSettings)}
            />
          </div>
          <SettingSelect
            label="Avatar size"
            value={s.avatarSize}
            onChange={(avatarSize) =>
              onChange({
                ...s,
                avatarSize: avatarSize as typeof s.avatarSize,
              } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "Extra large", value: "xl" },
            ]}
          />
          <SettingToggle
            label="Show photo"
            checked={s.srcEnabled}
            onChange={(srcEnabled) =>
              onChange({ ...s, srcEnabled } as ControlSettings)
            }
          />
          {s.srcEnabled ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Photo URL"
                value={s.src}
                onChange={(src) => onChange({ ...s, src } as ControlSettings)}
              />
            </div>
          ) : null}
          <SettingToggle
            label="Enable photo upload"
            checked={s.photoUploadEnabled}
            onChange={(photoUploadEnabled) =>
              onChange({ ...s, photoUploadEnabled } as ControlSettings)
            }
          />
          {s.photoUploadEnabled ? (
            <>
              <SettingInput
                label="Photo upload menu item id"
                value={s.photoUploadMenuItemId}
                onChange={(photoUploadMenuItemId) =>
                  onChange({ ...s, photoUploadMenuItemId } as ControlSettings)
                }
              />
              <div className={shellStyles.settingsFullWidth}>
                <SettingInput
                  label="Photo upload title"
                  value={s.photoUploadTitle}
                  onChange={(photoUploadTitle) =>
                    onChange({ ...s, photoUploadTitle } as ControlSettings)
                  }
                />
              </div>
              <div className={shellStyles.settingsFullWidth}>
                <SettingInput
                  label="Photo upload description"
                  value={s.photoUploadDescription}
                  onChange={(photoUploadDescription) =>
                    onChange({
                      ...s,
                      photoUploadDescription,
                    } as ControlSettings)
                  }
                />
              </div>
              <SettingInput
                label="Photo upload label"
                value={s.photoUploadLabel}
                onChange={(photoUploadLabel) =>
                  onChange({ ...s, photoUploadLabel } as ControlSettings)
                }
              />
              <SettingInput
                label="Upload label"
                value={s.photoUploadUploadLabel}
                onChange={(photoUploadUploadLabel) =>
                  onChange({ ...s, photoUploadUploadLabel } as ControlSettings)
                }
              />
              <SettingInput
                label="Crop button label"
                value={s.photoUploadCropButtonLabel}
                onChange={(photoUploadCropButtonLabel) =>
                  onChange({
                    ...s,
                    photoUploadCropButtonLabel,
                  } as ControlSettings)
                }
              />
              <SettingInput
                label="Change button label"
                value={s.photoUploadChangeButtonLabel}
                onChange={(photoUploadChangeButtonLabel) =>
                  onChange({
                    ...s,
                    photoUploadChangeButtonLabel,
                  } as ControlSettings)
                }
              />
            </>
          ) : null}
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Menu items (JSON)"
              value={s.menuItemsJson}
              onChange={(menuItemsJson) =>
                onChange({ ...s, menuItemsJson } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "profile-photo-upload": {
      const s = settings as ControlSettingsBySlug["profile-photo-upload"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Field label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          </div>
          <SettingInput
            label="Upload label"
            value={s.uploadLabel}
            onChange={(uploadLabel) =>
              onChange({ ...s, uploadLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Crop button label"
            value={s.cropButtonLabel}
            onChange={(cropButtonLabel) =>
              onChange({ ...s, cropButtonLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Change button label"
            value={s.changeButtonLabel}
            onChange={(changeButtonLabel) =>
              onChange({ ...s, changeButtonLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Zoom label"
            value={s.zoomLabel}
            onChange={(zoomLabel) =>
              onChange({ ...s, zoomLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Viewport size (px)"
            value={String(s.viewportSize)}
            onChange={(viewportSize) =>
              onChange({
                ...s,
                viewportSize: Number(viewportSize) || 240,
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Output size (px)"
            value={String(s.outputSize)}
            onChange={(outputSize) =>
              onChange({
                ...s,
                outputSize: Number(outputSize) || 256,
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Min zoom"
            value={String(s.minZoom)}
            onChange={(minZoom) =>
              onChange({
                ...s,
                minZoom: Number(minZoom) || 1,
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Max zoom"
            value={String(s.maxZoom)}
            onChange={(maxZoom) =>
              onChange({
                ...s,
                maxZoom: Number(maxZoom) || 3,
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Zoom step"
            value={String(s.zoomStep)}
            onChange={(zoomStep) =>
              onChange({
                ...s,
                zoomStep: Number(zoomStep) || 0.05,
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "upcoming-tasks": {
      const s = settings as ControlSettingsBySlug["upcoming-tasks"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <SettingSelect
            label="Checkbox size"
            value={s.checkboxSize ?? "md"}
            onChange={(checkboxSize) =>
              onChange({
                ...s,
                checkboxSize: checkboxSize as typeof s.checkboxSize,
              } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Footer link"
              value={s.footerLabel}
              onChange={(footerLabel) =>
                onChange({ ...s, footerLabel } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "recent-activity":
    case "top-performing-users": {
      const s = settings as ControlSettingsBySlug["upcoming-tasks"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Footer link"
              value={s.footerLabel}
              onChange={(footerLabel) =>
                onChange({ ...s, footerLabel } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "status-indicator": {
      const s = settings as ControlSettingsBySlug["status-indicator"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <SettingSelect
            label="Status"
            value={s.status}
            onChange={(status) =>
              onChange({
                ...s,
                status: status as typeof s.status,
              } as ControlSettings)
            }
            options={[
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Error", value: "error" },
              { label: "Neutral", value: "neutral" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "trend-badge": {
      const s = settings as ControlSettingsBySlug["trend-badge"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) =>
              onChange({ ...s, previewLayout } as ControlSettings)
            }
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? true}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          <DashboardWidgetWidthSetting settings={s} onChange={onChange} />
          <SettingSelect
            label="Direction"
            value={s.direction}
            onChange={(direction) =>
              onChange({
                ...s,
                direction: direction as typeof s.direction,
              } as ControlSettings)
            }
            options={[
              { label: "Up", value: "up" },
              { label: "Down", value: "down" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Value"
              value={s.value}
              onChange={(value) => onChange({ ...s, value } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "panel": {
      const s = settings as ControlSettingsBySlug["panel"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Tone"
            value={s.tone}
            onChange={(tone) =>
              onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)
            }
            options={[
              { label: "Default", value: "default" },
              { label: "Accent", value: "accent" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Danger", value: "danger" },
              { label: "Info", value: "info" },
            ]}
          />
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Divided"
            checked={s.divided}
            onChange={(divided) =>
              onChange({ ...s, divided } as ControlSettings)
            }
          />
          <SettingToggle
            label="Border"
            checked={s.bordered}
            onChange={(bordered) =>
              onChange({ ...s, bordered } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Description"
              value={s.description}
              onChange={(description) =>
                onChange({ ...s, description } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Content"
              value={s.content}
              onChange={(content) =>
                onChange({ ...s, content } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Footer"
              value={s.footer}
              onChange={(footer) =>
                onChange({ ...s, footer } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "section": {
      const s = settings as ControlSettingsBySlug["section"];

      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Sidebar"
            value={s.sidebar}
            onChange={(sidebar) =>
              onChange({
                ...s,
                sidebar: sidebar as typeof s.sidebar,
              } as ControlSettings)
            }
            options={[
              { label: "None", value: "none" },
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
          />
          <SettingSelect
            label="Columns"
            value={String(s.columns)}
            onChange={(columns) =>
              onChange({
                ...s,
                columns: Number(columns) as typeof s.columns,
              } as ControlSettings)
            }
            options={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
              { label: "5", value: "5" },
            ]}
          />
          <SettingSelect
            label="Gap"
            value={s.gap}
            onChange={(gap) =>
              onChange({ ...s, gap: gap as typeof s.gap } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ]}
          />
          <SettingSelect
            label="Stack below"
            value={s.stackBelow}
            onChange={(stackBelow) =>
              onChange({
                ...s,
                stackBelow: stackBelow as typeof s.stackBelow,
              } as ControlSettings)
            }
            options={[
              { label: "Mobile", value: "mobile" },
              { label: "Tablet", value: "tablet" },
              { label: "Never", value: "never" },
            ]}
          />
          <SettingSelect
            label="Sidebar ratio"
            value={s.sidebarRatio}
            onChange={(sidebarRatio) =>
              onChange({
                ...s,
                sidebarRatio: sidebarRatio as typeof s.sidebarRatio,
              } as ControlSettings)
            }
            options={[
              { label: "1:2", value: "1:2" },
              { label: "1:3", value: "1:3" },
              { label: "2:3", value: "2:3" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Description"
              value={s.description}
              onChange={(description) =>
                onChange({ ...s, description } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Sidebar title"
              value={s.sidebarTitle}
              onChange={(sidebarTitle) =>
                onChange({ ...s, sidebarTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Sidebar content"
              value={s.sidebarContent}
              onChange={(sidebarContent) =>
                onChange({ ...s, sidebarContent } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Column 1 title"
              value={s.columnOneTitle}
              onChange={(columnOneTitle) =>
                onChange({ ...s, columnOneTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Column 1 content"
              value={s.columnOneContent}
              onChange={(columnOneContent) =>
                onChange({ ...s, columnOneContent } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Column 2 title"
              value={s.columnTwoTitle}
              onChange={(columnTwoTitle) =>
                onChange({ ...s, columnTwoTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Column 2 content"
              value={s.columnTwoContent}
              onChange={(columnTwoContent) =>
                onChange({ ...s, columnTwoContent } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Column 3 title"
              value={s.columnThreeTitle}
              onChange={(columnThreeTitle) =>
                onChange({ ...s, columnThreeTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Column 3 content"
              value={s.columnThreeContent}
              onChange={(columnThreeContent) =>
                onChange({ ...s, columnThreeContent } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Column 4 title"
              value={s.columnFourTitle}
              onChange={(columnFourTitle) =>
                onChange({ ...s, columnFourTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Column 4 content"
              value={s.columnFourContent}
              onChange={(columnFourContent) =>
                onChange({ ...s, columnFourContent } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Column 5 title"
              value={s.columnFiveTitle}
              onChange={(columnFiveTitle) =>
                onChange({ ...s, columnFiveTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Column 5 content"
              value={s.columnFiveContent}
              onChange={(columnFiveContent) =>
                onChange({ ...s, columnFiveContent } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "table": {
      const s = settings as ControlSettingsBySlug["table"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Show caption"
            checked={s.showCaption}
            onChange={(showCaption) =>
              onChange({ ...s, showCaption } as ControlSettings)
            }
          />
          <SettingToggle
            label="Striped rows"
            checked={s.striped}
            onChange={(striped) =>
              onChange({ ...s, striped } as ControlSettings)
            }
          />
          <SettingToggle
            label="Cell borders"
            checked={s.bordered}
            onChange={(bordered) =>
              onChange({ ...s, bordered } as ControlSettings)
            }
          />
          <SettingToggle
            label="Empty state"
            checked={s.showEmpty}
            onChange={(showEmpty) =>
              onChange({ ...s, showEmpty } as ControlSettings)
            }
          />
          <SettingToggle
            label="Numeric alignment"
            checked={s.numericColumn}
            onChange={(numericColumn) =>
              onChange({ ...s, numericColumn } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Caption"
              value={s.caption}
              onChange={(caption) =>
                onChange({ ...s, caption } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "data-grid": {
      const s = settings as ControlSettingsBySlug["data-grid"];
      const pivotLayout = s.layout === "pivot";
      const treeLayout = s.layout === "tree";
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Layout"
            value={s.layout}
            onChange={(layout) => {
              const nextLayout = layout as typeof s.layout;
              onChange({
                ...s,
                layout: nextLayout,
                ...(nextLayout === "pivot" ? { masterDetail: false } : {}),
                ...(nextLayout === "tree" || nextLayout === "pivot"
                  ? { infiniteScroll: false }
                  : {}),
              } as ControlSettings);
            }}
            options={[
              { label: "Flat", value: "flat" },
              { label: "Grouped", value: "grouped" },
              { label: "Tree", value: "tree" },
              { label: "Pivot", value: "pivot" },
            ]}
          />
          {!pivotLayout ? (
            <SettingToggle
              label="Master detail"
              checked={s.masterDetail}
              onChange={(masterDetail) =>
                onChange({ ...s, masterDetail } as ControlSettings)
              }
            />
          ) : null}
          <SettingToggle
            label="Virtualized"
            checked={s.virtualized}
            onChange={(virtualized) =>
              onChange({ ...s, virtualized } as ControlSettings)
            }
          />
          {!treeLayout && !pivotLayout ? (
            <SettingToggle
              label="Infinite scroll"
              checked={s.infiniteScroll}
              onChange={(infiniteScroll) =>
                onChange({ ...s, infiniteScroll } as ControlSettings)
              }
            />
          ) : null}
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Fixed top header"
            checked={s.stickyHeader}
            onChange={(stickyHeader) =>
              onChange({ ...s, stickyHeader } as ControlSettings)
            }
          />
          <SettingToggle
            label="Fixed left header"
            checked={s.stickyFirstColumn}
            onChange={(stickyFirstColumn) =>
              onChange({ ...s, stickyFirstColumn } as ControlSettings)
            }
          />
          <SettingToggle
            label="Sort by heading"
            checked={s.sortable}
            onChange={(sortable) =>
              onChange({ ...s, sortable } as ControlSettings)
            }
          />
          <SettingToggle
            label="Filter by heading"
            checked={s.filterable}
            onChange={(filterable) =>
              onChange({ ...s, filterable } as ControlSettings)
            }
          />
          <SettingToggle
            label="Drag by heading"
            checked={s.resizable}
            onChange={(resizable) =>
              onChange({ ...s, resizable } as ControlSettings)
            }
          />
          <SettingToggle
            label="Team column drag"
            checked={s.rowHeaderResizable}
            onChange={(rowHeaderResizable) =>
              onChange({ ...s, rowHeaderResizable } as ControlSettings)
            }
          />
          <SettingToggle
            label="Q1 and Q2 sort & filter"
            checked={s.q1Q2SortFilter}
            onChange={(q1Q2SortFilter) =>
              onChange({ ...s, q1Q2SortFilter } as ControlSettings)
            }
          />
          <SettingToggle
            label="Q1 and Q2 drag"
            checked={s.q1Q2Resizable}
            onChange={(q1Q2Resizable) =>
              onChange({ ...s, q1Q2Resizable } as ControlSettings)
            }
          />
          <SettingToggle
            label="Striped rows"
            checked={s.striped}
            onChange={(striped) =>
              onChange({ ...s, striped } as ControlSettings)
            }
          />
          <SettingToggle
            label="Cell borders"
            checked={s.bordered}
            onChange={(bordered) =>
              onChange({ ...s, bordered } as ControlSettings)
            }
          />
          <SettingToggle
            label="Numeric alignment"
            checked={s.numericColumns}
            onChange={(numericColumns) =>
              onChange({ ...s, numericColumns } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Caption"
              value={s.caption}
              onChange={(caption) =>
                onChange({ ...s, caption } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "skeleton": {
      const s = settings as ControlSettingsBySlug["skeleton"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({
                ...s,
                variant: variant as typeof s.variant,
              } as ControlSettings)
            }
            options={[
              { label: "Text", value: "text" },
              { label: "Card", value: "card" },
              { label: "Avatar", value: "avatar" },
              { label: "Table", value: "table" },
            ]}
          />
          <SettingSelect
            label="Animation"
            value={s.animation}
            onChange={(animation) =>
              onChange({
                ...s,
                animation: animation as typeof s.animation,
              } as ControlSettings)
            }
            options={[
              { label: "Shimmer", value: "shimmer" },
              { label: "Pulse", value: "pulse" },
              { label: "None", value: "none" },
            ]}
          />
          <SettingInput
            label="Lines"
            type="number"
            value={String(s.lines)}
            onChange={(lines) =>
              onChange({
                ...s,
                lines: Math.min(Math.max(Number(lines) || 1, 1), 8),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "carousel": {
      const s = settings as ControlSettingsBySlug["carousel"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Start image"
            type="number"
            value={String(s.initialIndex + 1)}
            onChange={(initialIndex) =>
              onChange({
                ...s,
                initialIndex:
                  Math.min(Math.max(Number(initialIndex) || 1, 1), 4) - 1,
              } as ControlSettings)
            }
          />
          <SettingToggle
            label="Loop"
            checked={s.loop}
            onChange={(loop) => onChange({ ...s, loop } as ControlSettings)}
          />
          <SettingToggle
            label="Captions"
            checked={s.showCaptions}
            onChange={(showCaptions) =>
              onChange({ ...s, showCaptions } as ControlSettings)
            }
          />
          <SettingToggle
            label="Pips"
            checked={s.showPips}
            onChange={(showPips) =>
              onChange({ ...s, showPips } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "video-player": {
      const s = settings as ControlSettingsBySlug["video-player"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Title"
            value={s.title}
            onChange={(title) => onChange({ ...s, title } as ControlSettings)}
          />
          <SettingToggle
            label="Show title"
            checked={s.showTitle}
            onChange={(showTitle) =>
              onChange({ ...s, showTitle } as ControlSettings)
            }
          />
          <SettingToggle
            label="Autoplay"
            checked={s.autoPlay}
            onChange={(autoPlay) =>
              onChange({ ...s, autoPlay } as ControlSettings)
            }
          />
          <SettingToggle
            label="Loop"
            checked={s.loop}
            onChange={(loop) => onChange({ ...s, loop } as ControlSettings)}
          />
          <SettingToggle
            label="Muted"
            checked={s.muted}
            onChange={(muted) => onChange({ ...s, muted } as ControlSettings)}
          />
        </div>
      );
    }
    case "audio-player": {
      const s = settings as ControlSettingsBySlug["audio-player"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Start track"
            type="number"
            value={String(s.initialIndex + 1)}
            onChange={(initialIndex) =>
              onChange({
                ...s,
                initialIndex:
                  Math.min(Math.max(Number(initialIndex) || 1, 1), 2) - 1,
              } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show artwork"
            checked={s.showArtwork}
            onChange={(showArtwork) =>
              onChange({ ...s, showArtwork } as ControlSettings)
            }
          />
          <SettingToggle
            label="Autoplay"
            checked={s.autoPlay}
            onChange={(autoPlay) =>
              onChange({ ...s, autoPlay } as ControlSettings)
            }
          />
          <SettingToggle
            label="Loop track"
            checked={s.loop}
            onChange={(loop) => onChange({ ...s, loop } as ControlSettings)}
          />
          <SettingToggle
            label="Loop playlist"
            checked={s.loopPlaylist}
            onChange={(loopPlaylist) =>
              onChange({ ...s, loopPlaylist } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "lightbox": {
      const s = settings as ControlSettingsBySlug["lightbox"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Captions"
            checked={s.showCaptions}
            onChange={(showCaptions) =>
              onChange({ ...s, showCaptions } as ControlSettings)
            }
          />
          <SettingToggle
            label="Backdrop dismiss"
            checked={s.dismissOnBackdrop}
            onChange={(dismissOnBackdrop) =>
              onChange({ ...s, dismissOnBackdrop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.dismissOnEscape}
            onChange={(dismissOnEscape) =>
              onChange({ ...s, dismissOnEscape } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "image-thumbnail": {
      const s = settings as ControlSettingsBySlug["image-thumbnail"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
          />
          <SettingToggle
            label="Caption"
            checked={s.showCaption}
            onChange={(showCaption) =>
              onChange({ ...s, showCaption } as ControlSettings)
            }
          />
          <SettingToggle
            label="Open in lightbox"
            checked={s.openInLightbox}
            onChange={(openInLightbox) =>
              onChange({ ...s, openInLightbox } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "image-gallery": {
      const s = settings as ControlSettingsBySlug["image-gallery"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Columns"
            value={String(s.columns)}
            onChange={(columns) =>
              onChange({
                ...s,
                columns: Number(columns) as typeof s.columns,
              } as ControlSettings)
            }
            options={[
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
            ]}
          />
          <SettingSelect
            label="Thumbnail size"
            value={s.thumbnailSize}
            onChange={(thumbnailSize) =>
              onChange({
                ...s,
                thumbnailSize: thumbnailSize as typeof s.thumbnailSize,
              } as ControlSettings)
            }
            options={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
          />
          <SettingToggle
            label="Captions"
            checked={s.showCaptions}
            onChange={(showCaptions) =>
              onChange({ ...s, showCaptions } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "model-viewer": {
      const s = settings as ControlSettingsBySlug["model-viewer"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Auto rotate"
            checked={s.autoRotate}
            onChange={(autoRotate) =>
              onChange({ ...s, autoRotate } as ControlSettings)
            }
          />
          <SettingToggle
            label="Camera controls"
            checked={s.cameraControls}
            onChange={(cameraControls) =>
              onChange({ ...s, cameraControls } as ControlSettings)
            }
          />
          <SettingToggle
            label="Caption"
            checked={s.showCaption}
            onChange={(showCaption) =>
              onChange({ ...s, showCaption } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "model-lightbox": {
      const s = settings as ControlSettingsBySlug["model-lightbox"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Caption"
            checked={s.showCaption}
            onChange={(showCaption) =>
              onChange({ ...s, showCaption } as ControlSettings)
            }
          />
          <SettingToggle
            label="Backdrop dismiss"
            checked={s.dismissOnBackdrop}
            onChange={(dismissOnBackdrop) =>
              onChange({ ...s, dismissOnBackdrop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.dismissOnEscape}
            onChange={(dismissOnEscape) =>
              onChange({ ...s, dismissOnEscape } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Trigger label"
              value={s.triggerLabel}
              onChange={(triggerLabel) =>
                onChange({ ...s, triggerLabel } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "model-thumbnail": {
      const s = settings as ControlSettingsBySlug["model-thumbnail"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
          />
          <SettingToggle
            label="Caption"
            checked={s.showCaption}
            onChange={(showCaption) =>
              onChange({ ...s, showCaption } as ControlSettings)
            }
          />
          <SettingToggle
            label="Open in lightbox"
            checked={s.openInLightbox}
            onChange={(openInLightbox) =>
              onChange({ ...s, openInLightbox } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "model-gallery": {
      const s = settings as ControlSettingsBySlug["model-gallery"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Columns"
            value={String(s.columns)}
            onChange={(columns) =>
              onChange({
                ...s,
                columns: Number(columns) as typeof s.columns,
              } as ControlSettings)
            }
            options={[
              { label: "2", value: "2" },
              { label: "3", value: "3" },
              { label: "4", value: "4" },
            ]}
          />
          <SettingSelect
            label="Thumbnail size"
            value={s.thumbnailSize}
            onChange={(thumbnailSize) =>
              onChange({
                ...s,
                thumbnailSize: thumbnailSize as typeof s.thumbnailSize,
              } as ControlSettings)
            }
            options={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
          />
          <SettingToggle
            label="Captions"
            checked={s.showCaptions}
            onChange={(showCaptions) =>
              onChange({ ...s, showCaptions } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "tabs": {
      const s = settings as ControlSettingsBySlug["tabs"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Active tab"
            value={s.activeValue}
            onChange={(activeValue) =>
              onChange({ ...s, activeValue } as ControlSettings)
            }
            options={[
              { label: "Overview", value: "overview" },
              { label: "Insights", value: "insights" },
              { label: "Settings", value: "settings" },
              { label: "Form", value: "form" },
            ]}
          />
          <SettingSelect
            label="Orientation"
            value={s.orientation}
            onChange={(orientation) =>
              onChange({
                ...s,
                orientation: orientation as typeof s.orientation,
              } as ControlSettings)
            }
            options={[
              { label: "Horizontal", value: "horizontal" },
              { label: "Vertical", value: "vertical" },
            ]}
          />
          <SettingSelect
            label="Variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({
                ...s,
                activeValue:
                  variant === "card" && s.activeValue === "form" ? "overview" : s.activeValue,
                variant: variant as typeof s.variant,
              } as ControlSettings)
            }
            options={[
              { label: "Line", value: "line" },
              { label: "Contained", value: "contained" },
              { label: "Card", value: "card" },
            ]}
          />
          <SettingToggle
            label="Fitted tabs"
            checked={s.fitted}
            onChange={(fitted) => onChange({ ...s, fitted } as ControlSettings)}
          />
          <SettingToggle
            label="Disable second tab"
            checked={s.disabledSecond}
            onChange={(disabledSecond) => {
              onChange({
                ...s,
                activeValue:
                  disabledSecond && s.activeValue === "insights"
                    ? "overview"
                    : s.activeValue,
                disabledSecond,
              } as ControlSettings);
            }}
          />
        </div>
      );
    }
    case "accordion": {
      const s = settings as ControlSettingsBySlug["accordion"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Open by default"
            checked={s.defaultOpen}
            onChange={(defaultOpen) =>
              onChange({ ...s, defaultOpen } as ControlSettings)
            }
          />
          <SettingToggle
            label="Disabled"
            checked={s.disabled}
            onChange={(disabled) =>
              onChange({ ...s, disabled } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Content"
              value={s.content}
              onChange={(content) =>
                onChange({ ...s, content } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "accordion-group": {
      const s = settings as ControlSettingsBySlug["accordion-group"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Expand mode"
            value={s.type}
            onChange={(type) =>
              onChange({ ...s, type: type as typeof s.type } as ControlSettings)
            }
            options={[
              { label: "Single", value: "single" },
              { label: "Multiple", value: "multiple" },
            ]}
          />
          <SettingToggle
            label="Collapsible"
            checked={s.collapsible}
            onChange={(collapsible) =>
              onChange({ ...s, collapsible } as ControlSettings)
            }
          />
          <SettingToggle
            label="Open first item"
            checked={s.defaultOpenFirst}
            onChange={(defaultOpenFirst) =>
              onChange({ ...s, defaultOpenFirst } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Item 1 title"
              value={s.itemOneTitle}
              onChange={(itemOneTitle) =>
                onChange({ ...s, itemOneTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Item 1 content"
              value={s.itemOneContent}
              onChange={(itemOneContent) =>
                onChange({ ...s, itemOneContent } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Item 2 title"
              value={s.itemTwoTitle}
              onChange={(itemTwoTitle) =>
                onChange({ ...s, itemTwoTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Item 2 content"
              value={s.itemTwoContent}
              onChange={(itemTwoContent) =>
                onChange({ ...s, itemTwoContent } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Item 3 title"
              value={s.itemThreeTitle}
              onChange={(itemThreeTitle) =>
                onChange({ ...s, itemThreeTitle } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Item 3 content"
              value={s.itemThreeContent}
              onChange={(itemThreeContent) =>
                onChange({ ...s, itemThreeContent } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "show-more": {
      const s = settings as ControlSettingsBySlug["show-more"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Expanded by default"
            checked={s.defaultExpanded}
            onChange={(defaultExpanded) =>
              onChange({ ...s, defaultExpanded } as ControlSettings)
            }
          />
          <SettingInput
            label="Max lines"
            type="number"
            value={String(s.maxLines)}
            onChange={(value) =>
              onChange({
                ...s,
                maxLines: Math.max(1, Number(value) || 1),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Show more label"
            value={s.showMoreLabel}
            onChange={(showMoreLabel) =>
              onChange({ ...s, showMoreLabel } as ControlSettings)
            }
          />
          <SettingInput
            label="Show less label"
            value={s.showLessLabel}
            onChange={(showLessLabel) =>
              onChange({ ...s, showLessLabel } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Content"
              value={s.content}
              onChange={(content) =>
                onChange({ ...s, content } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "empty-state": {
      const s = settings as ControlSettingsBySlug["empty-state"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Show icon"
            checked={s.showIcon}
            onChange={(showIcon) =>
              onChange({ ...s, showIcon } as ControlSettings)
            }
          />
          {s.showIcon ? (
            <div className={shellStyles.settingsFullWidth}>
              <IconPicker
                id="opus-setting-empty-state-icon"
                label="Icon"
                labelPosition="left"
                mode="stacked"
                value={s.icon}
                onChange={(icon) => onChange({ ...s, icon } as ControlSettings)}
              />
            </div>
          ) : null}
          <SettingToggle
            label="Primary action"
            checked={s.primaryAction}
            onChange={(primaryAction) =>
              onChange({ ...s, primaryAction } as ControlSettings)
            }
          />
          <SettingToggle
            label="Secondary action"
            checked={s.secondaryAction}
            onChange={(secondaryAction) =>
              onChange({ ...s, secondaryAction } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Title"
              value={s.title}
              onChange={(title) => onChange({ ...s, title } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Description"
              value={s.description}
              onChange={(description) =>
                onChange({ ...s, description } as ControlSettings)
              }
            />
          </div>
          {s.primaryAction ? (
            <SettingInput
              label="Primary label"
              value={s.primaryActionLabel}
              onChange={(primaryActionLabel) =>
                onChange({ ...s, primaryActionLabel } as ControlSettings)
              }
            />
          ) : null}
          {s.secondaryAction ? (
            <SettingInput
              label="Secondary label"
              value={s.secondaryActionLabel}
              onChange={(secondaryActionLabel) =>
                onChange({ ...s, secondaryActionLabel } as ControlSettings)
              }
            />
          ) : null}
        </div>
      );
    }
    case "badge": {
      const s = settings as ControlSettingsBySlug["badge"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <SettingSelect
            label="Tone"
            value={s.tone}
            onChange={(tone) =>
              onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)
            }
            options={[
              { label: "Neutral", value: "neutral" },
              { label: "Accent", value: "accent" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Danger", value: "danger" },
              { label: "Info", value: "info" },
            ]}
          />
          <SettingSelect
            label="Variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({
                ...s,
                variant: variant as typeof s.variant,
              } as ControlSettings)
            }
            options={[
              { label: "Soft", value: "soft" },
              { label: "Solid", value: "solid" },
              { label: "Outline", value: "outline" },
            ]}
          />
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
            ]}
          />
          <SettingToggle
            label="Show dot"
            checked={s.dot}
            onChange={(dot) => onChange({ ...s, dot } as ControlSettings)}
          />
        </div>
      );
    }
    case "avatar": {
      const s = settings as ControlSettingsBySlug["avatar"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Name"
            value={s.name}
            onChange={(name) => onChange({ ...s, name } as ControlSettings)}
          />
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "XL", value: "xl" },
            ]}
          />
          <SettingSelect
            label="Shape"
            value={s.shape}
            onChange={(shape) =>
              onChange({
                ...s,
                shape: shape as typeof s.shape,
              } as ControlSettings)
            }
            options={[
              { label: "Circle", value: "circle" },
              { label: "Rounded", value: "rounded" },
            ]}
          />
          <SettingToggle
            label="Use image URL"
            checked={s.srcEnabled}
            onChange={(srcEnabled) =>
              onChange({ ...s, srcEnabled } as ControlSettings)
            }
          />
          {s.srcEnabled ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Image URL"
                value={s.src}
                onChange={(src) => onChange({ ...s, src } as ControlSettings)}
              />
            </div>
          ) : null}
        </div>
      );
    }
    case "avatar-group": {
      const s = settings as ControlSettingsBySlug["avatar-group"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
              { label: "XL", value: "xl" },
            ]}
          />
          <SettingInput
            label="Max visible"
            type="number"
            value={String(s.max)}
            onChange={(max) =>
              onChange({
                ...s,
                max: Math.min(Math.max(Number(max) || 1, 1), 8),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "list": {
      const s = settings as ControlSettingsBySlug["list"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Ordered"
            checked={s.ordered}
            onChange={(ordered) =>
              onChange({ ...s, ordered } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show icons"
            checked={s.showIcons}
            onChange={(showIcons) =>
              onChange({ ...s, showIcons } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "description-list": {
      const s = settings as ControlSettingsBySlug["description-list"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Layout"
            value={s.layout}
            onChange={(layout) =>
              onChange({
                ...s,
                layout: layout as typeof s.layout,
              } as ControlSettings)
            }
            options={[
              { label: "Stacked", value: "stacked" },
              { label: "Inline", value: "inline" },
            ]}
          />
        </div>
      );
    }
    case "divider": {
      const s = settings as ControlSettingsBySlug["divider"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Orientation"
            value={s.orientation}
            onChange={(orientation) =>
              onChange({
                ...s,
                orientation: orientation as typeof s.orientation,
              } as ControlSettings)
            }
            options={[
              { label: "Horizontal", value: "horizontal" },
              { label: "Vertical", value: "vertical" },
            ]}
          />
          <SettingSelect
            label="Tone"
            value={s.tone}
            onChange={(tone) =>
              onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)
            }
            options={[
              { label: "Default", value: "default" },
              { label: "Muted", value: "muted" },
              { label: "Strong", value: "strong" },
            ]}
          />
          <SettingToggle
            label="Show label"
            checked={s.labelEnabled}
            onChange={(labelEnabled) =>
              onChange({ ...s, labelEnabled } as ControlSettings)
            }
          />
          {s.labelEnabled && s.orientation === "horizontal" ? (
            <SettingInput
              label="Label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          ) : null}
        </div>
      );
    }
    case "content-timeline": {
      const s = settings as ControlSettingsBySlug["content-timeline"];
      const rowStyleOptions = [
        { label: "Avatar", value: "avatar" },
        { label: "Status dot", value: "status" },
      ];

      return (
        <div className={shellStyles.settingsGrid}>
          {s.rowStyles.map((rowStyle, index) => (
            <SettingSelect
              key={`content-timeline-row-${index + 1}`}
              label={`Row ${index + 1}`}
              value={rowStyle}
              options={rowStyleOptions}
              onChange={(value) => {
                const next = [...s.rowStyles] as typeof s.rowStyles;
                next[index] = value as (typeof s.rowStyles)[number];
                onChange({ ...s, rowStyles: next } as ControlSettings);
              }}
            />
          ))}
          <SettingToggle
            label="Tags"
            checked={s.includeTags ?? true}
            onChange={(includeTags) =>
              onChange({ ...s, includeTags } as ControlSettings)
            }
          />
          <SettingToggle
            label="Group labels"
            checked={s.includeGroups ?? false}
            onChange={(includeGroups) =>
              onChange({ ...s, includeGroups } as ControlSettings)
            }
          />
          <SettingToggle
            label="Status accents"
            checked={s.includeStatus}
            onChange={(includeStatus) =>
              onChange({ ...s, includeStatus } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "tree-view": {
      const s = settings as ControlSettingsBySlug["tree-view"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Expand root nodes"
            checked={s.expandRoots}
            onChange={(expandRoots) =>
              onChange({ ...s, expandRoots } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "masonry-grid": {
      const s = settings as ControlSettingsBySlug["masonry-grid"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Columns"
            type="number"
            value={String(s.columns)}
            onChange={(columns) =>
              onChange({
                ...s,
                columns: Math.min(Math.max(Number(columns) || 2, 2), 4),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Gap"
            type="number"
            value={String(s.gap)}
            onChange={(gap) =>
              onChange({
                ...s,
                gap: Math.min(Math.max(Number(gap) || 8, 8), 28),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "property-grid": {
      const s = settings as ControlSettingsBySlug["property-grid"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Border"
            checked={s.bordered}
            onChange={(bordered) =>
              onChange({ ...s, bordered } as ControlSettings)
            }
          />
          <SettingToggle
            label="Copyable rows"
            checked={s.copyable}
            onChange={(copyable) =>
              onChange({ ...s, copyable } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "stack": {
      const s = settings as ControlSettingsBySlug["stack"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Direction"
            value={s.direction}
            options={[
              { label: "Column", value: "column" },
              { label: "Row", value: "row" },
            ]}
            onChange={(direction) =>
              onChange({ ...s, direction } as ControlSettings)
            }
          />
          <SettingInput
            label="Gap"
            type="number"
            value={String(s.gap)}
            onChange={(gap) =>
              onChange({
                ...s,
                gap: Math.min(Math.max(Number(gap) || 0, 0), 48),
              } as ControlSettings)
            }
          />
          <SettingToggle
            label="Wrap"
            checked={s.wrap}
            onChange={(wrap) => onChange({ ...s, wrap } as ControlSettings)}
          />
        </div>
      );
    }
    case "columns": {
      const s = settings as ControlSettingsBySlug["columns"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Direction"
            value={s.direction}
            options={[
              { label: "Row", value: "row" },
              { label: "Column", value: "column" },
            ]}
            onChange={(direction) =>
              onChange({ ...s, direction } as ControlSettings)
            }
          />
          <SettingInput
            label="Columns"
            type="number"
            value={String(s.columns)}
            onChange={(columns) =>
              onChange({
                ...s,
                columns: Math.min(Math.max(Number(columns) || 1, 1), 6),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Gap"
            type="number"
            value={String(s.gap)}
            onChange={(gap) =>
              onChange({
                ...s,
                gap: Math.min(Math.max(Number(gap) || 0, 0), 48),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "grid": {
      const s = settings as ControlSettingsBySlug["grid"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Columns"
            type="number"
            value={String(s.columns)}
            onChange={(columns) =>
              onChange({
                ...s,
                columns: Math.min(Math.max(Number(columns) || 1, 1), 6),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Gap"
            type="number"
            value={String(s.gap)}
            onChange={(gap) =>
              onChange({
                ...s,
                gap: Math.min(Math.max(Number(gap) || 0, 0), 48),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "splitter": {
      const s = settings as ControlSettingsBySlug["splitter"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Orientation"
            value={s.orientation}
            options={[
              { label: "Horizontal", value: "horizontal" },
              { label: "Vertical", value: "vertical" },
            ]}
            onChange={(orientation) =>
              onChange({ ...s, orientation } as ControlSettings)
            }
          />
          <SettingInput
            label="Default size %"
            type="number"
            value={String(s.defaultSize)}
            onChange={(defaultSize) =>
              onChange({
                ...s,
                defaultSize: Math.min(
                  Math.max(Number(defaultSize) || 20, 15),
                  85,
                ),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "resize-handle": {
      const s = settings as ControlSettingsBySlug["resize-handle"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Orientation"
            value={s.orientation}
            options={[
              { label: "Vertical", value: "vertical" },
              { label: "Horizontal", value: "horizontal" },
            ]}
            onChange={(orientation) =>
              onChange({ ...s, orientation } as ControlSettings)
            }
          />
          <SettingSelect
            label="Background"
            value={s.background}
            options={[
              { label: "Subtle", value: "subtle" },
              { label: "Accent", value: "accent" },
              { label: "Contrast", value: "contrast" },
              { label: "None", value: "none" },
            ]}
            onChange={(background) =>
              onChange({ ...s, background } as ControlSettings)
            }
          />
          <SettingSelect
            label="Grip height"
            value={s.height}
            options={[
              { label: "Short", value: "short" },
              { label: "Medium", value: "medium" },
              { label: "Tall", value: "tall" },
              { label: "Full", value: "full" },
            ]}
            onChange={(height) => onChange({ ...s, height } as ControlSettings)}
          />
        </div>
      );
    }
    case "resizable-panel": {
      const s = settings as ControlSettingsBySlug["resizable-panel"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Default width"
            type="number"
            value={String(s.defaultWidth)}
            onChange={(defaultWidth) =>
              onChange({
                ...s,
                defaultWidth: Math.min(
                  Math.max(Number(defaultWidth) || 180, 180),
                  640,
                ),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Default height"
            type="number"
            value={String(s.defaultHeight)}
            onChange={(defaultHeight) =>
              onChange({
                ...s,
                defaultHeight: Math.min(
                  Math.max(Number(defaultHeight) || 120, 120),
                  480,
                ),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "dock-layout": {
      const s = settings as ControlSettingsBySlug["dock-layout"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Top"
            checked={s.showTop}
            onChange={(showTop) =>
              onChange({ ...s, showTop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Left"
            checked={s.showLeft}
            onChange={(showLeft) =>
              onChange({ ...s, showLeft } as ControlSettings)
            }
          />
          <SettingToggle
            label="Right"
            checked={s.showRight}
            onChange={(showRight) =>
              onChange({ ...s, showRight } as ControlSettings)
            }
          />
          <SettingToggle
            label="Bottom"
            checked={s.showBottom}
            onChange={(showBottom) =>
              onChange({ ...s, showBottom } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "three-pane-layout":
    case "lab-test-layout": {
      const s = settings as ControlSettingsBySlug["three-pane-layout"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Left bar"
            checked={s.showLeft}
            onChange={(showLeft) =>
              onChange({ ...s, showLeft } as ControlSettings)
            }
          />
          <SettingToggle
            label="Right bar"
            checked={s.showRight}
            onChange={(showRight) =>
              onChange({ ...s, showRight } as ControlSettings)
            }
          />
          <SettingToggle
            label="Persist layout"
            checked={s.persist}
            onChange={(persist) =>
              onChange({ ...s, persist } as ControlSettings)
            }
          />
          {slug === "lab-test-layout" ? (
            <button
              className={shellStyles.settingsActionButton}
              onClick={() => {
                [
                  "opus-lab-test-layout-panes",
                  "opus-lab-test-layout-panes-v2",
                  "opus-lab-test-layout-panes-v3",
                  "opus-lab-test-layout-panes-v4",
                  "opus-sidebar-state:opus-lab-test-layout-menu",
                  "crm-test-layout",
                  "crm-test-layout-v2",
                  "crm-test-layout-v3",
                  "crm-test-layout-v4",
                ].forEach((key) => window.localStorage.removeItem(key));
                onChange({
                  ...s,
                  layoutResetKey: (s.layoutResetKey ?? 0) + 1,
                  persist: true,
                } as ControlSettings);
              }}
              type="button"
            >
              Reset saved layout
            </button>
          ) : null}
          <SettingSelect
            label="Height"
            value={s.height}
            options={[
              { label: "Fill available", value: "full" },
              { label: "Auto", value: "auto" },
            ]}
            onChange={(height) => onChange({ ...s, height } as ControlSettings)}
          />
          {slug === "lab-test-layout" ? (
            <SettingInput
              label="Centre scrollbar inset"
              type="number"
              value={String(s.workspaceScrollbarInset ?? -1)}
              onChange={(workspaceScrollbarInset) =>
                onChange({
                  ...s,
                  workspaceScrollbarInset: Math.min(
                    Math.max(Number(workspaceScrollbarInset) || 0, -1),
                    24,
                  ),
                } as ControlSettings)
              }
            />
          ) : null}
          <SettingSelect
            label="Handle background"
            value={s.handleBackground}
            options={[
              { label: "Subtle", value: "subtle" },
              { label: "Accent", value: "accent" },
              { label: "Contrast", value: "contrast" },
              { label: "None", value: "none" },
            ]}
            onChange={(handleBackground) =>
              onChange({ ...s, handleBackground } as ControlSettings)
            }
          />
          <SettingSelect
            label="Handle height"
            value={s.handleHeight}
            options={[
              { label: "Short", value: "short" },
              { label: "Medium", value: "medium" },
              { label: "Tall", value: "tall" },
              { label: "Full", value: "full" },
            ]}
            onChange={(handleHeight) =>
              onChange({ ...s, handleHeight } as ControlSettings)
            }
          />
          <SettingInput
            label="Handle margin top/bottom"
            type="number"
            value={String(
              s.handleMarginBlock ?? (slug === "lab-test-layout" ? 12 : 0),
            )}
            onChange={(handleMarginBlock) =>
              onChange({
                ...s,
                handleMarginBlock: Math.min(
                  Math.max(Number(handleMarginBlock) || 0, 0),
                  120,
                ),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Handle corner radius"
            type="number"
            value={String(
              s.handleBorderRadius ?? (slug === "lab-test-layout" ? 12 : 0),
            )}
            onChange={(handleBorderRadius) =>
              onChange({
                ...s,
                handleBorderRadius: Math.min(
                  Math.max(Number(handleBorderRadius) || 0, 0),
                  999,
                ),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Left width"
            type="number"
            value={String(s.defaultLeftWidth)}
            onChange={(defaultLeftWidth) =>
              onChange({
                ...s,
                defaultLeftWidth: Math.min(
                  Math.max(Number(defaultLeftWidth) || 220, s.minLeftWidth),
                  s.maxLeftWidth,
                ),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Right width"
            type="number"
            value={String(s.defaultRightWidth)}
            onChange={(defaultRightWidth) =>
              onChange({
                ...s,
                defaultRightWidth: Math.min(
                  Math.max(Number(defaultRightWidth) || 260, s.minRightWidth),
                  s.maxRightWidth,
                ),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Min left"
            type="number"
            value={String(
              slug === "lab-test-layout" && s.minLeftWidth === 180
                ? 120
                : s.minLeftWidth,
            )}
            onChange={(minLeftWidth) =>
              onChange({
                ...s,
                minLeftWidth: Math.min(
                  Math.max(Number(minLeftWidth) || 120, 80),
                  s.maxLeftWidth - 20,
                ),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Max left"
            type="number"
            value={String(s.maxLeftWidth)}
            onChange={(maxLeftWidth) =>
              onChange({
                ...s,
                maxLeftWidth: Math.max(
                  Number(maxLeftWidth) || 420,
                  s.minLeftWidth + 20,
                ),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Min right"
            type="number"
            value={String(
              slug === "lab-test-layout"
                ? Math.max(s.minRightWidth, 220)
                : s.minRightWidth,
            )}
            onChange={(minRightWidth) =>
              onChange({
                ...s,
                minRightWidth: Math.min(
                  Math.max(
                    Number(minRightWidth) || 140,
                    slug === "lab-test-layout" ? 220 : 80,
                  ),
                  s.maxRightWidth - 20,
                ),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Max right"
            type="number"
            value={String(s.maxRightWidth)}
            onChange={(maxRightWidth) =>
              onChange({
                ...s,
                maxRightWidth: Math.max(
                  Number(maxRightWidth) || 460,
                  s.minRightWidth + 20,
                ),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "custom-scrollbar":
    case "scroll-area": {
      const s = settings as
        | ControlSettingsBySlug["custom-scrollbar"]
        | ControlSettingsBySlug["scroll-area"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Auto hide"
            checked={s.autoHide}
            onChange={(autoHide) =>
              onChange({ ...s, autoHide } as ControlSettings)
            }
          />
          <SettingInput
            label="Max height"
            type="number"
            value={String(s.maxHeight)}
            onChange={(maxHeight) =>
              onChange({
                ...s,
                maxHeight: Math.min(Math.max(Number(maxHeight) || 80, 80), 480),
              } as ControlSettings)
            }
          />
          {slug === "scroll-area" ? (
            <SettingSelect
              label="Orientation"
              value={s.orientation}
              options={[
                { label: "Vertical", value: "vertical" },
                { label: "Horizontal", value: "horizontal" },
                { label: "Both", value: "both" },
              ]}
              onChange={(orientation) =>
                onChange({ ...s, orientation } as ControlSettings)
              }
            />
          ) : null}
          <SettingInput
            label="Thickness"
            type="number"
            value={String(s.thickness)}
            onChange={(thickness) =>
              onChange({
                ...s,
                thickness: Math.min(Math.max(Number(thickness) || 6, 6), 24),
              } as ControlSettings)
            }
          />
          {slug === "custom-scrollbar" ? (
            <>
              <SettingInput
                label="Min thumb"
                type="number"
                value={String(
                  (s as ControlSettingsBySlug["custom-scrollbar"]).minThumbSize,
                )}
                onChange={(minThumbSize) =>
                  onChange({
                    ...s,
                    minThumbSize: Math.min(
                      Math.max(Number(minThumbSize) || 20, 20),
                      80,
                    ),
                  } as ControlSettings)
                }
              />
              <SettingInput
                label="Track inset"
                type="number"
                value={String(
                  (s as ControlSettingsBySlug["custom-scrollbar"]).trackInset,
                )}
                onChange={(trackInset) =>
                  onChange({
                    ...s,
                    trackInset: Math.min(
                      Math.max(Number(trackInset) || 0, -1),
                      24,
                    ),
                  } as ControlSettings)
                }
              />
              <SettingSelect
                label="Vertical track"
                value={
                  (s as ControlSettingsBySlug["custom-scrollbar"])
                    .verticalTrackShape
                }
                options={[
                  { label: "Round", value: "round" },
                  { label: "Square", value: "square" },
                ]}
                onChange={(verticalTrackShape) =>
                  onChange({ ...s, verticalTrackShape } as ControlSettings)
                }
              />
              <SettingSelect
                label="Vertical thumb"
                value={
                  (s as ControlSettingsBySlug["custom-scrollbar"])
                    .verticalThumbShape
                }
                options={[
                  { label: "Round", value: "round" },
                  { label: "Square", value: "square" },
                ]}
                onChange={(verticalThumbShape) =>
                  onChange({ ...s, verticalThumbShape } as ControlSettings)
                }
              />
              <SettingSelect
                label="Horizontal track"
                value={
                  (s as ControlSettingsBySlug["custom-scrollbar"])
                    .horizontalTrackShape
                }
                options={[
                  { label: "Round", value: "round" },
                  { label: "Square", value: "square" },
                ]}
                onChange={(horizontalTrackShape) =>
                  onChange({ ...s, horizontalTrackShape } as ControlSettings)
                }
              />
              <SettingSelect
                label="Horizontal thumb"
                value={
                  (s as ControlSettingsBySlug["custom-scrollbar"])
                    .horizontalThumbShape
                }
                options={[
                  { label: "Round", value: "round" },
                  { label: "Square", value: "square" },
                ]}
                onChange={(horizontalThumbShape) =>
                  onChange({ ...s, horizontalThumbShape } as ControlSettings)
                }
              />
            </>
          ) : null}
        </div>
      );
    }
    case "aspect-ratio": {
      const s = settings as ControlSettingsBySlug["aspect-ratio"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Ratio"
            value={s.ratio}
            options={[
              { label: "16 / 9", value: "16 / 9" },
              { label: "4 / 3", value: "4 / 3" },
              { label: "1 / 1", value: "1 / 1" },
              { label: "9 / 16", value: "9 / 16" },
            ]}
            onChange={(ratio) => onChange({ ...s, ratio } as ControlSettings)}
          />
        </div>
      );
    }
    case "container": {
      const s = settings as ControlSettingsBySlug["container"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Size"
            value={s.size}
            options={[
              { label: "SM", value: "sm" },
              { label: "MD", value: "md" },
              { label: "LG", value: "lg" },
              { label: "XL", value: "xl" },
              { label: "Full", value: "full" },
            ]}
            onChange={(size) => onChange({ ...s, size } as ControlSettings)}
          />
          <SettingToggle
            label="Padded"
            checked={s.padded}
            onChange={(padded) => onChange({ ...s, padded } as ControlSettings)}
          />
        </div>
      );
    }
    case "spacer": {
      const s = settings as ControlSettingsBySlug["spacer"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Axis"
            value={s.axis}
            options={[
              { label: "Y", value: "y" },
              { label: "X", value: "x" },
              { label: "Both", value: "both" },
            ]}
            onChange={(axis) => onChange({ ...s, axis } as ControlSettings)}
          />
          <SettingInput
            label="Size"
            type="number"
            value={String(s.size)}
            onChange={(size) =>
              onChange({
                ...s,
                size: Math.min(Math.max(Number(size) || 0, 0), 96),
              } as ControlSettings)
            }
          />
          <SettingToggle
            label="Flex grow"
            checked={s.flex}
            onChange={(flex) => onChange({ ...s, flex } as ControlSettings)}
          />
        </div>
      );
    }
    case "breadcrumb": {
      const s = settings as ControlSettingsBySlug["breadcrumb"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Separator"
            value={s.separator}
            onChange={(separator) =>
              onChange({ ...s, separator } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "pagination": {
      const s = settings as ControlSettingsBySlug["pagination"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Page"
            type="number"
            value={String(s.page)}
            onChange={(page) =>
              onChange({
                ...s,
                page: Math.min(Math.max(Number(page) || 1, 1), s.pageCount),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Page count"
            type="number"
            value={String(s.pageCount)}
            onChange={(pageCount) =>
              onChange({
                ...s,
                pageCount: Math.min(Math.max(Number(pageCount) || 1, 1), 20),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "page-header": {
      const s = settings as ControlSettingsBySlug["page-header"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Breadcrumbs"
            checked={s.showBreadcrumbs}
            onChange={(showBreadcrumbs) =>
              onChange({ ...s, showBreadcrumbs } as ControlSettings)
            }
          />
          <SettingToggle
            label="Actions"
            checked={s.showActions}
            onChange={(showActions) =>
              onChange({ ...s, showActions } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "toolbar": {
      const s = settings as ControlSettingsBySlug["toolbar"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Dense"
            checked={s.dense}
            onChange={(dense) => onChange({ ...s, dense } as ControlSettings)}
          />
        </div>
      );
    }
    case "application-footer": {
      const s = settings as ControlSettingsBySlug["application-footer"];
      return <div className={shellStyles.settingsGrid}><SettingToggle label="Brand" checked={s.showBrand} onChange={(showBrand) => onChange({ ...s, showBrand } as ControlSettings)} /><SettingToggle label="Version" checked={s.showVersion} onChange={(showVersion) => onChange({ ...s, showVersion } as ControlSettings)} /><SettingToggle label="Actions" checked={s.showActions} onChange={(showActions) => onChange({ ...s, showActions } as ControlSettings)} /></div>;
    }
    case "application-header": {
      const s = settings as ControlSettingsBySlug["application-header"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Search"
            checked={s.showSearch}
            onChange={(showSearch) => onChange({ ...s, showSearch } as ControlSettings)}
          />
          <SettingToggle
            label="User profile"
            checked={s.showProfile}
            onChange={(showProfile) => onChange({ ...s, showProfile } as ControlSettings)}
          />
        </div>
      );
    }
    case "bottom-navigation": {
      const s = settings as ControlSettingsBySlug["bottom-navigation"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Active"
            value={s.value}
            options={[
              { label: "Home", value: "home" },
              { label: "Search", value: "search" },
              { label: "Create", value: "create" },
              { label: "Profile", value: "profile" },
            ]}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
          />
        </div>
      );
    }
    case "navigation-rail": {
      const s = settings as ControlSettingsBySlug["navigation-rail"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Collapsed"
            checked={s.collapsed}
            onChange={(collapsed) =>
              onChange({ ...s, collapsed } as ControlSettings)
            }
          />
          <SettingSelect
            label="Active"
            value={s.value}
            options={[
              { label: "Inbox", value: "inbox" },
              { label: "Projects", value: "projects" },
              { label: "Calendar", value: "calendar" },
              { label: "Settings", value: "settings" },
            ]}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
          />
        </div>
      );
    }
    case "split-button": {
      const s = settings as ControlSettingsBySlug["split-button"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Variant"
            value={s.variant}
            options={[
              { label: "Primary", value: "primary" },
              { label: "Secondary", value: "secondary" },
              { label: "Success", value: "success" },
              { label: "Danger", value: "danger" },
            ]}
            onChange={(variant) =>
              onChange({ ...s, variant } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "fab": {
      const s = settings as ControlSettingsBySlug["fab"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Extended"
            checked={s.extended}
            onChange={(extended) =>
              onChange({ ...s, extended } as ControlSettings)
            }
          />
          <SettingSelect
            label="Size"
            value={s.size}
            options={[
              { label: "SM", value: "sm" },
              { label: "MD", value: "md" },
              { label: "LG", value: "lg" },
            ]}
            onChange={(size) => onChange({ ...s, size } as ControlSettings)}
          />
        </div>
      );
    }
    case "tile": {
      const s = settings as ControlSettingsBySlug["tile"];
      return (
        <div className={shellStyles.settingsGrid}>
          <div className={shellStyles.settingsFullWidth}>
            <IconPicker
              id="opus-setting-tile-icon"
              label="Icon"
              labelPosition="left"
              mode="stacked"
              value={s.icon}
              onChange={(icon) => onChange({ ...s, icon } as ControlSettings)}
            />
          </div>
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <SettingSelect
            label="Tone"
            value={s.tone}
            options={[
              { label: "Purple", value: "purple" },
              { label: "Blue", value: "blue" },
            ]}
            onChange={(tone) => onChange({ ...s, tone } as ControlSettings)}
          />
        </div>
      );
    }
    case "tiles": {
      const s = settings as ControlSettingsBySlug["tiles"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Layout"
            value={s.layout}
            onChange={(layout) =>
              onChange({
                ...s,
                layout: layout as typeof s.layout,
              } as ControlSettings)
            }
            options={[
              { label: "Fill", value: "fill" },
              { label: "Fixed", value: "fixed" },
            ]}
          />
          <p className={shellStyles.settingsHint}>
            Fill expands tiles to use the full row width when they fit, and
            scrolls when they overflow. Fixed keeps each tile at its default
            size and scrolls when needed.
          </p>
        </div>
      );
    }
    case "stat-tiles": {
      const s = settings as ControlSettingsBySlug["stat-tiles"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Layout"
            value={s.layout}
            onChange={(layout) =>
              onChange({
                ...s,
                layout: layout as typeof s.layout,
              } as ControlSettings)
            }
            options={[
              { label: "Fill", value: "fill" },
              { label: "Fixed", value: "fixed" },
            ]}
          />
          <p className={shellStyles.settingsHint}>
            Fill expands stat tiles to use the full row width when they fit, and
            scrolls when they overflow. Fixed keeps each tile at its default
            size and scrolls when needed.
          </p>
        </div>
      );
    }
    case "stat-tile": {
      const s = settings as ControlSettingsBySlug["stat-tile"];
      return (
        <div className={shellStyles.settingsGrid}>
          <div className={shellStyles.settingsFullWidth}>
            <IconPicker
              id="opus-setting-stat-tile-icon"
              label="Icon"
              labelPosition="left"
              mode="stacked"
              value={s.icon}
              onChange={(icon) => onChange({ ...s, icon } as ControlSettings)}
            />
          </div>
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <SettingInput
            label="Value"
            value={s.value}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
          />
          <SettingSelect
            label="Tone"
            value={s.tone}
            options={[
              { label: "Purple", value: "purple" },
              { label: "Blue", value: "blue" },
            ]}
            onChange={(tone) => onChange({ ...s, tone } as ControlSettings)}
          />
          <SettingInput
            label="Trend value"
            value={s.trendValue}
            onChange={(trendValue) =>
              onChange({ ...s, trendValue } as ControlSettings)
            }
          />
          <SettingSelect
            label="Trend"
            value={s.trend}
            options={[
              { label: "Up", value: "up" },
              { label: "Down", value: "down" },
            ]}
            onChange={(trend) => onChange({ ...s, trend } as ControlSettings)}
          />
          <SettingInput
            label="Comparison"
            value={s.comparison}
            onChange={(comparison) =>
              onChange({ ...s, comparison } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "property-inspector": {
      const s = settings as ControlSettingsBySlug["property-inspector"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Searchable"
            checked={s.searchable}
            onChange={(searchable) =>
              onChange({ ...s, searchable } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "filter-builder": {
      const s = settings as ControlSettingsBySlug["filter-builder"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Seed count"
            type="number"
            value={String(s.seedCount)}
            onChange={(seedCount) =>
              onChange({
                ...s,
                seedCount: Math.min(Math.max(Number(seedCount) || 0, 0), 6),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "query-builder": {
      const s = settings as ControlSettingsBySlug["query-builder"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Combinator"
            value={s.combinator}
            options={[
              { label: "AND", value: "and" },
              { label: "OR", value: "or" },
            ]}
            onChange={(combinator) =>
              onChange({ ...s, combinator } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "rule-builder": {
      const s = settings as ControlSettingsBySlug["rule-builder"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Show disabled rules"
            checked={s.showDisabled}
            onChange={(showDisabled) =>
              onChange({ ...s, showDisabled } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "permissions-matrix": {
      const s = settings as ControlSettingsBySlug["permissions-matrix"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Compact hint"
            checked={s.compact}
            onChange={(compact) =>
              onChange({ ...s, compact } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "dual-list-builder": {
      const s = settings as ControlSettingsBySlug["dual-list-builder"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Selected count"
            type="number"
            value={String(s.selectedCount)}
            onChange={(selectedCount) =>
              onChange({
                ...s,
                selectedCount: Math.min(
                  Math.max(Number(selectedCount) || 0, 0),
                  6,
                ),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "scheduler": {
      const s = settings as ControlSettingsBySlug["scheduler"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Start hour"
            type="number"
            value={String(s.startHour)}
            onChange={(startHour) =>
              onChange({
                ...s,
                startHour: Math.min(Math.max(Number(startHour) || 0, 0), 23),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="End hour"
            type="number"
            value={String(s.endHour)}
            onChange={(endHour) =>
              onChange({
                ...s,
                endHour: Math.min(Math.max(Number(endHour) || 0, 1), 24),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "kanban-board": {
      const s = settings as ControlSettingsBySlug["kanban-board"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Interactive drag"
            checked={s.interactive}
            onChange={(interactive) =>
              onChange({ ...s, interactive } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "calendar": {
      const s = settings as ControlSettingsBySlug["calendar"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Open day modal"
            checked={s.openDayOnSelect}
            onChange={(openDayOnSelect) =>
              onChange({ ...s, openDayOnSelect } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show events"
            checked={s.showEvents}
            onChange={(showEvents) =>
              onChange({ ...s, showEvents } as ControlSettings)
            }
          />
          <SettingToggle
            label="Month/year picker"
            checked={s.showMonthYearPicker}
            onChange={(showMonthYearPicker) =>
              onChange({ ...s, showMonthYearPicker } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "resource-planner": {
      const s = settings as ControlSettingsBySlug["resource-planner"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Start hour"
            type="number"
            value={String(s.startHour)}
            onChange={(startHour) =>
              onChange({
                ...s,
                startHour: Math.min(Math.max(Number(startHour) || 0, 0), 23),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="End hour"
            type="number"
            value={String(s.endHour)}
            onChange={(endHour) =>
              onChange({
                ...s,
                endHour: Math.min(Math.max(Number(endHour) || 0, 1), 24),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "json-viewer": {
      const s = settings as ControlSettingsBySlug["json-viewer"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Collapsed depth"
            type="number"
            value={String(s.collapsedDepth)}
            onChange={(collapsedDepth) =>
              onChange({
                ...s,
                collapsedDepth: Math.min(
                  Math.max(Number(collapsedDepth) || 0, 0),
                  4,
                ),
              } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "statistic": {
      const s = settings as ControlSettingsBySlug["statistic"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <SettingInput
            label="Value"
            value={s.value}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
          />
          <SettingInput
            label="Prefix"
            value={s.prefix}
            onChange={(prefix) => onChange({ ...s, prefix } as ControlSettings)}
          />
          <SettingInput
            label="Suffix"
            value={s.suffix}
            onChange={(suffix) => onChange({ ...s, suffix } as ControlSettings)}
          />
          <SettingToggle
            label="Show trend"
            checked={s.trendEnabled}
            onChange={(trendEnabled) =>
              onChange({ ...s, trendEnabled } as ControlSettings)
            }
          />
          {s.trendEnabled ? (
            <>
              <SettingSelect
                label="Trend"
                value={s.trend}
                onChange={(trend) =>
                  onChange({
                    ...s,
                    trend: trend as typeof s.trend,
                  } as ControlSettings)
                }
                options={[
                  { label: "Up", value: "up" },
                  { label: "Down", value: "down" },
                  { label: "Flat", value: "flat" },
                ]}
              />
              <div className={shellStyles.settingsFullWidth}>
                <SettingInput
                  label="Trend label"
                  value={s.trendLabel}
                  onChange={(trendLabel) =>
                    onChange({ ...s, trendLabel } as ControlSettings)
                  }
                />
              </div>
            </>
          ) : null}
        </div>
      );
    }

    case "icon": {
      const s = settings as ControlSettingsBySlug["icon"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Name"
            value={s.name}
            onChange={(name) => onChange({ ...s, name } as ControlSettings)}
          />
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ]}
          />
          <SettingSelect
            label="Tone"
            value={s.tone}
            onChange={(tone) =>
              onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)
            }
            options={[
              { label: "Default", value: "default" },
              { label: "Muted", value: "muted" },
              { label: "Accent", value: "accent" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Danger", value: "danger" },
            ]}
          />
          <SettingToggle
            label="Accessible label"
            checked={s.labelEnabled}
            onChange={(labelEnabled) =>
              onChange({ ...s, labelEnabled } as ControlSettings)
            }
          />
          {s.labelEnabled ? (
            <SettingInput
              label="Label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          ) : null}
        </div>
      );
    }
    case "icon-badge": {
      const s = settings as ControlSettingsBySlug["icon-badge"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Toolbar demo"
            checked={s.showToolbarDemo}
            onChange={(showToolbarDemo) =>
              onChange({ ...s, showToolbarDemo } as ControlSettings)
            }
          />
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ]}
          />
          <SettingSelect
            label="Tone"
            value={s.tone}
            onChange={(tone) =>
              onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)
            }
            options={[
              { label: "Default", value: "default" },
              { label: "Muted", value: "muted" },
              { label: "Accent", value: "accent" },
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Danger", value: "danger" },
            ]}
          />
          <SettingSelect
            label="Badge urgency"
            value={s.urgency}
            onChange={(urgency) =>
              onChange({
                ...s,
                urgency: urgency as typeof s.urgency,
              } as ControlSettings)
            }
            options={[
              { label: "Standard", value: "standard" },
              { label: "Danger", value: "danger" },
              { label: "Warning", value: "warning" },
              { label: "Success", value: "success" },
              { label: "Info", value: "info" },
            ]}
          />
          <SettingInput
            label="Count"
            type="number"
            value={String(s.count)}
            onChange={(count) =>
              onChange({
                ...s,
                count: Math.max(0, Number(count) || 0),
              } as ControlSettings)
            }
          />
          <SettingInput
            label="Max count"
            type="number"
            value={String(s.max)}
            onChange={(max) =>
              onChange({
                ...s,
                max: Math.max(1, Number(max) || 99),
              } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show zero badge"
            checked={s.showZero}
            onChange={(showZero) =>
              onChange({ ...s, showZero } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Icon name"
              value={s.iconName}
              onChange={(iconName) =>
                onChange({ ...s, iconName } as ControlSettings)
              }
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Accessible label"
              value={s.label}
              onChange={(label) => onChange({ ...s, label } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "spinner": {
      const s = settings as ControlSettingsBySlug["spinner"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ]}
          />
          <SettingSelect
            label="Tone"
            value={s.tone}
            onChange={(tone) =>
              onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)
            }
            options={[
              { label: "Accent", value: "accent" },
              { label: "Muted", value: "muted" },
              { label: "Inverse", value: "inverse" },
            ]}
          />
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
        </div>
      );
    }
    case "clock": {
      const s = settings as ControlSettingsBySlug["clock"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ]}
          />
          <SettingToggle
            label="Show analog"
            checked={s.showAnalog}
            onChange={(showAnalog) =>
              onChange({ ...s, showAnalog } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show digital"
            checked={s.showDigital}
            onChange={(showDigital) =>
              onChange({ ...s, showDigital } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show date"
            checked={s.showDate}
            onChange={(showDate) =>
              onChange({ ...s, showDate } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "portal": {
      const s = settings as ControlSettingsBySlug["portal"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Disabled"
            checked={s.disabled}
            onChange={(disabled) =>
              onChange({ ...s, disabled } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Message"
              value={s.message}
              onChange={(message) =>
                onChange({ ...s, message } as ControlSettings)
              }
            />
          </div>
        </div>
      );
    }
    case "portal-host": {
      const s = settings as ControlSettingsBySlug["portal-host"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Host id"
            value={s.hostId}
            onChange={(hostId) => onChange({ ...s, hostId } as ControlSettings)}
          />
          <SettingInput
            label="Message"
            value={s.message}
            onChange={(message) =>
              onChange({ ...s, message } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "visually-hidden": {
      const s = settings as ControlSettingsBySlug["visually-hidden"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Show hint"
            checked={s.showHint}
            onChange={(showHint) =>
              onChange({ ...s, showHint } as ControlSettings)
            }
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Hidden text"
              value={s.text}
              onChange={(text) => onChange({ ...s, text } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "focus-trap": {
      const s = settings as ControlSettingsBySlug["focus-trap"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Active"
            checked={s.active}
            onChange={(active) => onChange({ ...s, active } as ControlSettings)}
          />
        </div>
      );
    }
    case "keyboard-shortcut": {
      const s = settings as ControlSettingsBySlug["keyboard-shortcut"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Keys"
            value={s.keys}
            onChange={(keys) => onChange({ ...s, keys } as ControlSettings)}
          />
          <SettingSelect
            label="Size"
            value={s.size}
            onChange={(size) =>
              onChange({ ...s, size: size as typeof s.size } as ControlSettings)
            }
            options={[
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
            ]}
          />
        </div>
      );
    }
    case "hotkey-manager": {
      const s = settings as ControlSettingsBySlug["hotkey-manager"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingToggle
            label="Enabled"
            checked={s.enabled}
            onChange={(enabled) =>
              onChange({ ...s, enabled } as ControlSettings)
            }
          />
          <SettingInput
            label="Key"
            value={s.key}
            onChange={(key) => onChange({ ...s, key } as ControlSettings)}
          />
        </div>
      );
    }
    case "copy-button": {
      const s = settings as ControlSettingsBySlug["copy-button"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Value"
            value={s.value}
            onChange={(value) => onChange({ ...s, value } as ControlSettings)}
          />
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <SettingInput
            label="Copied label"
            value={s.copiedLabel}
            onChange={(copiedLabel) =>
              onChange({ ...s, copiedLabel } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "clipboard": {
      const s = settings as ControlSettingsBySlug["clipboard"];
      return (
        <div className={shellStyles.settingsGrid}>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Value"
              value={s.value}
              onChange={(value) => onChange({ ...s, value } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "theme-provider": {
      const s = settings as ControlSettingsBySlug["theme-provider"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Theme"
            value={s.theme}
            onChange={(theme) =>
              onChange({
                ...s,
                theme: theme as typeof s.theme,
              } as ControlSettings)
            }
            options={[
              { label: "Dark", value: "dark" },
              { label: "Light", value: "light" },
            ]}
          />
        </div>
      );
    }
    case "theme-switcher": {
      const s = settings as ControlSettingsBySlug["theme-switcher"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Label"
            value={s.label}
            onChange={(label) => onChange({ ...s, label } as ControlSettings)}
          />
          <SettingSelect
            label="Theme"
            value={s.theme}
            onChange={(theme) =>
              onChange({
                ...s,
                theme: theme as typeof s.theme,
              } as ControlSettings)
            }
            options={[
              { label: "Dark", value: "dark" },
              { label: "Light", value: "light" },
            ]}
          />
        </div>
      );
    }
    case "resize-observer": {
      const s = settings as ControlSettingsBySlug["resize-observer"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Hint"
            value={s.hint}
            onChange={(hint) => onChange({ ...s, hint } as ControlSettings)}
          />
        </div>
      );
    }
    case "intersection-observer": {
      const s = settings as ControlSettingsBySlug["intersection-observer"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Threshold"
            value={String(s.threshold)}
            onChange={(threshold) =>
              onChange({
                ...s,
                threshold: Math.min(1, Math.max(0, Number(threshold) || 0)),
              } as ControlSettings)
            }
          />
        </div>
      );
    }

    case "sidebar":
    case "lab-sidebar": {
      const s = settings as ControlSettingsBySlug["sidebar"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Side"
            value={s.side}
            onChange={(side) =>
              onChange({ ...s, side: side as typeof s.side } as ControlSettings)
            }
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
          />
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Inside widget container"
            checked={s.wrapInContainer ?? false}
            onChange={(wrapInContainer) =>
              onChange({ ...s, wrapInContainer } as ControlSettings)
            }
          />
          {s.wrapInContainer ? (
            <DashboardHeightSetting
              value={s.height ?? "auto"}
              onChange={(height) =>
                onChange({ ...s, height } as ControlSettings)
              }
            />
          ) : null}
          <SettingSelect
            label="Active item"
            value={s.activeItem}
            onChange={(activeItem) =>
              onChange({
                ...s,
                activeItem: activeItem as typeof s.activeItem,
              } as ControlSettings)
            }
            options={[
              { label: "Overview", value: "overview" },
              { label: "Components", value: "library" },
              { label: "Templates", value: "templates" },
              { label: "Tokens", value: "tokens" },
              { label: "Settings", value: "settings" },
            ]}
          />
          <SettingToggle
            label="Padding top"
            checked={s.paddingTop ?? false}
            onChange={(paddingTop) =>
              onChange({ ...s, paddingTop } as ControlSettings)
            }
          />
          <SettingToggle
            label="Padding bottom"
            checked={s.paddingBottom ?? false}
            onChange={(paddingBottom) =>
              onChange({ ...s, paddingBottom } as ControlSettings)
            }
          />
          <SettingToggle
            label="Padding left"
            checked={s.paddingLeft ?? false}
            onChange={(paddingLeft) =>
              onChange({ ...s, paddingLeft } as ControlSettings)
            }
          />
          <SettingToggle
            label="Padding right"
            checked={s.paddingRight ?? false}
            onChange={(paddingRight) =>
              onChange({ ...s, paddingRight } as ControlSettings)
            }
          />
          <SettingToggle
            label="Collapsed"
            checked={s.collapsed}
            onChange={(collapsed) =>
              onChange({ ...s, collapsed } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show header"
            checked={s.showHeader}
            onChange={(showHeader) =>
              onChange({ ...s, showHeader } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show footer"
            checked={s.showFooter}
            onChange={(showFooter) =>
              onChange({ ...s, showFooter } as ControlSettings)
            }
          />
          {s.showFooter ? (
            <>
              <SettingToggle
                label="Footer padding top"
                checked={s.footerPaddingTop ?? false}
                onChange={(footerPaddingTop) =>
                  onChange({ ...s, footerPaddingTop } as ControlSettings)
                }
              />
              <SettingToggle
                label="Footer padding bottom"
                checked={s.footerPaddingBottom ?? false}
                onChange={(footerPaddingBottom) =>
                  onChange({ ...s, footerPaddingBottom } as ControlSettings)
                }
              />
              <SettingToggle
                label="Footer padding left"
                checked={s.footerPaddingLeft ?? false}
                onChange={(footerPaddingLeft) =>
                  onChange({ ...s, footerPaddingLeft } as ControlSettings)
                }
              />
              <SettingToggle
                label="Footer padding right"
                checked={s.footerPaddingRight ?? false}
                onChange={(footerPaddingRight) =>
                  onChange({ ...s, footerPaddingRight } as ControlSettings)
                }
              />
            </>
          ) : null}
          <SettingToggle
            label="Group expanded"
            checked={s.groupOpen}
            onChange={(groupOpen) =>
              onChange({ ...s, groupOpen } as ControlSettings)
            }
          />
          <SettingToggle
            label="Persist state"
            checked={s.persistState}
            onChange={(persistState) =>
              onChange({ ...s, persistState } as ControlSettings)
            }
          />
          {s.showHeader ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Header title"
                value={s.headerTitle}
                onChange={(headerTitle) =>
                  onChange({ ...s, headerTitle } as ControlSettings)
                }
              />
            </div>
          ) : null}
          {s.showFooter ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Footer text"
                value={s.footerText}
                onChange={(footerText) =>
                  onChange({ ...s, footerText } as ControlSettings)
                }
              />
            </div>
          ) : null}
        </div>
      );
    }
    case "mega-menu": {
      const s = settings as ControlSettingsBySlug["mega-menu"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Columns"
            value={String(s.columnCount)}
            onChange={(columnCount) =>
              onChange({
                ...s,
                columnCount: Number(columnCount) as typeof s.columnCount,
              } as ControlSettings)
            }
            options={[
              { label: "1 column", value: "1" },
              { label: "2 columns", value: "2" },
              { label: "3 columns", value: "3" },
              { label: "4 columns", value: "4" },
            ]}
          />
          <SettingSelect
            label="Items per column"
            value={String(s.itemsPerColumn)}
            onChange={(itemsPerColumn) =>
              onChange({
                ...s,
                itemsPerColumn: Number(
                  itemsPerColumn,
                ) as typeof s.itemsPerColumn,
              } as ControlSettings)
            }
            options={[
              { label: "1 item", value: "1" },
              { label: "2 items", value: "2" },
              { label: "3 items", value: "3" },
              { label: "4 items", value: "4" },
              { label: "5 items", value: "5" },
            ]}
          />
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Featured panel"
            checked={s.featured}
            onChange={(featured) =>
              onChange({ ...s, featured } as ControlSettings)
            }
          />
          {s.featured ? (
            <>
              <div className={shellStyles.settingsFullWidth}>
                <SettingInput
                  label="Featured eyebrow"
                  value={s.featuredEyebrow}
                  onChange={(featuredEyebrow) =>
                    onChange({ ...s, featuredEyebrow } as ControlSettings)
                  }
                />
              </div>
              <div className={shellStyles.settingsFullWidth}>
                <SettingInput
                  label="Featured title"
                  value={s.featuredTitle}
                  onChange={(featuredTitle) =>
                    onChange({ ...s, featuredTitle } as ControlSettings)
                  }
                />
              </div>
              <div className={shellStyles.settingsFullWidth}>
                <SettingTextarea
                  label="Featured description"
                  value={s.featuredDescription}
                  onChange={(featuredDescription) =>
                    onChange({ ...s, featuredDescription } as ControlSettings)
                  }
                />
              </div>
              <div className={shellStyles.settingsFullWidth}>
                <SettingInput
                  label="Featured action label"
                  value={s.featuredActionLabel}
                  onChange={(featuredActionLabel) =>
                    onChange({ ...s, featuredActionLabel } as ControlSettings)
                  }
                />
              </div>
            </>
          ) : null}
          <SettingToggle
            label="Outside dismiss"
            checked={s.closeOnOutside}
            onChange={(closeOnOutside) =>
              onChange({ ...s, closeOnOutside } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.closeOnEscape}
            onChange={(closeOnEscape) =>
              onChange({ ...s, closeOnEscape } as ControlSettings)
            }
          />
        </div>
      );
    }
    case "top-navigation": {
      const s = settings as ControlSettingsBySlug["top-navigation"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Open menu"
            value={s.activeMenu}
            onChange={(activeMenu) =>
              onChange({
                ...s,
                activeMenu: activeMenu as typeof s.activeMenu,
              } as ControlSettings)
            }
            options={[
              { label: "None", value: "none" },
              { label: "App", value: "app" },
              { label: "File", value: "file" },
              { label: "Edit", value: "edit" },
              { label: "View", value: "view" },
              { label: "Window", value: "window" },
              { label: "Help", value: "help" },
            ]}
          />
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({
                ...s,
                density: density as typeof s.density,
              } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Outside dismiss"
            checked={s.closeOnOutside}
            onChange={(closeOnOutside) =>
              onChange({ ...s, closeOnOutside } as ControlSettings)
            }
          />
          <SettingToggle
            label="Escape dismiss"
            checked={s.closeOnEscape}
            onChange={(closeOnEscape) =>
              onChange({ ...s, closeOnEscape } as ControlSettings)
            }
          />
          <SettingToggle
            label="Close on select"
            checked={s.closeOnSelect}
            onChange={(closeOnSelect) =>
              onChange({ ...s, closeOnSelect } as ControlSettings)
            }
          />
          <SettingToggle
            label="Show shortcuts"
            checked={s.showShortcuts}
            onChange={(showShortcuts) =>
              onChange({ ...s, showShortcuts } as ControlSettings)
            }
          />
        </div>
      );
    }
    default:
      return null;
  }
}
