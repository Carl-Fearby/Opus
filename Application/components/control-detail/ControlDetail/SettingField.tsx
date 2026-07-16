"use client";

import {
  ColorField,
  NumberField,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
} from "opus-react";
import {
  dashboardHeightOptions,
  dashboardPreviewLayoutOptions,
  dashboardWidthOptions,
  type DashboardSectionHeight,
  type DashboardPreviewLayout,
  type DashboardSectionWidth,
} from "@/lib/controls/dashboardPreview";

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

  if (type === "number") {
    return (
      <NumberField
        {...panelFieldProps}
        id={id}
        label={label}
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
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <TextField
      {...panelFieldProps}
      id={id}
      label={label}
      placeholder={placeholder}
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

  return (
    <TextAreaField
      {...panelFieldProps}
      id={id}
      label={label}
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
  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0]?.label ?? "";

  return (
    <SelectField
      {...panelFieldProps}
      id={id}
      label={label}
      options={options.map((option) => option.label)}
      value={selectedLabel}
      onChange={(event) => {
        const match = options.find((option) => option.label === event.target.value);
        onChange(match?.value ?? event.target.value);
      }}
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

  return (
    <SwitchField
      {...panelFieldProps}
      id={id}
      label={label}
      checked={checked}
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

  return (
    <SelectField
      {...panelFieldProps}
      id={id}
      label="Preview layout"
      options={dashboardPreviewLayoutOptions.map((option) => option.label)}
      value={dashboardPreviewLayoutOptions.find((option) => option.value === value)?.label ?? "1 view"}
      onChange={(event) => {
        const match = dashboardPreviewLayoutOptions.find((option) => option.label === event.target.value);
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

  return (
    <SelectField
      {...panelFieldProps}
      id={id}
      label="Width"
      options={dashboardWidthOptions.map((option) => option.label)}
      value={dashboardWidthOptions.find((option) => option.value === value)?.label ?? "Widget"}
      onChange={(event) => {
        const match = dashboardWidthOptions.find((option) => option.label === event.target.value);
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

  return (
    <SelectField
      {...panelFieldProps}
      id={id}
      label="Height"
      options={dashboardHeightOptions.map((option) => option.label)}
      value={dashboardHeightOptions.find((option) => option.value === value)?.label ?? "Auto"}
      onChange={(event) => {
        const match = dashboardHeightOptions.find((option) => option.label === event.target.value);
        onChange((match?.value ?? "auto") as DashboardSectionHeight);
      }}
    />
  );
}
