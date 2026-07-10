import type { GaugeFooterItem } from "opus-react";
import type { ChartPalette } from "opus-react";
import type { GaugeTrackTone, GaugeValueTone } from "./types";

export const gaugePreviewValue = 75.55;

export const gaugePaletteOptions = ["opus", "cool", "warm", "mono"] as const satisfies readonly ChartPalette[];
export const gaugeTrackToneOptions = ["neutral", "soft", "contrast", "palette"] as const satisfies readonly GaugeTrackTone[];
export const gaugeValueToneOptions = ["palette", "accent", "red", "orange", "blue", "green"] as const satisfies readonly GaugeValueTone[];

export const gaugePreviewPalettes: Record<ChartPalette, string[]> = {
  opus: [
    "var(--opus-accent)",
    "color-mix(in srgb, var(--opus-accent) 72%, white)",
    "color-mix(in srgb, var(--opus-accent) 54%, white)",
    "color-mix(in srgb, var(--opus-accent) 38%, white)",
    "color-mix(in srgb, var(--opus-accent) 24%, white)",
  ],
  cool: ["#2f80ed", "#18b7c9", "#6d5dfc", "#22c55e", "#7dd3fc"],
  warm: ["#f04b2f", "#f97316", "#f6b24a", "#ef4444", "#fb7185"],
  mono: ["#111827", "#4b5563", "#9ca3af", "#d1d5db", "#f3f4f6"],
};

export const gaugePreviewTrackColors: Record<GaugeTrackTone, string> = {
  neutral: "#cfd7d1",
  soft: "#e2e8f0",
  contrast: "#596579",
  palette: gaugePreviewPalettes.opus[1],
};

export const gaugePreviewValueColors: Record<Exclude<GaugeValueTone, "palette">, string> = {
  accent: "var(--opus-accent)",
  red: "#f04b2f",
  orange: "#f6b24a",
  blue: "#2f80ed",
  green: "#22c55e",
};

export function getGaugePaletteColors(palette: ChartPalette): string[] {
  return gaugePreviewPalettes[palette] ?? gaugePreviewPalettes.opus;
}

export function getGaugeTrackColor(trackTone: GaugeTrackTone, palette: ChartPalette): string {
  if (trackTone === "palette") {
    return getGaugePaletteColors(palette)[1];
  }

  return gaugePreviewTrackColors[trackTone] ?? gaugePreviewTrackColors.neutral;
}

export function getGaugeValueColor(valueTone: GaugeValueTone, palette: ChartPalette): string {
  if (valueTone === "palette") {
    return getGaugePaletteColors(palette)[0];
  }

  return gaugePreviewValueColors[valueTone] ?? gaugePreviewValueColors.accent;
}

export function getGaugeFooter(palette: ChartPalette): GaugeFooterItem[] {
  const colors = getGaugePaletteColors(palette);

  return [
    { color: colors[3], label: "Target", value: "$20K", trend: "down" },
    { color: colors[0], label: "Revenue", value: "$16K", trend: "up" },
    { color: colors[1], label: "Today", value: "$1.5K", trend: "up" },
    { color: colors[2], label: "Week", value: "$8.2K", trend: "up" },
    { color: colors[4], label: "Month", value: "$31K", trend: "down" },
  ];
}

export const gaugePreviewFooter: GaugeFooterItem[] = getGaugeFooter("opus");
export const gaugePreviewTrackColor = getGaugeTrackColor("neutral", "opus");
export const gaugePreviewValueColor = getGaugeValueColor("palette", "opus");
