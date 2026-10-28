import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CountryPickerField } from "../../components/fields/CountryPickerField/CountryPickerField";
import { OpusI18nProvider } from "../../components/OpusI18n";

const countries = [
  { code: "GB", dialCode: "+44", label: "United Kingdom" },
  { code: "NL", dialCode: "+31", label: "Netherlands" },
  { code: "CW", dialCode: "+599", label: "Curaçao" },
];

function renderField(locale: string, onChange = vi.fn()) {
  render(
    <OpusI18nProvider locale={locale}>
      <CountryPickerField
        countries={countries}
        id="country"
        label="Country"
        value=""
        onChange={onChange}
      />
    </OpusI18nProvider>,
  );
  return onChange;
}

function openList() {
  fireEvent.click(screen.getByRole("button", { name: /Select country/ }));
}

function offeredCountries() {
  return screen.getAllByRole("option").map((option) => option.textContent);
}

function searchFor(value: string) {
  fireEvent.change(screen.getByLabelText("Search countries"), { target: { value } });
}

describe("CountryPickerField", () => {
  it("names countries in the interface language", () => {
    renderField("fr");
    openList();

    // Intl supplies French region names; the English label stays for search only.
    expect(offeredCountries()).toEqual(["CuraçaoCW", "Pays-BasNL", "Royaume-UniGB"]);
  });

  it("falls back to the supplied label in English", () => {
    renderField("en");
    openList();

    expect(offeredCountries()).toEqual(["CuraçaoCW", "NetherlandsNL", "United KingdomGB"]);
  });

  it("finds a country by its English name while browsing in French", () => {
    renderField("fr");
    openList();

    searchFor("Netherlands");
    expect(offeredCountries()).toEqual(["Pays-BasNL"]);

    searchFor("united");
    expect(offeredCountries()).toEqual(["Royaume-UniGB"]);

    searchFor("pays");
    expect(offeredCountries()).toEqual(["Pays-BasNL"]);

    searchFor("zzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("No countries match.")).toBeInTheDocument();
  });

  it("ignores accents and still matches codes", () => {
    renderField("fr");
    openList();

    searchFor("curacao");
    expect(offeredCountries()).toEqual(["CuraçaoCW"]);

    searchFor("+31");
    expect(offeredCountries()).toEqual(["Pays-BasNL"]);
  });

  it("reports the chosen country code", () => {
    const onChange = renderField("fr");
    openList();

    fireEvent.click(screen.getByRole("option", { name: /Pays-Bas/ }));

    expect(onChange).toHaveBeenCalledWith("NL");
  });
});
