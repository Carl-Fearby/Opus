export type DealsOverTimePalette = "blue" | "purple";

export type DealsOverTimePaletteTokens = {
  areaMid: string;
  areaTop: string;
  lineCore: string;
  lineFadeEnd: string;
  lineFadeStart: string;
  lineMid: string;
  lineSoft: string;
  pointCore: string;
  pointCoreActive: string;
  pointGlow: string;
  pointGlowActive: string;
  pointRing: string;
  pointRingActive: string;
  tooltipAccent: string;
};

export const dealsOverTimePalettes: Record<DealsOverTimePalette, DealsOverTimePaletteTokens> = {
  purple: {
    areaTop: "#7c5cff",
    areaMid: "#6d4cff",
    lineCore: "#c4b5fd",
    lineFadeEnd: "#9b8cff",
    lineFadeStart: "#8f7dff",
    lineMid: "#b4a5ff",
    lineSoft: "#a78bfa",
    pointCore: "#c4b5fd",
    pointCoreActive: "#ede9fe",
    pointGlow: "#b4a5ff",
    pointGlowActive: "#ddd6fe",
    pointRing: "#b6a8ff",
    pointRingActive: "#ddd6fe",
    tooltipAccent: "#9b8cff",
  },
  blue: {
    areaTop: "#3b82f6",
    areaMid: "#2563eb",
    lineCore: "#bfdbfe",
    lineFadeEnd: "#93c5fd",
    lineFadeStart: "#60a5fa",
    lineMid: "#93c5fd",
    lineSoft: "#60a5fa",
    pointCore: "#bfdbfe",
    pointCoreActive: "#eff6ff",
    pointGlow: "#93c5fd",
    pointGlowActive: "#dbeafe",
    pointRing: "#93c5fd",
    pointRingActive: "#dbeafe",
    tooltipAccent: "#60a5fa",
  },
};

export function getDealsOverTimePalette(palette: string | undefined): DealsOverTimePaletteTokens {
  return dealsOverTimePalettes[palette === "blue" ? "blue" : "purple"];
}
