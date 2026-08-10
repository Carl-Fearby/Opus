"use client";

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { fontStack } from "@/components/FontPicker";
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
  const {
    previewAppearanceReady,
    previewTheme: contextTheme,
    previewAccentStyle,
    previewFontFamily,
  } = useComponentsTheme();
  const previewTheme = controlledTheme ?? contextTheme;

  return (
    <OpusThemeProvider applyToDocument={false} theme={previewTheme}>
      <div
        {...rest}
        className={className}
        data-preview-root
        data-theme={previewTheme}
        style={{
          ...opusThemeTokens(previewTheme),
          ...previewAccentStyle,
          "--opus-font-family": fontStack(previewFontFamily),
          colorScheme: previewTheme,
          fontFamily: fontStack(previewFontFamily),
          visibility: previewAppearanceReady ? undefined : "hidden",
          ...style,
        } as CSSProperties}
      >
        {children}
      </div>
    </OpusThemeProvider>
  );
}
