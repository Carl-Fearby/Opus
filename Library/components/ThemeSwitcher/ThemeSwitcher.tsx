"use client";

import { ThemeToggleField } from "@/components/fields/ThemeToggleField";
import type { Theme } from "@/components/fields/types";

type ThemeSwitcherProps = {
  id?: string;
  label?: string;
  value: Theme;
  onChange: (theme: Theme) => void;
};

/** Compact docs-friendly theme switcher built on ThemeToggleField. */
export function ThemeSwitcher({
  id = "opus-theme-switcher",
  label = "Theme",
  value,
  onChange,
}: ThemeSwitcherProps) {
  return (
    <ThemeToggleField
      id={id}
      label={label}
      mode="flagged"
      value={value}
      onChange={onChange}
    />
  );
}
