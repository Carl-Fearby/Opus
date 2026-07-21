"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import type { Theme } from "@/components/fields/types";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { opusThemeTokens } from "@/lib/theme/opusThemeTokens";

type PreviewThemeBoundaryProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
  theme?: Theme;
};

export function PreviewThemeBoundary({
  children,
  className,
  style,
  theme: controlledTheme,
  ...rest
}: PreviewThemeBoundaryProps) {
  const { previewTheme: contextTheme, tileAccentStyle } = useComponentsTheme();
  const previewTheme = controlledTheme ?? contextTheme;

  return (
    <OpusThemeProvider applyToDocument={false} key={previewTheme} theme={previewTheme}>
      <div
        {...rest}
        className={className}
        data-preview-root
        data-theme={previewTheme}
        style={{
          ...opusThemeTokens(previewTheme),
          ...tileAccentStyle,
          colorScheme: previewTheme,
          ...style,
        }}
      >
        {children}
      </div>
    </OpusThemeProvider>
  );
}
