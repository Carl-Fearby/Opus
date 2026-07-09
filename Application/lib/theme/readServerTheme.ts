import { cookies } from "next/headers";
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
