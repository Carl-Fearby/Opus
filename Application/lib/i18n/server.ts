import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale } from "./index";

export async function readServerLocale() {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}
