"use client";

import type { BaseFieldSettings, ControlSettings, ControlSettingsBySlug, ControlSlug } from "@/lib/controls/types";
import { isCartesianChartSlug, isChartSlug, isMatrixChartSlug } from "@/lib/controls/chartCatalog";
import { chartVerticalBar36MonthData } from "@/lib/controls/chartDemoData";
import {
  gaugePaletteOptions,
  gaugeTrackToneOptions,
  gaugeValueToneOptions,
} from "@/lib/controls/dashboardWidgetData";
import {
  DashboardPreviewLayoutSetting,
  SettingInput,
  SettingSelect,
  SettingTextarea,
  SettingToggle,
} from "./SettingField";
import { IconPicker } from "@/components/IconPicker";
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
    description: "Choose yes to continue, or no to go back and review the details.",
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
  showErrorSettings = true,
}: {
  settings: BaseFieldSettings & Record<string, unknown>;
  onChange: (next: BaseFieldSettings & Record<string, unknown>) => void;
  includeValue?: boolean;
  showErrorSettings?: boolean;
}) {
  return (
    <>
      <SettingSelect
        label="Layout mode"
        value={settings.mode}
        onChange={(mode) => onChange({ ...settings, mode: mode as typeof settings.mode })}
        options={[
          { label: "Stacked", value: "stacked" },
          { label: "Flagged", value: "flagged" },
        ]}
      />
      <SettingSelect
        label="Label position"
        value={settings.labelPosition}
        onChange={(labelPosition) =>
          onChange({ ...settings, labelPosition: labelPosition as typeof settings.labelPosition })
        }
        options={[
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ]}
      />
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
          onChange={(value) => onChange({ ...settings, value } as typeof settings)}
        />
      ) : null}
    </>
  );
}

