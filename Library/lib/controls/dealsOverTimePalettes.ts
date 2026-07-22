import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_ACCENT_SECONDARY,
  isHexColor,
} from "@/lib/theme/accentThemeStorage";

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

export type DealsOverTimeAccentColors = {
  primary: string;
  secondary: string;
};

function mixHex(primary: string, secondary: string, primaryWeight = 0.55) {
  const parse = (value: string) => {
    const hex = value.replace("#", "");
    return [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
  };

  try {
    const [r1, g1, b1] = parse(primary);
    const [r2, g2, b2] = parse(secondary);
    const w = primaryWeight;
    const channel = (a: number, b: number) => Math.round(a * w + b * (1 - w));
    return `#${[channel(r1, r2), channel(g1, g2), channel(b1, b2)]
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")}`;
  } catch {
    return primary;
  }
}

function lighten(hex: string, amount: number) {
  return mixHex(hex, "#ffffff", 1 - amount);
}

/** Build neon line / area tokens from a single base accent hex. */
export function buildDealsOverTimePalette(base: string): DealsOverTimePaletteTokens {
  const accent = isHexColor(base) ? base : DEFAULT_ACCENT_COLOR;
  const soft = lighten(accent, 0.18);
  const mid = lighten(accent, 0.32);
  const core = lighten(accent, 0.48);
  const bright = lighten(accent, 0.72);
  const active = lighten(accent, 0.86);

  return {
    areaTop: soft,
    areaMid: accent,
    lineCore: core,
    lineFadeEnd: mid,
    lineFadeStart: soft,
    lineMid: mid,
    lineSoft: soft,
    pointCore: core,
    pointCoreActive: active,
    pointGlow: mid,
    pointGlowActive: bright,
    pointRing: mid,
    pointRingActive: bright,
    tooltipAccent: mid,
  };
}

/** Static fallbacks (default Base UI accents) for SSR / non-reactive callers. */
export const dealsOverTimePalettes: Record<DealsOverTimePalette, DealsOverTimePaletteTokens> = {
  purple: buildDealsOverTimePalette(DEFAULT_ACCENT_COLOR),
  blue: buildDealsOverTimePalette(DEFAULT_ACCENT_SECONDARY),
};

/**
 * Resolve chart colours from live Base UI accents.
 * `purple` → primary accent, `blue` → secondary accent.
 */
export function getDealsOverTimePalette(
  palette: string | undefined,
  accents?: DealsOverTimeAccentColors,
): DealsOverTimePaletteTokens {
  const primary = isHexColor(accents?.primary) ? accents.primary : DEFAULT_ACCENT_COLOR;
  const secondary = isHexColor(accents?.secondary) ? accents.secondary : DEFAULT_ACCENT_SECONDARY;
  return buildDealsOverTimePalette(palette === "blue" ? secondary : primary);
}
