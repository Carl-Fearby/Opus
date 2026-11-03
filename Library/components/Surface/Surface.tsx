import type { CSSProperties, ReactNode } from "react";
import type { SurfaceTone } from "@/components/fields/types";
import styles from "./Surface.module.css";

export type SurfaceElement = "div" | "section" | "article" | "aside";
export type SurfaceBorder = "none" | "subtle" | "default" | "strong" | "accent";
export type SurfaceRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";
export type SurfacePadding = "none" | "snug" | "compact" | "comfortable" | "relaxed";
export type SurfaceBackground = "none" | "panel" | "surface" | "muted" | "accent";
export type SurfaceShadow = "none" | "sm" | "md" | "lg";
export type SurfaceOverflow = "visible" | "hidden" | "auto";

export type SurfaceProps = {
  /** The element to render. Defaults to `div`. */
  as?: SurfaceElement;
  background?: SurfaceBackground;
  /** Border weight. `true` is the standard rule colour, `false` draws no border. */
  border?: boolean | SurfaceBorder;
  /** 0–100: how much of `tone` to mix into the border colour. */
  borderAlpha?: number;
  children: ReactNode;
  className?: string;
  overflow?: SurfaceOverflow;
  /** Spacing preset, or an explicit CSS length such as `20` or `"1.25rem"`. */
  padding?: SurfacePadding | number | string;
  radius?: SurfaceRadius;
  shadow?: SurfaceShadow;
  style?: CSSProperties;
  /** Tints the border when `borderAlpha` is set and the background when it is `accent`. */
  tone?: SurfaceTone;
};

const paddingPresets = new Set<string>(["none", "snug", "compact", "comfortable", "relaxed"]);

export function Surface({
  as: Element = "div",
  background = "none",
  border = false,
  borderAlpha,
  children,
  className,
  overflow = "visible",
  padding = "none",
  radius = "none",
  shadow = "none",
  style,
  tone = "default",
}: SurfaceProps) {
  const resolvedBorder = border === true ? "default" : border === false ? "none" : border;
  const spacing = typeof padding === "number" ? `${padding}px` : padding;
  const presetPadding = paddingPresets.has(spacing);
  const surfaceStyle = { ...style } as CSSProperties & { "--surface-border-alpha"?: string };

  if (!presetPadding && spacing) {
    surfaceStyle.padding = spacing;
  }
  if (borderAlpha !== undefined) {
    surfaceStyle["--surface-border-alpha"] = `${Math.min(Math.max(borderAlpha, 0), 100)}%`;
  }

  return (
    <Element
      className={[styles.surface, className].filter(Boolean).join(" ")}
      data-background={background}
      data-border={resolvedBorder}
      data-overflow={overflow}
      data-padding={presetPadding ? spacing : undefined}
      data-radius={radius}
      data-shadow={shadow}
      data-tint={borderAlpha === undefined ? undefined : true}
      data-tone={tone}
      style={surfaceStyle}
    >
      {children}
    </Element>
  );
}
