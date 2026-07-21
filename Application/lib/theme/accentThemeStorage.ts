import type { CSSProperties } from "react";

export const ACCENT_STORAGE_KEY = "opus-components-accent";
export const ACCENT_SECONDARY_STORAGE_KEY = "opus-components-accent-secondary";
export const ACCENT_PAIR_STORAGE_KEY = "opus-components-accent-pair";
export const TILE_ACCENT_STORAGE_KEY = "opus-components-tile-accent";
export const TILE_ACCENT_SECONDARY_STORAGE_KEY = "opus-components-tile-accent-secondary";
export const ACCENT_COOKIE_KEY = ACCENT_STORAGE_KEY;
export const ACCENT_SECONDARY_COOKIE_KEY = ACCENT_SECONDARY_STORAGE_KEY;
export const ACCENT_PAIR_COOKIE_KEY = ACCENT_PAIR_STORAGE_KEY;
export const TILE_ACCENT_COOKIE_KEY = TILE_ACCENT_STORAGE_KEY;
export const TILE_ACCENT_SECONDARY_COOKIE_KEY = TILE_ACCENT_SECONDARY_STORAGE_KEY;
export const ACCENT_CHANGE_EVENT = "opus-accent-change";
export const TILE_ACCENT_CHANGE_EVENT = "opus-tile-accent-change";

export const DEFAULT_ACCENT_COLOR = "#8f6cff";
export const DEFAULT_ACCENT_SECONDARY = "#0284c7";
export const DEFAULT_ACCENT_PAIR_ID = "violet-cyan";
/** Purple-tone tile icon / glow (matches TileGradientDefs pink end). */
export const DEFAULT_TILE_ACCENT = "#ec4899";
/** Blue-tone tile icon / glow (matches TileGradientDefs turquoise end). */
export const DEFAULT_TILE_ACCENT_SECONDARY = "#0ea5e9";

/** Curated pairs mirrored in the beforeInteractive bootstrap script. */
export const accentBootstrapPairs: Record<string, { primary: string; secondary: string }> = {
  "violet-cyan": { primary: "#8f6cff", secondary: "#0284c7" },
  "pink-turquoise": { primary: "#ec4899", secondary: "#0ea5e9" },
  "turquoise-pink": { primary: "#0ea5e9", secondary: "#ec4899" },
  "blue-sky": { primary: "#3b82f6", secondary: "#38bdf8" },
  "cyan-indigo": { primary: "#06b6d4", secondary: "#6366f1" },
  "green-teal": { primary: "#22c55e", secondary: "#14b8a6" },
  "amber-orange": { primary: "#f59e0b", secondary: "#f97316" },
  "rose-fuchsia": { primary: "#f43f5e", secondary: "#e879f9" },
};

export type AccentPreferenceState = {
  accent: string;
  accentPairId: string;
  accentSecondary: string;
};

export type TileAccentPreferenceState = {
  tileAccent: string;
  tileAccentSecondary: string;
};

declare global {
  interface Window {
    __OPUS_ACCENT__?: AccentPreferenceState;
    __OPUS_TILE_ACCENT__?: TileAccentPreferenceState;
  }
}

