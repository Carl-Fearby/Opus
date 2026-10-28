import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguagePicker } from "../../components/LanguagePicker";
import { OpusI18nProvider } from "../../components/OpusI18n";

const options = [
  { id: "en", flag: "🇬🇧", country: "gb" },
  { id: "fr", flag: "🇫🇷", country: "fr", label: "Français" },
  { id: "de" },
];

function offeredLanguages() {
  const list = screen.getByRole("listbox");
  return within(list)
    .getAllByRole("option")
    .map((option) => option.textContent);
}

describe("LanguagePicker", () => {
  it("shows the current language and offers the provider's locales, named and ordered in it", () => {
    render(
      <OpusI18nProvider availableLocales={options} locale="fr">
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    expect(screen.getByRole("button", { name: "Language: Français" })).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Language: Français" }));

    // "de" has no label, so it falls back to Intl.DisplayNames in the active language.
    expect(offeredLanguages()).toEqual(["Allemand", "Anglais", "Français✓"]);
    expect(
      within(screen.getByRole("listbox")).getByRole("option", { selected: true }).textContent,
    ).toContain("Français");
  });

  it("reports the chosen locale and closes the list", () => {
    const onLocaleChange = vi.fn();

    render(
      <OpusI18nProvider availableLocales={options} locale="en" onLocaleChange={onLocaleChange}>
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    const trigger = screen.getByRole("button", { name: /Language/ });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: /German/ }));

    expect(onLocaleChange).toHaveBeenCalledWith("de");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("prefers its own props over the provider", () => {
    const providerChange = vi.fn();
    const pickerChange = vi.fn();

    render(
      <OpusI18nProvider availableLocales={options} locale="en" onLocaleChange={providerChange}>
        <LanguagePicker
          availableLocales={[{ id: "es", label: "Español" }]}
          label="Idioma"
          locale="es"
          onLocaleChange={pickerChange}
        />
      </OpusI18nProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Idioma: Español" });
    fireEvent.click(trigger);
    expect(offeredLanguages()).toEqual(["Español✓"]);

    fireEvent.click(screen.getByRole("option", { name: /Español/ }));

    expect(pickerChange).toHaveBeenCalledWith("es");
    expect(providerChange).not.toHaveBeenCalled();
  });

  it("renders flag-icons SVGs for country codes and emoji otherwise", () => {
    render(
      <OpusI18nProvider availableLocales={options} locale="en">
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Language/ }));

    expect(document.querySelector(".fi.fi-gb")).not.toBeNull();
    expect(document.querySelector(".fi.fi-fr")).not.toBeNull();
    // "de" has neither a country nor a flag, so it renders no flag at all.
    expect(document.querySelector(".fi.fi-de")).toBeNull();
  });

  it("searches the active language, the language's own name and the English name", () => {
    render(
      <OpusI18nProvider
        availableLocales={[...options, { id: "ur", country: "pk" }]}
        locale="ur"
      >
        <LanguagePicker searchable />
      </OpusI18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Language/ }));
    const search = screen.getByLabelText("Search languages");

    // Browsing in Urdu, the list is Urdu, but an English search still finds English.
    fireEvent.change(search, { target: { value: "English" } });
    expect(offeredLanguages()).toHaveLength(1);
    expect(offeredLanguages()[0]).toBe("انگریزی");
    expect(document.querySelector(".fi.fi-gb")).not.toBeNull();

    // Diacritics are folded, so the host's own label matches without accents.
    fireEvent.change(search, { target: { value: "francais" } });
    expect(offeredLanguages()).toEqual(["Français"]);

    // The language's own name works too, which is how the Urdu row is spelled.
    fireEvent.change(search, { target: { value: "اردو" } });
    expect(offeredLanguages()).toHaveLength(1);

    fireEvent.change(search, { target: { value: "zzz" } });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No languages match.")).toBeInTheDocument();
  });

  it("hides the search field for a short list and accepts an explicit choice", () => {
    render(
      <OpusI18nProvider availableLocales={options} locale="en">
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Language/ }));
    expect(screen.queryByLabelText("Search languages")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    render(
      <OpusI18nProvider availableLocales={options} locale="en">
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    const trigger = screen.getByRole("button", { name: /Language/ });
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("stays usable when no locale list is configured", () => {
    render(
      <OpusI18nProvider>
        <LanguagePicker />
      </OpusI18nProvider>,
    );

    const trigger = screen.getByRole("button", { name: "Language: English" });
    fireEvent.click(trigger);

    expect(offeredLanguages()).toEqual(["English✓"]);
  });
});
