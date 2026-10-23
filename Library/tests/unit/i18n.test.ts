import { describe, expect, it } from "vitest";
import {
  localeHtmlLang,
  parseLocale,
  translate,
  type MessageKey,
} from "../../lib/i18n";

describe("i18n", () => {
  it("parses supported locales and falls back safely", () => {
    expect(parseLocale("fr")).toBe("fr");
    expect(parseLocale("cs")).toBe("cs");
    expect(parseLocale("sk")).toBe("sk");
    expect(parseLocale("de")).toBe("en");
    expect(parseLocale(undefined)).toBe("en");
  });

  it("maps locales to HTML language tags", () => {
    expect(localeHtmlLang("en")).toBe("en-GB");
    expect(localeHtmlLang("fr")).toBe("fr-FR");
    expect(localeHtmlLang("cs")).toBe("cs-CZ");
    expect(localeHtmlLang("sk")).toBe("sk-SK");
  });

  it("translates interface copy for every language", () => {
    const key = "docs.nav.components" as MessageKey;
    expect(translate("en", key)).toBe("Components");
    expect(translate("fr", key)).toBe("Composants");
    expect(translate("cs", key)).toBe("Komponenty");
    expect(translate("sk", key)).toBe("Komponenty");
  });

  it("interpolates translated parameters", () => {
    expect(
      translate("fr", "docs.hub.componentsDescription", { count: 306 }),
    ).toContain("306");
    expect(translate("cs", "docs.noResults", { query: "chart" })).toContain("chart");
  });
});
