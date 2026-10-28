import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguagePicker } from "../../components/LanguagePicker";
import { OpusI18nProvider } from "../../components/OpusI18n";

const options = [
  { id: "en", flag: "🇬🇧" },
  { id: "fr", flag: "🇫🇷" },
  { id: "de" },
];

describe("LanguagePicker", () => {
  it("offers the provider's locales, labelled and ordered in the active language", () => {
    render(
      <OpusI18nProvider availableLocales={options} locale="fr">
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    const select = screen.getByRole("combobox", { name: "Language" });
    expect(select).toHaveValue("fr");

    // "de" has no flag and no label, so both fall back to the locale code and Intl.
    const rendered = screen.getAllByRole("option").map((option) => option.textContent);
    expect(rendered).toEqual(["Allemand", "🇬🇧 Anglais", "🇫🇷 Français"]);
  });

  it("reports the chosen locale to the provider", () => {
    const onLocaleChange = vi.fn();

    render(
      <OpusI18nProvider
        availableLocales={options}
        locale="en"
        onLocaleChange={onLocaleChange}
      >
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Language" }), {
      target: { value: "de" },
    });

    expect(onLocaleChange).toHaveBeenCalledWith("de");
  });

  it("prefers its own props over the provider", () => {
    const providerChange = vi.fn();
    const pickerChange = vi.fn();

    render(
      <OpusI18nProvider
        availableLocales={options}
        locale="en"
        onLocaleChange={providerChange}
      >
        <LanguagePicker
          availableLocales={[{ id: "es", label: "Español" }]}
          label="Idioma"
          locale="es"
          onLocaleChange={pickerChange}
        />
      </OpusI18nProvider>,
    );

    const select = screen.getByRole("combobox", { name: "Idioma" });
    expect(select).toHaveValue("es");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Español",
    ]);

    fireEvent.change(select, { target: { value: "es" } });

    expect(pickerChange).toHaveBeenCalledWith("es");
    expect(providerChange).not.toHaveBeenCalled();
  });

  it("stays usable when no locale list is configured", () => {
    render(
      <OpusI18nProvider>
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    expect(screen.getByRole("combobox", { name: "Language" })).toHaveValue("en");
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });
});
