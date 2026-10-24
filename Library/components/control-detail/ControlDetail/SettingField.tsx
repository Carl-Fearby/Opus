"use client";

import {
  ColorField,
  NumberField,
  SelectField,
  SegmentedControlField,
  SwitchField,
  TextAreaField,
  TextField,
} from "@/components/fields";
import {
  dashboardHeightOptions,
  dashboardPreviewLayoutOptions,
  dashboardWidthOptions,
  type DashboardSectionHeight,
  type DashboardPreviewLayout,
  type DashboardSectionWidth,
} from "@/lib/controls/dashboardPreview";
import { useSettingLabel } from "@/lib/i18n/useSettingLabel";

const panelFieldProps = {
  labelPosition: "left" as const,
  mode: "stacked" as const,
};

function settingFieldId(label: string) {
  return `opus-setting-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")}`;
}

type SettingInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "date" | "color" | "number";
  placeholder?: string;
  numberStep?: number;
};

export function SettingInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  numberStep = 1,
}: SettingInputProps) {
  const id = settingFieldId(label);
  const labelFor = useSettingLabel();
  const displayLabel = labelFor(label);
  const displayPlaceholder = placeholder ? labelFor(placeholder) : undefined;

  if (type === "number") {
    return (
      <NumberField
        {...panelFieldProps}
        id={id}
        label={displayLabel}
        step={numberStep}
        value={Number(value) || 0}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (type === "color") {
    return (
      <ColorField
        {...panelFieldProps}
        id={id}
        label={displayLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <TextField
      {...panelFieldProps}
      id={id}
      label={displayLabel}
      placeholder={displayPlaceholder}
      type={type === "email" || type === "password" ? type : "text"}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

type SettingTextareaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function SettingTextarea({ label, value, onChange }: SettingTextareaProps) {
  const id = settingFieldId(label);
  const labelFor = useSettingLabel();

  return (
    <TextAreaField
      {...panelFieldProps}
      id={id}
      label={labelFor(label)}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

type SettingSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
};

export function SettingSelect({ label, value, onChange, options }: SettingSelectProps) {
  const id = settingFieldId(label);
  const labelFor = useSettingLabel();
  const displayOptions = options.map((option) => ({ ...option, display: labelFor(option.label) }));
  const selectedLabel =
    displayOptions.find((option) => option.value === value)?.display ?? displayOptions[0]?.display ?? "";

  return (
    <SelectField
      {...panelFieldProps}
      id={id}
      label={labelFor(label)}
      options={displayOptions.map((option) => option.display)}
      value={selectedLabel}
      onChange={(event) => {
        const match = displayOptions.find((option) => option.display === event.target.value);
        onChange(match?.value ?? event.target.value);
      }}
    />
  );
}

export function SettingSegmented({
  label,
  value,
  onChange,
  options,
}: SettingSelectProps) {
  const labelFor = useSettingLabel();
  const displayOptions = options.map((option) => ({ ...option, display: labelFor(option.label) }));
  return (
    <SegmentedControlField
      {...panelFieldProps}
      id={settingFieldId(label)}
      label={labelFor(label)}
      options={displayOptions.map((option) => option.display)}
      value={displayOptions.find((option) => option.value === value)?.display ?? displayOptions[0]?.display ?? ""}
      onChange={(labelValue) => onChange(displayOptions.find((option) => option.display === labelValue)?.value ?? labelValue)}
    />
  );
}

type SettingToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function SettingToggle({ label, checked, onChange }: SettingToggleProps) {
  const id = settingFieldId(label);
  const labelFor = useSettingLabel();

  return (
    <SwitchField
      {...panelFieldProps}
      id={id}
      label={labelFor(label)}
      checked={Boolean(checked)}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}

export function DashboardPreviewLayoutSetting({
  value,
  onChange,
}: {
  value: DashboardPreviewLayout;
  onChange: (value: DashboardPreviewLayout) => void;
}) {
  const id = settingFieldId("Preview layout");
  const labelFor = useSettingLabel();
  const displayOptions = dashboardPreviewLayoutOptions.map((option) => ({ ...option, display: labelFor(option.label) }));

  return (
    <SelectField
      {...panelFieldProps}
      id={id}
      label={labelFor("Preview layout")}
      options={displayOptions.map((option) => option.display)}
      value={displayOptions.find((option) => option.value === value)?.display ?? labelFor("1 view")}
      onChange={(event) => {
        const match = displayOptions.find((option) => option.display === event.target.value);
        onChange((match?.value ?? "single") as DashboardPreviewLayout);
      }}
    />
  );
}

export function DashboardWidthSetting({
  value,
  onChange,
}: {
  value: DashboardSectionWidth;
  onChange: (value: DashboardSectionWidth) => void;
}) {
  const id = settingFieldId("Width");
  const labelFor = useSettingLabel();
  const displayOptions = dashboardWidthOptions.map((option) => ({ ...option, display: labelFor(option.label) }));

  return (
    <SelectField
      {...panelFieldProps}
      id={id}
      label={labelFor("Width")}
      options={displayOptions.map((option) => option.display)}
      value={displayOptions.find((option) => option.value === value)?.display ?? labelFor("Widget")}
      onChange={(event) => {
        const match = displayOptions.find((option) => option.display === event.target.value);
        onChange((match?.value ?? "widget") as DashboardSectionWidth);
      }}
    />
  );
}

export function DashboardHeightSetting({
  value,
  onChange,
}: {
  value: DashboardSectionHeight;
  onChange: (value: DashboardSectionHeight) => void;
}) {
  const id = settingFieldId("Height");
  const labelFor = useSettingLabel();
  const displayOptions = dashboardHeightOptions.map((option) => ({ ...option, display: labelFor(option.label) }));

  return (
    <SelectField
      {...panelFieldProps}
      id={id}
      label={labelFor("Height")}
      options={displayOptions.map((option) => option.display)}
      value={displayOptions.find((option) => option.value === value)?.display ?? labelFor("Auto")}
      onChange={(event) => {
        const match = displayOptions.find((option) => option.display === event.target.value);
        onChange((match?.value ?? "auto") as DashboardSectionHeight);
      }}
    />
  );
}
