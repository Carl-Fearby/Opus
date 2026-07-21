"use client";

import { useSyncExternalStore } from "react";
import {
  DEFAULT_TILE_ACCENT,
  DEFAULT_TILE_ACCENT_SECONDARY,
  TILE_ACCENT_CHANGE_EVENT,
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

type TileGradientDefsProps = {
  primary?: string;
  secondary?: string;
};

export function TileGradientDefs({ primary, secondary }: TileGradientDefsProps = {}) {
  const stored = useTileAccentColors();
  const tilePrimary = primary ?? stored.tileAccent;
  const tileSecondary = secondary ?? stored.tileAccentSecondary;
  const purpleMid = mixHex(tilePrimary, tileSecondary, 0.55);
  const blueMid = mixHex(tileSecondary, "#ffffff", 0.7);

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
          <stop offset="0%" stopColor={purpleMid} />
          <stop offset="48%" stopColor={purpleMid} />
          <stop offset="100%" stopColor={tilePrimary} />
        </linearGradient>
        <linearGradient id="opus-action-tile-blue" x1="0.5" x2="0.5" y1="0" y2="1">
          <stop offset="0%" stopColor={blueMid} />
          <stop offset="48%" stopColor={blueMid} />
          <stop offset="100%" stopColor={tileSecondary} />
        </linearGradient>
      </defs>
    </svg>
  );
}