export function isHexColor(value: string | null | undefined): value is string {
  return Boolean(value && /^#[0-9a-fA-F]{6}$/.test(value));
}

export function parseAccentPreference(
  primary: string | null | undefined,
  secondary: string | null | undefined,
  pairId: string | null | undefined,
): AccentPreferenceState {
  const pair = pairId ? accentBootstrapPairs[pairId] : undefined;
  if (pair) {
    return {
      accent: pair.primary,
      accentSecondary: pair.secondary,
      accentPairId: pairId!,
    };
  }

  const accent = isHexColor(primary) ? primary : DEFAULT_ACCENT_COLOR;
  const matchedEntry = Object.entries(accentBootstrapPairs).find(([, value]) => value.primary === accent);
  const accentSecondary = isHexColor(secondary)
    ? secondary
    : matchedEntry?.[1].secondary ?? DEFAULT_ACCENT_SECONDARY;
  const matchedPairId =
    Object.entries(accentBootstrapPairs).find(
      ([, value]) => value.primary === accent && value.secondary === accentSecondary,
    )?.[0] ?? DEFAULT_ACCENT_PAIR_ID;

  return {
    accent,
    accentSecondary,
    accentPairId: matchedPairId,
  };
}

export function createAccentStyle(
  accent: string,
  secondary: string = DEFAULT_ACCENT_SECONDARY,
): CSSProperties {
  return {
    "--opus-user-accent": accent,
    "--opus-user-accent-soft": `color-mix(in srgb, ${accent} 16%, transparent)`,
    "--opus-user-accent-secondary": secondary,
    "--opus-user-accent-secondary-soft": `color-mix(in srgb, ${secondary} 16%, transparent)`,
    "--opus-accent": accent,
    "--opus-accent-soft": `color-mix(in srgb, ${accent} 16%, transparent)`,
    "--opus-accent-secondary": secondary,
    "--opus-accent-secondary-soft": `color-mix(in srgb, ${secondary} 16%, transparent)`,
    "--opus-accent-contrast": "#ffffff",
  } as CSSProperties;
}

function buildAccentCookie(key: string, value: string) {
  return `${key}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`;
}

export function createTileAccentStyle(
  tileAccent: string,
  tileAccentSecondary: string = DEFAULT_TILE_ACCENT_SECONDARY,
): CSSProperties {
  return {
    "--opus-tile-accent": tileAccent,
    "--opus-tile-accent-mid": `color-mix(in srgb, ${tileAccent} 55%, ${tileAccentSecondary} 45%)`,
    "--opus-tile-accent-soft": `color-mix(in srgb, ${tileAccent} 16%, transparent)`,
    "--opus-tile-accent-secondary": tileAccentSecondary,
    "--opus-tile-accent-secondary-mid": `color-mix(in srgb, ${tileAccentSecondary} 70%, white 30%)`,
    "--opus-tile-accent-secondary-soft": `color-mix(in srgb, ${tileAccentSecondary} 16%, transparent)`,
  } as CSSProperties;
}

export function applyDocumentAccent(accent: string, secondary: string) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.style.setProperty("--opus-user-accent", accent);
  root.style.setProperty("--opus-user-accent-soft", `color-mix(in srgb, ${accent} 16%, transparent)`);
  root.style.setProperty("--opus-user-accent-secondary", secondary);
  root.style.setProperty(
    "--opus-user-accent-secondary-soft",
    `color-mix(in srgb, ${secondary} 16%, transparent)`,
  );
  root.style.setProperty("--opus-accent", accent);
  root.style.setProperty("--opus-accent-soft", `color-mix(in srgb, ${accent} 16%, transparent)`);
  root.style.setProperty("--opus-accent-secondary", secondary);
  root.style.setProperty(
    "--opus-accent-secondary-soft",
    `color-mix(in srgb, ${secondary} 16%, transparent)`,
  );
}

export function applyDocumentTileAccent(tileAccent: string, tileAccentSecondary: string) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const style = createTileAccentStyle(tileAccent, tileAccentSecondary);
  for (const [key, value] of Object.entries(style)) {
    root.style.setProperty(key, String(value));
  }
}

export function readStoredAccentState(): AccentPreferenceState {
  if (typeof window === "undefined") {
    return {
      accent: DEFAULT_ACCENT_COLOR,
      accentSecondary: DEFAULT_ACCENT_SECONDARY,
      accentPairId: DEFAULT_ACCENT_PAIR_ID,
    };
  }

  if (window.__OPUS_ACCENT__) {
    return window.__OPUS_ACCENT__;
  }

  try {
    return parseAccentPreference(
      window.localStorage.getItem(ACCENT_STORAGE_KEY),
      window.localStorage.getItem(ACCENT_SECONDARY_STORAGE_KEY),
      window.localStorage.getItem(ACCENT_PAIR_STORAGE_KEY),
    );
  } catch {
    return {
      accent: DEFAULT_ACCENT_COLOR,
      accentSecondary: DEFAULT_ACCENT_SECONDARY,
      accentPairId: DEFAULT_ACCENT_PAIR_ID,
    };
  }
}

