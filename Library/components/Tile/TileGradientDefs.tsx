"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_TILE_ACCENT,
  DEFAULT_TILE_ACCENT_SECONDARY,
  TILE_ACCENT_CHANGE_EVENT,
  isHexColor,
  readStoredTileAccentState,
  type TileAccentPreferenceState,
} from "@/lib/theme/accentThemeStorage";
import styles from "./TileGradientDefs.module.css";

function subscribeTileAccent(onStoreChange: () => void) {
  window.addEventListener(TILE_ACCENT_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(TILE_ACCENT_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

const serverTileAccentSnapshot: TileAccentPreferenceState = {
  tileAccent: DEFAULT_TILE_ACCENT,
  tileAccentSecondary: DEFAULT_TILE_ACCENT_SECONDARY,
};

let clientTileAccentSnapshot: TileAccentPreferenceState = serverTileAccentSnapshot;

function getTileAccentSnapshot() {
  const next = readStoredTileAccentState();
  if (
    clientTileAccentSnapshot.tileAccent === next.tileAccent &&
    clientTileAccentSnapshot.tileAccentSecondary === next.tileAccentSecondary
  ) {
    return clientTileAccentSnapshot;
  }

  clientTileAccentSnapshot = next;
  return clientTileAccentSnapshot;
}

function getServerTileAccentSnapshot() {
  return serverTileAccentSnapshot;
}

export function useTileAccentColors() {
  return useSyncExternalStore(subscribeTileAccent, getTileAccentSnapshot, getServerTileAccentSnapshot);
}

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

type TileGradientDefsProps = {
  /** Override tiles primary (purple-tone icons). */
  primary?: string;
  /** Override tiles secondary (blue-tone icons). */
  secondary?: string;
};

/**
 * Shared SVG paint servers for tile / stat-tile icons.
 * Uses literal hex stops (SVG cannot reliably resolve CSS `var()` / `color-mix`).
 * Purple-tone icons follow tiles primary only; blue-tone follows secondary only.
 */
export function TileGradientDefs({ primary, secondary }: TileGradientDefsProps = {}) {
  const stored = useTileAccentColors();
  const tilePrimary = isHexColor(primary) ? primary : stored.tileAccent;
  const tileSecondary = isHexColor(secondary) ? secondary : stored.tileAccentSecondary;
  const purpleTop = lighten(tilePrimary, 0.28);
  const blueTop = lighten(tileSecondary, 0.35);

  return (
    <svg
      aria-hidden="true"
      className={styles.defs}
      focusable="false"
      height="0"
      key={`${tilePrimary}-${tileSecondary}`}
      width="0"
    >
      <defs>
        <linearGradient id="opus-action-tile-purple" x1="0.5" x2="0.5" y1="0" y2="1">
          <stop offset="0%" stopColor={purpleTop} />
          <stop offset="48%" stopColor={purpleTop} />
          <stop offset="100%" stopColor={tilePrimary} />
        </linearGradient>
        <linearGradient id="opus-action-tile-blue" x1="0.5" x2="0.5" y1="0" y2="1">
          <stop offset="0%" stopColor={blueTop} />
          <stop offset="48%" stopColor={blueTop} />
          <stop offset="100%" stopColor={tileSecondary} />
        </linearGradient>
      </defs>
    </svg>
  );
}
