"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { OpusThemeProvider } from "@/components/OpusThemeProvider";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { opusThemeTokens } from "@/lib/theme/opusThemeTokens";

type PreviewThemeBoundaryProps = ComponentPropsWithoutRef<"div"> & {
  children: ReactNode;
};

export function PreviewThemeBoundary({ children, className, style, ...rest }: PreviewThemeBoundaryProps) {
  const { previewTheme } = useComponentsTheme();

  return (
    <OpusThemeProvider applyToDocument={false} key={previewTheme} theme={previewTheme}>
      <div
        {...rest}
        className={className}
        data-preview-root
        data-theme={previewTheme}
        style={{ ...opusThemeTokens(previewTheme), colorScheme: previewTheme, ...style }}
      >
        {children}
      </div>
    </OpusThemeProvider>
  );
}
