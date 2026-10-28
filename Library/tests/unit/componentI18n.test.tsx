import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OpusI18nProvider, useOpusTranslation } from "../../components/OpusI18n";
import { Pagination } from "../../components/Pagination";
import { componentMessages } from "../../lib/i18n/componentMessages";

function Probe() {
  const { locale, availableLocales, t, onLocaleChange } = useOpusTranslation();

  return (
    <span data-testid="probe">
      {`${locale}|${availableLocales
        .map((option) => option.id)
        .join(",")}|${t("probe.unshipped", "Probe")}|${typeof onLocaleChange}`}
    </span>
  );
}

describe("component internationalisation", () => {
  it("translates shared component labels through the Opus provider", () => {
    render(
      <OpusI18nProvider locale="fr" messages={componentMessages.fr}>
        <Pagination page={2} pageCount={4} onPageChange={() => undefined} />
      </OpusI18nProvider>,
    );

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Page précédente" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Page suivante" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("lets the host resolve keys with its own translation engine", () => {
    render(
      <OpusI18nProvider
        locale="de"
        messages={componentMessages.fr}
        translate={(key, params) =>
          key === "pagination.page" && params ? `Seite ${params.page}!` : undefined
        }
      >
        <Pagination page={2} pageCount={4} onPageChange={() => undefined} />
      </OpusI18nProvider>,
    );

    // Host copy wins for the keys it answers, with params still interpolated.
    expect(screen.getByRole("button", { name: "Seite 2!" })).toBeInTheDocument();
    // The supplied dictionary still answers the keys the host declines.
    expect(
      screen.getByRole("button", { name: "Page précédente" }),
    ).toBeInTheDocument();
  });

  it("falls through to the dictionary and then to the shipped English copy", () => {
    render(
      <OpusI18nProvider
        locale="fr"
        messages={{ "pagination.next": "Suivant" }}
        translate={() => ""}
      >
        <Pagination page={1} pageCount={3} onPageChange={() => undefined} />
      </OpusI18nProvider>,
    );

    // An empty answer from the host counts as "no translation".
    expect(screen.getByRole("button", { name: "Suivant" })).toBeInTheDocument();
    // Keys the dictionary does not translate keep the English fallback.
    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeInTheDocument();
  });

  it("exposes the locale, available locales and change handler to consumers", () => {
    render(
      <OpusI18nProvider
        availableLocales={["en", "fr", "fr", { id: "de" }]}
        locale="de"
        onLocaleChange={() => undefined}
      >
        <Probe />
      </OpusI18nProvider>,
    );

    expect(screen.getByTestId("probe")).toHaveTextContent(
      "de|en,fr,de|Probe|function",
    );
  });
});
