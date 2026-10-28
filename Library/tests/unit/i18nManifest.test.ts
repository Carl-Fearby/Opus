import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditOpusTranslations,
  opusDynamicTranslationPrefixes,
  opusTranslatedKeys,
  opusTranslationManifest,
  opusTranslationKeys,
} from "../../packages/opus-react/src/i18n";
import { componentUiMessagesEn } from "../../lib/i18n/componentUiMessages.en";
import {
  readTranslationContract,
  renderManifest,
} from "../../scripts/generate-i18n-manifest";

const manifestPath = join(process.cwd(), "packages", "opus-react", "src", "i18nManifest.ts");

describe("translation key manifest", () => {
  it("matches the keys the components currently resolve", () => {
    const contract = readTranslationContract();

    expect(readFileSync(manifestPath, "utf8")).toBe(renderManifest(contract));
  });

  it("records namespaces the library assembles at runtime", () => {
    expect(opusDynamicTranslationPrefixes).toContain("errorState.");
  });

  it("only marks a key as shipped when it has English copy of its own", () => {
    expect(opusTranslatedKeys.length).toBeGreaterThan(700);

    for (const key of opusTranslatedKeys) {
      expect(opusTranslationManifest[key], `${key} manifest entry`).toBeDefined();
      expect(componentUiMessagesEn[key], `${key} English copy`).toBeTruthy();
    }

    // Keys only reachable from application surfaces ship no translation.
    expect(opusTranslationManifest["preview.desktop"]?.shipped).toBe(false);
    expect(opusTranslationManifest["language.label"]?.shipped).toBe(false);
    expect(opusTranslationKeys.length).toBeGreaterThan(opusTranslatedKeys.length);
  });
});

describe("component copy", () => {
  it("passes the same English fallback at every call site of a key", () => {
    expect(readTranslationContract().conflicts).toEqual([]);
  });

  it("keeps call-site fallbacks identical to the shipped English copy", () => {
    const { fallbacks } = readTranslationContract();
    const mismatched: string[] = [];

    for (const [key, fallback] of fallbacks) {
      const shipped = componentUiMessagesEn[key];
      if (typeof shipped === "string" && shipped !== fallback) {
        mismatched.push(`${key}: "${fallback}" in code vs "${shipped}" in the dictionary`);
      }
    }

    expect(mismatched).toEqual([]);
  });
});

describe("auditOpusTranslations", () => {
  it("reports every shipped key an empty dictionary is missing", () => {
    const report = auditOpusTranslations({});

    expect(report.missing).toEqual(opusTranslatedKeys);
    expect(report.unknown).toEqual([]);
    expect(report.drifted).toEqual([]);
  });

  it("separates untranslated optional keys from keys the library dropped", () => {
    const report = auditOpusTranslations({
      "kanban.addCard": "Ajouter une carte",
      "obsolete.key": "Stale",
    });

    expect(report.missing).not.toContain("kanban.addCard");
    expect(report.missing).toContain("kanban.attach");
    expect(report.unknown).toEqual(["obsolete.key"]);
    expect(report.optional).toContain("preview.desktop");
  });

  it("does not flag keys under a runtime namespace", () => {
    const report = auditOpusTranslations({
      "errorState.offline.title": "Hors ligne",
      "errorState.offline.description": "Pas de connexion",
    });

    expect(report.unknown).toEqual([]);
  });

  it("flags English copy that drifted from the shipped fallback", () => {
    expect(
      auditOpusTranslations({ "kanban.addCard": "Add a card" }, { english: true }).drifted,
    ).toEqual([]);

    expect(
      auditOpusTranslations({ "kanban.addCard": "Add another card" }, { english: true }).drifted,
    ).toEqual(["kanban.addCard"]);

    // Drift only speaks to English; other locales translate the fallback freely.
    expect(
      auditOpusTranslations({ "kanban.addCard": "Ajouter une carte" }).drifted,
    ).toEqual([]);
  });

  it("ignores blank values", () => {
    const report = auditOpusTranslations({ "kanban.addCard": "   " });

    expect(report.missing).toContain("kanban.addCard");
    expect(report.unknown).toEqual([]);
  });
});
