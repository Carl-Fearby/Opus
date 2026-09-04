"use client";

import { useMemo } from "react";
import { currencyOptions } from "../AdvancedFields";
import { FilterSelectField } from "../FilterSelectField";
import type { ControlRadius, FieldMode, InputControlSize, LabelPosition } from "../types";

export type CurrencySelectOption = { label: string; value: string };

export type CurrencySelectFieldProps = {
  error?: string;
  gradient?: boolean;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  name?: string;
  options?: CurrencySelectOption[];
  placeholder?: string;
  radius?: ControlRadius;
  required?: boolean;
  searchPlaceholder?: string;
  size?: InputControlSize;
  transparency?: import("../types").ControlTransparency;
  value: string;
  onChange: (currency: string) => void;
};

/** Searchable ISO 4217 currency selector with flag, currency, territory, and display sign. */
export function CurrencySelectField({
  error,
  gradient,
  help,
  id,
  label,
  labelPosition,
  mode,
  name,
  options = currencyOptions,
  placeholder = "Select currency…",
  radius,
  required,
  searchPlaceholder = "Search currencies, countries, codes, or symbols…",
  size,
  transparency,
  value,
  onChange,
}: CurrencySelectFieldProps) {
  const optionByLabel = useMemo(() => new Map(options.map((option) => [option.label, option.value])), [options]);
  const selected = options.find((option) => option.value === value);

  return (
    <>
      <input name={name ?? "value"} type="hidden" value={value} />
      <FilterSelectField
        error={error}
        gradient={gradient}
        groups={[{ label: "Currencies", options: options.map((option) => option.label) }]}
        help={help}
        id={id}
        label={label}
        labelPosition={labelPosition}
        mode={mode}
        placeholder={placeholder}
        radius={radius}
        required={required}
        searchPlaceholder={searchPlaceholder}
        selectionMode="single"
        size={size}
        transparency={transparency}
        value={selected ? [selected.label] : []}
        onChange={([selectedLabel]) => {
          const currency = selectedLabel ? optionByLabel.get(selectedLabel) : undefined;
          if (currency) onChange(currency);
        }}
      />
    </>
  );
}