export function persistAccentState(primary: string, secondary: string, pairId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCENT_STORAGE_KEY, primary);
  window.localStorage.setItem(ACCENT_SECONDARY_STORAGE_KEY, secondary);
  if (pairId) {
    window.localStorage.setItem(ACCENT_PAIR_STORAGE_KEY, pairId);
  } else {
    window.localStorage.removeItem(ACCENT_PAIR_STORAGE_KEY);
  }

  if (typeof document !== "undefined") {
    document.cookie = buildAccentCookie(ACCENT_COOKIE_KEY, primary);
    document.cookie = buildAccentCookie(ACCENT_SECONDARY_COOKIE_KEY, secondary);
    if (pairId) {
      document.cookie = buildAccentCookie(ACCENT_PAIR_COOKIE_KEY, pairId);
    } else {
      document.cookie = `${ACCENT_PAIR_COOKIE_KEY}=;path=/;max-age=0;SameSite=Lax`;
    }
  }

  const next = parseAccentPreference(primary, secondary, pairId);
  window.__OPUS_ACCENT__ = next;
  window.dispatchEvent(new Event(ACCENT_CHANGE_EVENT));
}

export function parseTileAccentPreference(
  primary: string | null | undefined,
  secondary: string | null | undefined,
): TileAccentPreferenceState {
  return {
    tileAccent: isHexColor(primary) ? primary : DEFAULT_TILE_ACCENT,
    tileAccentSecondary: isHexColor(secondary) ? secondary : DEFAULT_TILE_ACCENT_SECONDARY,
  };
}

export function readStoredTileAccentState(): TileAccentPreferenceState {
  if (typeof window === "undefined") {
    return {
      tileAccent: DEFAULT_TILE_ACCENT,
      tileAccentSecondary: DEFAULT_TILE_ACCENT_SECONDARY,
    };
  }

  if (window.__OPUS_TILE_ACCENT__) {
    return window.__OPUS_TILE_ACCENT__;
  }

  try {
    return parseTileAccentPreference(
      window.localStorage.getItem(TILE_ACCENT_STORAGE_KEY),
      window.localStorage.getItem(TILE_ACCENT_SECONDARY_STORAGE_KEY),
    );
  } catch {
    return {
      tileAccent: DEFAULT_TILE_ACCENT,
      tileAccentSecondary: DEFAULT_TILE_ACCENT_SECONDARY,
    };
  }
}

export function persistTileAccentState(primary: string, secondary: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TILE_ACCENT_STORAGE_KEY, primary);
  window.localStorage.setItem(TILE_ACCENT_SECONDARY_STORAGE_KEY, secondary);

  if (typeof document !== "undefined") {
    document.cookie = buildAccentCookie(TILE_ACCENT_COOKIE_KEY, primary);
    document.cookie = buildAccentCookie(TILE_ACCENT_SECONDARY_COOKIE_KEY, secondary);
  }

  const next = parseTileAccentPreference(primary, secondary);
  window.__OPUS_TILE_ACCENT__ = next;
  window.dispatchEvent(new Event(TILE_ACCENT_CHANGE_EVENT));
}

