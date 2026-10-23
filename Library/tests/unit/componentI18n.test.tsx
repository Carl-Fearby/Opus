import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OpusI18nProvider } from "../../components/OpusI18n";
import { Pagination } from "../../components/Pagination";
import { componentMessages } from "../../lib/i18n/componentMessages";

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
});
