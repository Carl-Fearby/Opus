"use client";

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { fontStack } from "opus-react";
import { createOpusThemeDefaultsStyle, OpusThemeProvider } from "@/components/OpusThemeProvider";
import type { Theme } from "opus-react";
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
    previewDefaults,
    previewFontFamily,
    previewPlatform,
  } = useComponentsTheme();
  const previewTheme = controlledTheme ?? contextTheme;

  return (
    <OpusThemeProvider applyToDocument={false} defaults={previewDefaults} theme={previewTheme}>
      <div
        {...rest}
        className={className}
        data-preview-platform={previewPlatform}
        data-preview-root
        data-theme={previewTheme}
        style={{
          ...opusThemeTokens(previewTheme),
          ...previewAccentStyle,
          ...createOpusThemeDefaultsStyle(previewDefaults),
          "--opus-font-family": fontStack(previewFontFamily),
          colorScheme: previewTheme,
          fontFamily: fontStack(previewFontFamily),
          visibility: previewAppearanceReady ? undefined : "hidden",
          ...style,
          width: previewPlatform === "mobile" ? "min(100%, 390px)" : style?.width,
          marginInline: previewPlatform === "mobile" ? "auto" : style?.marginInline,
        } as CSSProperties}
      >
        {children}
      </div>
    </OpusThemeProvider>
  );
}
