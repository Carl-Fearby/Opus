import { cookies } from "next/headers";
import {
  type AccentPreferenceState,
  ACCENT_COOKIE_KEY,
  ACCENT_PAIR_COOKIE_KEY,
  ACCENT_SECONDARY_COOKIE_KEY,
  parseAccentPreference,
} from "./accentThemeStorage";
import {
  PREVIEW_THEME_COOKIE_KEY,
  THEME_COOKIE_KEY,
  parseTheme,
  type Theme,
} from "./componentsThemeStorage";

export async function readServerTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  return parseTheme(cookieStore.get(THEME_COOKIE_KEY)?.value);
}

export async function readServerPreviewTheme(): Promise<Theme> {
  const cookieStore = await cookies();
  return parseTheme(cookieStore.get(PREVIEW_THEME_COOKIE_KEY)?.value);
}

export async function readServerAccent(): Promise<AccentPreferenceState> {
  const cookieStore = await cookies();
  const primary = cookieStore.get(ACCENT_COOKIE_KEY)?.value;
  const secondary = cookieStore.get(ACCENT_SECONDARY_COOKIE_KEY)?.value;
  const pairId = cookieStore.get(ACCENT_PAIR_COOKIE_KEY)?.value;

  return parseAccentPreference(
    primary ? decodeURIComponent(primary) : null,
    secondary ? decodeURIComponent(secondary) : null,
    pairId ? decodeURIComponent(pairId) : null,
  );
}
