import { DEFAULT_LOCALE, type Locale } from "./config";
import { componentMessages } from "./componentMessages";
import type { LocaleResources } from "./resources";

/**
 * Server-side resources come from the bundled dictionaries, not the public JSON.
 * Serverless hosts do not ship `public/` into the server function's filesystem,
 * so reading it there failed silently and every component rendered in English
 * until the visitor switched language and the client fetched the JSON.
 */
export function readLocaleResources(locale: Locale): LocaleResources {
  const dictionary = componentMessages[locale] ?? componentMessages[DEFAULT_LOCALE];
  return { component: { ...dictionary } };
}