export const COMPONENTS_TILE_ACCENT_BOOTSTRAP_SCRIPT = `(function(){try{var tak="${TILE_ACCENT_STORAGE_KEY}";var task="${TILE_ACCENT_SECONDARY_STORAGE_KEY}";var r=document.documentElement;var primary=localStorage.getItem(tak);var secondary=localStorage.getItem(task);var hex=/^#[0-9a-fA-F]{6}$/;if(!hex.test(primary||"")){primary="${DEFAULT_TILE_ACCENT}";}if(!hex.test(secondary||"")){secondary="${DEFAULT_TILE_ACCENT_SECONDARY}";}var mid="color-mix(in srgb, "+primary+" 55%, "+secondary+" 45%)";var smid="color-mix(in srgb, "+secondary+" 70%, white 30%)";r.style.setProperty("--opus-tile-accent",primary);r.style.setProperty("--opus-tile-accent-mid",mid);r.style.setProperty("--opus-tile-accent-soft","color-mix(in srgb, "+primary+" 16%, transparent)");r.style.setProperty("--opus-tile-accent-secondary",secondary);r.style.setProperty("--opus-tile-accent-secondary-mid",smid);r.style.setProperty("--opus-tile-accent-secondary-soft","color-mix(in srgb, "+secondary+" 16%, transparent)");window.__OPUS_TILE_ACCENT__={tileAccent:primary,tileAccentSecondary:secondary};document.cookie=tak+"="+encodeURIComponent(primary)+";path=/;max-age=31536000;SameSite=Lax";document.cookie=task+"="+encodeURIComponent(secondary)+";path=/;max-age=31536000;SameSite=Lax";}catch(e){}})();`;

export const COMPONENTS_ACCENT_BOOTSTRAP_SCRIPT = `(function(){try{var ak="${ACCENT_STORAGE_KEY}";var ask="${ACCENT_SECONDARY_STORAGE_KEY}";var apk="${ACCENT_PAIR_STORAGE_KEY}";var pairs=${JSON.stringify(
  Object.fromEntries(
    Object.entries(accentBootstrapPairs).map(([id, value]) => [id, [value.primary, value.secondary]]),
  ),
)};var r=document.documentElement;var pairId=localStorage.getItem(apk);var primary;var secondary;if(pairId&&pairs[pairId]){primary=pairs[pairId][0];secondary=pairs[pairId][1];}else{primary=localStorage.getItem(ak);secondary=localStorage.getItem(ask);var hex=/^#[0-9a-fA-F]{6}$/;if(!hex.test(primary||"")){primary="${DEFAULT_ACCENT_COLOR}";}if(!hex.test(secondary||"")){secondary=null;for(var id in pairs){if(pairs[id][0]===primary){secondary=pairs[id][1];break;}}if(!secondary){secondary="${DEFAULT_ACCENT_SECONDARY}";}}if(!pairId){for(var pid in pairs){if(pairs[pid][0]===primary&&pairs[pid][1]===secondary){pairId=pid;break;}}}}r.style.setProperty("--opus-user-accent",primary);r.style.setProperty("--opus-user-accent-soft","color-mix(in srgb, "+primary+" 16%, transparent)");r.style.setProperty("--opus-user-accent-secondary",secondary);r.style.setProperty("--opus-user-accent-secondary-soft","color-mix(in srgb, "+secondary+" 16%, transparent)");r.style.setProperty("--opus-accent",primary);r.style.setProperty("--opus-accent-soft","color-mix(in srgb, "+primary+" 16%, transparent)");r.style.setProperty("--opus-accent-secondary",secondary);r.style.setProperty("--opus-accent-secondary-soft","color-mix(in srgb, "+secondary+" 16%, transparent)");window.__OPUS_ACCENT__={accent:primary,accentSecondary:secondary,accentPairId:pairId||"${DEFAULT_ACCENT_PAIR_ID}"};document.cookie=ak+"="+encodeURIComponent(primary)+";path=/;max-age=31536000;SameSite=Lax";document.cookie=ask+"="+encodeURIComponent(secondary)+";path=/;max-age=31536000;SameSite=Lax";if(pairId){document.cookie=apk+"="+encodeURIComponent(pairId)+";path=/;max-age=31536000;SameSite=Lax";}}catch(e){}})();${COMPONENTS_TILE_ACCENT_BOOTSTRAP_SCRIPT}`;
