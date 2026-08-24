import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResizeHandle } from "../../components/ResizeHandle";

describe("ResizeHandle", () => {
  it("renders a transparent track when requested", () => {
    render(
      <ResizeHandle
        aria-label="Resize sidebar"
        background="contrast"
        orientation="vertical"
        transparent
      />,
    );

    expect(screen.getByRole("separator", { name: "Resize sidebar" })).toHaveAttribute(
      "data-background",
      "none",
    );
  });

  it("keeps the existing none background option", () => {
    render(<ResizeHandle aria-label="Resize sidebar" background="none" orientation="horizontal" />);

    expect(screen.getByRole("separator", { name: "Resize sidebar" })).toHaveAttribute(
      "data-background",
      "none",
    );
  });
});
