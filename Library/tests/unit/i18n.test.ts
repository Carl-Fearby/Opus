import { describe, expect, it } from "vitest";
import {
  languageLabel,
  localeHtmlLang,
  locales,
  parseLocale,
  sortedLocales,
  translate,
  type MessageKey,
} from "../../lib/i18n";
import { componentMessages } from "../../lib/i18n/componentMessages";
import { componentUiMessagesEn } from "../../lib/i18n/componentUiMessages.en";

describe("i18n", () => {
  it("parses supported locales and falls back safely", () => {
    expect(parseLocale("fr")).toBe("fr");
    expect(parseLocale("cs")).toBe("cs");
    expect(parseLocale("sk")).toBe("sk");
    expect(parseLocale("de")).toBe("de");
    expect(parseLocale("ja")).toBe("ja");
    expect(parseLocale("he")).toBe("he");
    expect(parseLocale("xx")).toBe("en");
    expect(parseLocale(undefined)).toBe("en");
  });

  it("maps locales to HTML language tags", () => {
    expect(localeHtmlLang("en")).toBe("en-GB");
    expect(localeHtmlLang("fr")).toBe("fr-FR");
    expect(localeHtmlLang("cs")).toBe("cs-CZ");
    expect(localeHtmlLang("sk")).toBe("sk-SK");
    expect(localeHtmlLang("ja")).toBe("ja-JP");
    expect(localeHtmlLang("he")).toBe("he-IL");
  });

  it("shows language names in the active language", () => {
    expect(languageLabel("en", "fr")).toBe("French");
    expect(languageLabel("fr", "en")).toBe("Anglais");
    expect(languageLabel("es", "fr")).toBe("Francés");
  });

  it("orders language choices alphabetically in the active language", () => {
    const names = sortedLocales("en").map((locale) => languageLabel("en", locale.id));
    expect(names).toEqual([...names].sort((left, right) => left.localeCompare(right)));
  });

  it("keeps site chrome English for every language", () => {
    const key = "docs.nav.components" as MessageKey;
    expect(translate("en", key)).toBe("Components");
    expect(translate("fr", key)).toBe("Components");
    expect(translate("cs", key)).toBe("Components");
    expect(translate("sk", key)).toBe("Components");
  });

  it("provides every shared component UI message in every locale", () => {
    const expected = Object.keys(componentUiMessagesEn);
    const placeholders = (value: string) =>
      [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

    for (const locale of locales) {
      const dictionary = componentMessages[locale.id];
      expect(dictionary, `${locale.id} component dictionary`).toBeDefined();

      for (const key of expected) {
        const translated = dictionary?.[key];
        expect(translated, `${locale.id}:${key}`).toBeTruthy();
        expect(placeholders(translated ?? ""), `${locale.id}:${key}`).toEqual(
          placeholders(componentUiMessagesEn[key]),
        );
      }
    }
  });
});
