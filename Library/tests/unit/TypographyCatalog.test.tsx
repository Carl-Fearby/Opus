import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Heading } from "../../components/Heading";
import { Text } from "../../components/Text";
import { getControlSectionsByCategory } from "@/lib/controls/registry";

describe("Typography components", () => {
  it("renders the requested semantic elements and spacing tokens", () => {
    const { container } = render(
      <>
        <Text padding="cozy" size={500} weight={600}>Body copy</Text>
        <Heading level={1} padding="compact" size={400} weight={500}>Page title</Heading>
      </>,
    );

    expect(screen.getByText("Body copy").tagName).toBe("P");
    expect(screen.getByText("Body copy")).toHaveAttribute("data-padding", "cozy");
    expect(screen.getByText("Body copy")).toHaveAttribute("data-size", "500");
    expect(screen.getByText("Body copy")).toHaveAttribute("data-weight", "600");
    expect(screen.getByRole("heading", { level: 1, name: "Page title" })).toHaveAttribute("data-padding", "compact");
    expect(container.querySelector("h1")).toHaveAttribute("data-size", "400");
    expect(container.querySelector("h1")).toHaveAttribute("data-weight", "500");
  });

  it("includes every typography control in the Content sidebar section", () => {
    const typography = getControlSectionsByCategory("content").find(
      (section) => section.label === "Typography",
    );

    expect(typography?.controls.map((control) => control.slug)).toEqual(["heading", "text"]);
  });
});