export function ControlSettingsPanel({ slug, settings, onChange }: ControlSettingsPanelProps) {
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
            onChange({ ...s, palette: palette as typeof s.palette } as ControlSettings)
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
            onChange={(showAxis) => onChange({ ...s, showAxis } as ControlSettings)}
          />
        ) : null}
        <SettingToggle
          label="Grid"
          checked={s.showGrid}
          onChange={(showGrid) => onChange({ ...s, showGrid } as ControlSettings)}
        />
        <SettingToggle
          label="Legend"
          checked={s.showLegend}
          onChange={(showLegend) => onChange({ ...s, showLegend } as ControlSettings)}
        />
        <SettingToggle
          label="Values"
          checked={s.showValues}
          onChange={(showValues) => onChange({ ...s, showValues } as ControlSettings)}
        />
        <SettingToggle
          label="Maximise width"
          checked={s.maximise}
          onChange={(maximise) => onChange({ ...s, maximise } as ControlSettings)}
        />
        <SettingSelect
          label="Preview layout"
          value={s.previewLayout}
          onChange={(previewLayout) =>
            onChange({ ...s, previewLayout: previewLayout as typeof s.previewLayout } as ControlSettings)
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
                onChange={(xAxisLabel) => onChange({ ...s, xAxisLabel } as ControlSettings)}
              />
            </div>
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Y axis label"
                value={s.yAxisLabel}
                onChange={(yAxisLabel) => onChange({ ...s, yAxisLabel } as ControlSettings)}
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
            onChange={(placeholderEnabled) => onChange({ ...s, placeholderEnabled } as ControlSettings)}
          />
          {s.placeholderEnabled ? (
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) => onChange({ ...s, placeholder } as ControlSettings)}
            />
          ) : null}
        </div>
      );
    }
    case "email-input":
    case "password-input":
    case "search-input":
    case "telephone-input":
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
            onChange={(maxCharsEnabled) => onChange({ ...s, maxCharsEnabled } as ControlSettings)}
          />
          {s.maxCharsEnabled ? (
            <SettingInput
              label="Max characters"
              type="number"
              value={String(s.maxChars)}
              onChange={(value) =>
                onChange({ ...s, maxChars: Number(value) || 0 } as ControlSettings)
              }
            />
          ) : null}
          <SettingToggle
            label="Show placeholder"
            checked={s.placeholderEnabled}
            onChange={(placeholderEnabled) => onChange({ ...s, placeholderEnabled } as ControlSettings)}
          />
          {s.placeholderEnabled ? (
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) => onChange({ ...s, placeholder } as ControlSettings)}
            />
          ) : null}
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
            onChange={(shape) => onChange({ ...s, shape: shape as typeof s.shape } as ControlSettings)}
            options={[
              { label: "Round", value: "round" },
              { label: "Square", value: "square" },
            ]}
          />
          <SettingToggle
            label="Show global error"
            checked={s.errorEnabled}
            onChange={(errorEnabled) => onChange({ ...s, errorEnabled } as ControlSettings)}
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
              onChange={(optionError) => onChange({ ...s, optionError } as ControlSettings)}
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
              const defaults = presetDefaults[preset as keyof typeof presetDefaults];
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
            onChange={(variant) => onChange({ ...s, variant: variant as typeof s.variant } as ControlSettings)}
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
            onChange={(placeholderEnabled) => onChange({ ...s, placeholderEnabled } as ControlSettings)}
          />
          {s.placeholderEnabled ? (
            <SettingInput
              label="Placeholder"
              value={s.placeholder}
              onChange={(placeholder) => onChange({ ...s, placeholder } as ControlSettings)}
            />
          ) : null}
          <SettingToggle
            label="Disabled"
            checked={s.disabled}
            onChange={(disabled) => onChange({ ...s, disabled } as ControlSettings)}
          />
          <SettingToggle
            label="Read only"
            checked={s.readOnly}
            onChange={(readOnly) => onChange({ ...s, readOnly } as ControlSettings)}
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
            onChange={(checked) => onChange({ ...s, checked } as ControlSettings)}
          />
          <SettingSelect
            label="Shape"
            value={s.shape}
            onChange={(shape) => onChange({ ...s, shape: shape as typeof s.shape } as ControlSettings)}
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
            onChange={(checked) => onChange({ ...s, checked } as ControlSettings)}
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
            onChange={(value) => onChange({ ...s, value: Number(value) || 0 } as ControlSettings)}
          />
          <SettingInput
            label="Step"
            numberStep={0.001}
            type="number"
            value={String(s.step)}
            onChange={(step) => onChange({ ...s, step: Number(step) || 1 } as ControlSettings)}
          />
          <SettingInput
            label="Min"
            numberStep={s.step}
            type="number"
            value={String(s.min)}
            onChange={(min) => onChange({ ...s, min: Number(min) || 0 } as ControlSettings)}
          />
          <SettingInput
            label="Max"
            numberStep={s.step}
            type="number"
            value={String(s.max)}
            onChange={(max) => onChange({ ...s, max: Number(max) || 0 } as ControlSettings)}
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
            onChange={(value) => onChange({ ...s, value: Number(value) || 0 } as ControlSettings)}
          />
          <SettingInput
            label="Step"
            numberStep={0.001}
            type="number"
            value={String(s.step)}
            onChange={(step) => onChange({ ...s, step: Number(step) || 1 } as ControlSettings)}
          />
          <SettingInput
            label="Min"
            numberStep={s.step}
            type="number"
            value={String(s.min)}
            onChange={(min) => onChange({ ...s, min: Number(min) || 0 } as ControlSettings)}
          />
          <SettingInput
            label="Max"
            numberStep={s.step}
            type="number"
            value={String(s.max)}
            onChange={(max) => onChange({ ...s, max: Number(max) || 0 } as ControlSettings)}
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
            onChange={(fileName) => onChange({ ...s, fileName } as ControlSettings)}
            placeholder="Leave empty for placeholder state"
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
            label="Variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({ ...s, variant: variant as typeof s.variant } as ControlSettings)
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
            onChange={(disabled) => onChange({ ...s, disabled } as ControlSettings)}
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
            onChange={(mode) => onChange({ ...s, mode: mode as typeof s.mode } as ControlSettings)}
            options={[
              { label: "Stacked", value: "stacked" },
              { label: "Flagged", value: "flagged" },
            ]}
          />
          <SettingSelect
            label="Label position"
            value={s.labelPosition}
            onChange={(labelPosition) =>
              onChange({ ...s, labelPosition: labelPosition as typeof s.labelPosition } as ControlSettings)
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
          <SettingSelect
            label="Value"
            value={s.value}
            onChange={(value) => onChange({ ...s, value: value as typeof s.value } as ControlSettings)}
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
            onChange={(mode) => onChange({ ...s, mode: mode as typeof s.mode } as ControlSettings)}
            options={[
              { label: "Stacked", value: "stacked" },
              { label: "Flagged", value: "flagged" },
            ]}
          />
          <SettingSelect
            label="Label position"
            value={s.labelPosition}
            onChange={(labelPosition) =>
              onChange({ ...s, labelPosition: labelPosition as typeof s.labelPosition } as ControlSettings)
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
            onChange={(mode) => onChange({ ...s, mode: mode as typeof s.mode } as ControlSettings)}
            options={[
              { label: "Stacked", value: "stacked" },
              { label: "Flagged", value: "flagged" },
            ]}
          />
          <SettingSelect
            label="Label position"
            value={s.labelPosition}
            onChange={(labelPosition) =>
              onChange({ ...s, labelPosition: labelPosition as typeof s.labelPosition } as ControlSettings)
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
    case "tooltip": {
      const s = settings as ControlSettingsBySlug["tooltip"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingInput
            label="Demo label"
            value={s.demoLabel}
            onChange={(demoLabel) => onChange({ ...s, demoLabel } as ControlSettings)}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Tooltip content"
              value={s.content}
              onChange={(content) => onChange({ ...s, content } as ControlSettings)}
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
              onChange({ ...s, status: status as typeof s.status } as ControlSettings)
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
              onChange={(description) => onChange({ ...s, description } as ControlSettings)}
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
            onChange={(closeButton) => onChange({ ...s, closeButton } as ControlSettings)}
          />
          <SettingToggle
            label="Footer actions"
            checked={s.footerActions}
            onChange={(footerActions) => onChange({ ...s, footerActions } as ControlSettings)}
          />
          <SettingSelect
            label="Content type"
            value={s.contentType}
            onChange={(contentType) =>
              onChange({ ...s, contentType: contentType as typeof s.contentType } as ControlSettings)
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
              onChange={(description) => onChange({ ...s, description } as ControlSettings)}
            />
          </div>
          {s.contentType === "html" ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingTextarea
                label="Content"
                value={s.content}
                onChange={(content) => onChange({ ...s, content } as ControlSettings)}
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
            onChange={(showIcons) => onChange({ ...s, showIcons } as ControlSettings)}
          />
          <div className={shellStyles.settingsFullWidth}>
            <p className={shellStyles.settingsHint}>
              The icon column appears only when at least one item includes an icon or checked state.
            </p>
          </div>
          <SettingToggle
            label="Disabled item"
            checked={s.showDisabled}
            onChange={(showDisabled) => onChange({ ...s, showDisabled } as ControlSettings)}
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
              onChange({ ...s, placement: placement as typeof s.placement } as ControlSettings)
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
            onChange={(targetLabel: string) => onChange({ ...s, targetLabel } as ControlSettings)}
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
            onChange={(showIcons) => onChange({ ...s, showIcons } as ControlSettings)}
          />
          <div className={shellStyles.settingsFullWidth}>
            <p className={shellStyles.settingsHint}>
              The icon column appears only when at least one item includes an icon or checked state.
            </p>
          </div>
          <SettingToggle
            label="Disabled item"
            checked={s.showDisabled}
            onChange={(showDisabled) => onChange({ ...s, showDisabled } as ControlSettings)}
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
            onChange={(closeOnSelect) => onChange({ ...s, closeOnSelect } as ControlSettings)}
          />
          <SettingToggle
            label="Show shortcuts"
            checked={s.showShortcuts}
            onChange={(showShortcuts) => onChange({ ...s, showShortcuts } as ControlSettings)}
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
            onChange={(showGroups) => onChange({ ...s, showGroups } as ControlSettings)}
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
              onChange={(placeholder) => onChange({ ...s, placeholder } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Empty message"
              value={s.emptyMessage}
              onChange={(emptyMessage) => onChange({ ...s, emptyMessage } as ControlSettings)}
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
            onChange={(closeButton) => onChange({ ...s, closeButton } as ControlSettings)}
          />
          <SettingToggle
            label="Footer actions"
            checked={s.footerActions}
            onChange={(footerActions) => onChange({ ...s, footerActions } as ControlSettings)}
          />
          <SettingSelect
            label="Content type"
            value={s.contentType}
            onChange={(contentType) =>
              onChange({ ...s, contentType: contentType as typeof s.contentType } as ControlSettings)
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
              onChange={(description) => onChange({ ...s, description } as ControlSettings)}
            />
          </div>
          {s.contentType === "html" ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingTextarea
                label="Content"
                value={s.content}
                onChange={(content) => onChange({ ...s, content } as ControlSettings)}
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
            onChange={(showArrow) => onChange({ ...s, showArrow } as ControlSettings)}
          />
          <SettingSelect
            label="Content type"
            value={s.contentType}
            onChange={(contentType) =>
              onChange({ ...s, contentType: contentType as typeof s.contentType } as ControlSettings)
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
              onChange({ ...s, placement: placement as typeof s.placement } as ControlSettings)
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
                onChange={(content) => onChange({ ...s, content } as ControlSettings)}
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
            onChange={(visible) => onChange({ ...s, visible } as ControlSettings)}
          />
          <SettingSelect
            label="Status"
            value={s.status}
            onChange={(status) =>
              onChange({ ...s, status: status as typeof s.status } as ControlSettings)
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
            onChange={(dismissible) => onChange({ ...s, dismissible } as ControlSettings)}
          />
          <SettingToggle
            label="Flagged icon"
            checked={s.iconFlagged}
            onChange={(iconFlagged) => onChange({ ...s, iconFlagged } as ControlSettings)}
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
              onChange={(description) => onChange({ ...s, description } as ControlSettings)}
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
              onChange({ ...s, positionVertical: positionVertical as typeof s.positionVertical } as ControlSettings)
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
                positionHorizontal: positionHorizontal as typeof s.positionHorizontal,
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
              onChange({ ...s, status: status as typeof s.status } as ControlSettings)
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
            onChange={(dismissible) => onChange({ ...s, dismissible } as ControlSettings)}
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
                onChange={(description) => onChange({ ...s, description } as ControlSettings)}
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
            onChange={(tone) => onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)}
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
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
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
            onChange={(footerActions) => onChange({ ...s, footerActions } as ControlSettings)}
          />
          <SettingInput
            label="Eyebrow"
            value={s.eyebrow}
            onChange={(eyebrow) => onChange({ ...s, eyebrow } as ControlSettings)}
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
              onChange={(content) => onChange({ ...s, content } as ControlSettings)}
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
            onChange={(previewLayout) => onChange({ ...s, previewLayout } as ControlSettings)}
          />
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
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Trend badge"
            checked={s.showChange}
            onChange={(showChange) => onChange({ ...s, showChange } as ControlSettings)}
          />
          {s.showChange ? (
            <SettingSelect
              label="Trend"
              value={s.trend}
              onChange={(trend) =>
                onChange({ ...s, trend: trend as typeof s.trend } as ControlSettings)
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
                onChange={(change) => onChange({ ...s, change } as ControlSettings)}
              />
            </div>
          ) : null}
        </div>
      );
    }
    case "gauge":
    {
      const s = settings as ControlSettingsBySlug["gauge"];
      return (
        <div className={shellStyles.settingsGrid}>
          <DashboardPreviewLayoutSetting
            value={s.previewLayout}
            onChange={(previewLayout) => onChange({ ...s, previewLayout } as ControlSettings)}
          />
          <SettingSelect
            label="Variant"
            value={s.variant}
            onChange={(variant) =>
              onChange({ ...s, variant: variant as typeof s.variant } as ControlSettings)
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
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
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
              onChange({ ...s, palette: palette as typeof s.palette } as ControlSettings)
            }
            options={gaugePaletteOptions.map((palette) => ({
              label: palette === "opus" ? "Opus" : palette.charAt(0).toUpperCase() + palette.slice(1),
              value: palette,
            }))}
          />
          <SettingSelect
            label="Track colour"
            value={s.trackTone}
            onChange={(trackTone) =>
              onChange({ ...s, trackTone: trackTone as typeof s.trackTone } as ControlSettings)
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
              onChange({ ...s, valueTone: valueTone as typeof s.valueTone } as ControlSettings)
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
              onChange({ ...s, changeTrend: changeTrend as typeof s.changeTrend } as ControlSettings)
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
              onChange={(subtitle) => onChange({ ...s, subtitle } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Change"
              value={s.change}
              onChange={(change) => onChange({ ...s, change } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Summary"
              value={s.summary}
              onChange={(summary) => onChange({ ...s, summary } as ControlSettings)}
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
            onChange={(previewLayout) => onChange({ ...s, previewLayout } as ControlSettings)}
          />
          <SettingSelect
            label="Palette"
            value={s.palette}
            onChange={(palette) => onChange({ ...s, palette: palette as typeof s.palette } as ControlSettings)}
            options={[
              { label: "Opus", value: "opus" },
              { label: "Cool", value: "cool" },
              { label: "Warm", value: "warm" },
              { label: "Mono", value: "mono" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput label="Label" value={s.label} onChange={(label) => onChange({ ...s, label } as ControlSettings)} />
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
            onChange={(previewLayout) => onChange({ ...s, previewLayout } as ControlSettings)}
          />
          <SettingInput
            label="Value"
            type="number"
            value={String(s.value)}
            onChange={(value) => onChange({ ...s, value: Number(value) || 0 } as ControlSettings)}
          />
          <SettingInput
            label="Max"
            type="number"
            value={String(s.max)}
            onChange={(max) => onChange({ ...s, max: Number(max) || 100 } as ControlSettings)}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput label="Label" value={s.label} onChange={(label) => onChange({ ...s, label } as ControlSettings)} />
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
            onChange={(previewLayout) => onChange({ ...s, previewLayout } as ControlSettings)}
          />
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
            onChange={(showSparkline) => onChange({ ...s, showSparkline } as ControlSettings)}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput label="Label" value={s.label} onChange={(label) => onChange({ ...s, label } as ControlSettings)} />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput label="Value" value={s.value} onChange={(value) => onChange({ ...s, value } as ControlSettings)} />
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
            onChange={(previewLayout) => onChange({ ...s, previewLayout } as ControlSettings)}
          />
          <SettingSelect
            label="Status"
            value={s.status}
            onChange={(status) => onChange({ ...s, status: status as typeof s.status } as ControlSettings)}
            options={[
              { label: "Success", value: "success" },
              { label: "Warning", value: "warning" },
              { label: "Error", value: "error" },
              { label: "Neutral", value: "neutral" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput label="Label" value={s.label} onChange={(label) => onChange({ ...s, label } as ControlSettings)} />
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
            onChange={(previewLayout) => onChange({ ...s, previewLayout } as ControlSettings)}
          />
          <SettingSelect
            label="Direction"
            value={s.direction}
            onChange={(direction) => onChange({ ...s, direction: direction as typeof s.direction } as ControlSettings)}
            options={[
              { label: "Up", value: "up" },
              { label: "Down", value: "down" },
            ]}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput label="Value" value={s.value} onChange={(value) => onChange({ ...s, value } as ControlSettings)} />
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
            onChange={(tone) => onChange({ ...s, tone: tone as typeof s.tone } as ControlSettings)}
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
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Divided"
            checked={s.divided}
            onChange={(divided) => onChange({ ...s, divided } as ControlSettings)}
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
              onChange={(description) => onChange({ ...s, description } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Content"
              value={s.content}
              onChange={(content) => onChange({ ...s, content } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Footer"
              value={s.footer}
              onChange={(footer) => onChange({ ...s, footer } as ControlSettings)}
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
            onChange={(sidebar) => onChange({ ...s, sidebar: sidebar as typeof s.sidebar } as ControlSettings)}
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
              onChange({ ...s, columns: Number(columns) as typeof s.columns } as ControlSettings)
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
            onChange={(gap) => onChange({ ...s, gap: gap as typeof s.gap } as ControlSettings)}
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
              onChange({ ...s, stackBelow: stackBelow as typeof s.stackBelow } as ControlSettings)
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
              onChange({ ...s, sidebarRatio: sidebarRatio as typeof s.sidebarRatio } as ControlSettings)
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
              onChange={(description) => onChange({ ...s, description } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Sidebar title"
              value={s.sidebarTitle}
              onChange={(sidebarTitle) => onChange({ ...s, sidebarTitle } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Sidebar content"
              value={s.sidebarContent}
              onChange={(sidebarContent) => onChange({ ...s, sidebarContent } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Column 1 title"
              value={s.columnOneTitle}
              onChange={(columnOneTitle) => onChange({ ...s, columnOneTitle } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Column 1 content"
              value={s.columnOneContent}
              onChange={(columnOneContent) => onChange({ ...s, columnOneContent } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Column 2 title"
              value={s.columnTwoTitle}
              onChange={(columnTwoTitle) => onChange({ ...s, columnTwoTitle } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Column 2 content"
              value={s.columnTwoContent}
              onChange={(columnTwoContent) => onChange({ ...s, columnTwoContent } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Column 3 title"
              value={s.columnThreeTitle}
              onChange={(columnThreeTitle) => onChange({ ...s, columnThreeTitle } as ControlSettings)}
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
              onChange={(columnFourTitle) => onChange({ ...s, columnFourTitle } as ControlSettings)}
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
              onChange={(columnFiveTitle) => onChange({ ...s, columnFiveTitle } as ControlSettings)}
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
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Show caption"
            checked={s.showCaption}
            onChange={(showCaption) => onChange({ ...s, showCaption } as ControlSettings)}
          />
          <SettingToggle
            label="Striped rows"
            checked={s.striped}
            onChange={(striped) => onChange({ ...s, striped } as ControlSettings)}
          />
          <SettingToggle
            label="Cell borders"
            checked={s.bordered}
            onChange={(bordered) => onChange({ ...s, bordered } as ControlSettings)}
          />
          <SettingToggle
            label="Empty state"
            checked={s.showEmpty}
            onChange={(showEmpty) => onChange({ ...s, showEmpty } as ControlSettings)}
          />
          <SettingToggle
            label="Numeric alignment"
            checked={s.numericColumn}
            onChange={(numericColumn) => onChange({ ...s, numericColumn } as ControlSettings)}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Caption"
              value={s.caption}
              onChange={(caption) => onChange({ ...s, caption } as ControlSettings)}
            />
          </div>
        </div>
      );
    }
    case "data-grid": {
      const s = settings as ControlSettingsBySlug["data-grid"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Fixed top header"
            checked={s.stickyHeader}
            onChange={(stickyHeader) => onChange({ ...s, stickyHeader } as ControlSettings)}
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
            onChange={(sortable) => onChange({ ...s, sortable } as ControlSettings)}
          />
          <SettingToggle
            label="Filter by heading"
            checked={s.filterable}
            onChange={(filterable) => onChange({ ...s, filterable } as ControlSettings)}
          />
          <SettingToggle
            label="Drag by heading"
            checked={s.resizable}
            onChange={(resizable) => onChange({ ...s, resizable } as ControlSettings)}
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
            onChange={(striped) => onChange({ ...s, striped } as ControlSettings)}
          />
          <SettingToggle
            label="Cell borders"
            checked={s.bordered}
            onChange={(bordered) => onChange({ ...s, bordered } as ControlSettings)}
          />
          <SettingToggle
            label="Numeric alignment"
            checked={s.numericColumns}
            onChange={(numericColumns) => onChange({ ...s, numericColumns } as ControlSettings)}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Caption"
              value={s.caption}
              onChange={(caption) => onChange({ ...s, caption } as ControlSettings)}
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
              onChange({ ...s, variant: variant as typeof s.variant } as ControlSettings)
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
              onChange({ ...s, animation: animation as typeof s.animation } as ControlSettings)
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
                initialIndex: Math.min(Math.max(Number(initialIndex) || 1, 1), 4) - 1,
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
            onChange={(showCaptions) => onChange({ ...s, showCaptions } as ControlSettings)}
          />
          <SettingToggle
            label="Pips"
            checked={s.showPips}
            onChange={(showPips) => onChange({ ...s, showPips } as ControlSettings)}
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
            onChange={(showCaptions) => onChange({ ...s, showCaptions } as ControlSettings)}
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
            onChange={(showCaption) => onChange({ ...s, showCaption } as ControlSettings)}
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
              onChange({ ...s, columns: Number(columns) as typeof s.columns } as ControlSettings)
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
            onChange={(showCaptions) => onChange({ ...s, showCaptions } as ControlSettings)}
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
            onChange={(autoRotate) => onChange({ ...s, autoRotate } as ControlSettings)}
          />
          <SettingToggle
            label="Camera controls"
            checked={s.cameraControls}
            onChange={(cameraControls) => onChange({ ...s, cameraControls } as ControlSettings)}
          />
          <SettingToggle
            label="Caption"
            checked={s.showCaption}
            onChange={(showCaption) => onChange({ ...s, showCaption } as ControlSettings)}
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
            onChange={(showCaption) => onChange({ ...s, showCaption } as ControlSettings)}
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
              onChange={(triggerLabel) => onChange({ ...s, triggerLabel } as ControlSettings)}
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
            onChange={(showCaption) => onChange({ ...s, showCaption } as ControlSettings)}
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
              onChange({ ...s, columns: Number(columns) as typeof s.columns } as ControlSettings)
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
            onChange={(showCaptions) => onChange({ ...s, showCaptions } as ControlSettings)}
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
            onChange={(activeValue) => onChange({ ...s, activeValue } as ControlSettings)}
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
              onChange({ ...s, orientation: orientation as typeof s.orientation } as ControlSettings)
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
              onChange({ ...s, variant: variant as typeof s.variant } as ControlSettings)
            }
            options={[
              { label: "Line", value: "line" },
              { label: "Contained", value: "contained" },
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
                activeValue: disabledSecond && s.activeValue === "insights" ? "overview" : s.activeValue,
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
            onChange={(defaultOpen) => onChange({ ...s, defaultOpen } as ControlSettings)}
          />
          <SettingToggle
            label="Disabled"
            checked={s.disabled}
            onChange={(disabled) => onChange({ ...s, disabled } as ControlSettings)}
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
              onChange={(content) => onChange({ ...s, content } as ControlSettings)}
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
            onChange={(type) => onChange({ ...s, type: type as typeof s.type } as ControlSettings)}
            options={[
              { label: "Single", value: "single" },
              { label: "Multiple", value: "multiple" },
            ]}
          />
          <SettingToggle
            label="Collapsible"
            checked={s.collapsible}
            onChange={(collapsible) => onChange({ ...s, collapsible } as ControlSettings)}
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
              onChange={(itemOneTitle) => onChange({ ...s, itemOneTitle } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Item 1 content"
              value={s.itemOneContent}
              onChange={(itemOneContent) => onChange({ ...s, itemOneContent } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Item 2 title"
              value={s.itemTwoTitle}
              onChange={(itemTwoTitle) => onChange({ ...s, itemTwoTitle } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Item 2 content"
              value={s.itemTwoContent}
              onChange={(itemTwoContent) => onChange({ ...s, itemTwoContent } as ControlSettings)}
            />
          </div>
          <div className={shellStyles.settingsFullWidth}>
            <SettingInput
              label="Item 3 title"
              value={s.itemThreeTitle}
              onChange={(itemThreeTitle) => onChange({ ...s, itemThreeTitle } as ControlSettings)}
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
            onChange={(defaultExpanded) => onChange({ ...s, defaultExpanded } as ControlSettings)}
          />
          <SettingInput
            label="Max lines"
            type="number"
            value={String(s.maxLines)}
            onChange={(value) =>
              onChange({ ...s, maxLines: Math.max(1, Number(value) || 1) } as ControlSettings)
            }
          />
          <SettingInput
            label="Show more label"
            value={s.showMoreLabel}
            onChange={(showMoreLabel) => onChange({ ...s, showMoreLabel } as ControlSettings)}
          />
          <SettingInput
            label="Show less label"
            value={s.showLessLabel}
            onChange={(showLessLabel) => onChange({ ...s, showLessLabel } as ControlSettings)}
          />
          <div className={shellStyles.settingsFullWidth}>
            <SettingTextarea
              label="Content"
              value={s.content}
              onChange={(content) => onChange({ ...s, content } as ControlSettings)}
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
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Show icon"
            checked={s.showIcon}
            onChange={(showIcon) => onChange({ ...s, showIcon } as ControlSettings)}
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
            onChange={(primaryAction) => onChange({ ...s, primaryAction } as ControlSettings)}
          />
          <SettingToggle
            label="Secondary action"
            checked={s.secondaryAction}
            onChange={(secondaryAction) => onChange({ ...s, secondaryAction } as ControlSettings)}
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
              onChange={(description) => onChange({ ...s, description } as ControlSettings)}
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
    case "sidebar": {
      const s = settings as ControlSettingsBySlug["sidebar"];
      return (
        <div className={shellStyles.settingsGrid}>
          <SettingSelect
            label="Side"
            value={s.side}
            onChange={(side) => onChange({ ...s, side: side as typeof s.side } as ControlSettings)}
            options={[
              { label: "Left", value: "left" },
              { label: "Right", value: "right" },
            ]}
          />
          <SettingSelect
            label="Density"
            value={s.density}
            onChange={(density) =>
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingSelect
            label="Active item"
            value={s.activeItem}
            onChange={(activeItem) =>
              onChange({ ...s, activeItem: activeItem as typeof s.activeItem } as ControlSettings)
            }
            options={[
              { label: "Overview", value: "overview" },
              { label: "Components", value: "library" },
              { label: "Settings", value: "settings" },
            ]}
          />
          <SettingToggle
            label="Collapsed"
            checked={s.collapsed}
            onChange={(collapsed) => onChange({ ...s, collapsed } as ControlSettings)}
          />
          <SettingToggle
            label="Show header"
            checked={s.showHeader}
            onChange={(showHeader) => onChange({ ...s, showHeader } as ControlSettings)}
          />
          <SettingToggle
            label="Show footer"
            checked={s.showFooter}
            onChange={(showFooter) => onChange({ ...s, showFooter } as ControlSettings)}
          />
          <SettingToggle
            label="Group expanded"
            checked={s.groupOpen}
            onChange={(groupOpen) => onChange({ ...s, groupOpen } as ControlSettings)}
          />
          {s.showHeader ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Header title"
                value={s.headerTitle}
                onChange={(headerTitle) => onChange({ ...s, headerTitle } as ControlSettings)}
              />
            </div>
          ) : null}
          {s.showFooter ? (
            <div className={shellStyles.settingsFullWidth}>
              <SettingInput
                label="Footer text"
                value={s.footerText}
                onChange={(footerText) => onChange({ ...s, footerText } as ControlSettings)}
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
                itemsPerColumn: Number(itemsPerColumn) as typeof s.itemsPerColumn,
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
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
            }
            options={[
              { label: "Comfortable", value: "comfortable" },
              { label: "Compact", value: "compact" },
            ]}
          />
          <SettingToggle
            label="Featured panel"
            checked={s.featured}
            onChange={(featured) => onChange({ ...s, featured } as ControlSettings)}
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
            onChange={(closeOnEscape) => onChange({ ...s, closeOnEscape } as ControlSettings)}
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
              onChange({ ...s, activeMenu: activeMenu as typeof s.activeMenu } as ControlSettings)
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
              onChange({ ...s, density: density as typeof s.density } as ControlSettings)
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
            onChange={(closeOnSelect) => onChange({ ...s, closeOnSelect } as ControlSettings)}
          />
          <SettingToggle
            label="Show shortcuts"
            checked={s.showShortcuts}
            onChange={(showShortcuts) => onChange({ ...s, showShortcuts } as ControlSettings)}
          />
        </div>
      );
    }
    default:
      return null;
  }
}
