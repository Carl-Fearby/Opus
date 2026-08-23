import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OpusBrand } from "../../components/OpusBrand";

describe("OpusBrand", () => {
  it("exposes accessible bundled variants", () => {
    const { rerender } = render(<OpusBrand alt="Opus product logo" variant="icon" />);
    const icon = screen.getByRole("img", { name: "Opus product logo" });
    expect(icon).toHaveClass(/icon/);

    rerender(<OpusBrand alt="Opus wordmark" variant="wordmark" />);
    expect(screen.getByRole("img", { name: "Opus wordmark" })).toHaveClass(/wordmark/);
  });

  it("allows consumers to supply a custom source", () => {
    render(<OpusBrand alt="Tenant logo" src="https://cdn.example.test/tenant.png" />);
    expect(screen.getByRole("img", { name: "Tenant logo" })).toHaveAttribute(
      "src",
      "https://cdn.example.test/tenant.png",
    );
  });
});
