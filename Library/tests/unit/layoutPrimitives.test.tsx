import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "../../components/Card";
import { Container } from "../../components/Container";
import { Grid } from "../../components/Grid";
import { Heading } from "../../components/Heading";
import { Stack } from "../../components/Stack";
import { Text } from "../../components/Text";

describe("Text", () => {
  it("applies semantic tones", () => {
    const { container, rerender } = render(<Text tone="muted">Members</Text>);
    expect(container.querySelector("p")?.dataset.tone).toBe("muted");

    rerender(<Text tone="default">Members</Text>);
    expect(container.querySelector("p")?.dataset.tone).toBe("default");
  });

  it("marks truncation and clamps to a line count", () => {
    const { container } = render(
      <Text lineClamp={2} truncate>
        A long board name that would otherwise wrap
      </Text>,
    );
    const element = container.querySelector("p") as HTMLParagraphElement;

    expect(element.dataset.truncate).toBe("true");
    expect(element.dataset.clamp).toBe("true");
    expect(element.getAttribute("style")).toContain("line-clamp: 2");
  });

  it("accepts the pixel-exact named sizes", () => {
    const { container } = render(<Text size="2xs">Caption</Text>);
    expect(container.querySelector("p")?.dataset.size).toBe("2xs");
  });
});

describe("Heading", () => {
  it("applies semantic tones", () => {
    const { container } = render(<Heading tone="accent">Boards</Heading>);
    expect(container.querySelector("h2")?.dataset.tone).toBe("accent");
  });
});

describe("Stack", () => {
  it("converts numeric maxWidth and padding to pixels", () => {
    const { container } = render(
      <Stack maxWidth={460} padding={24}>
        <Text>Sign in</Text>
      </Stack>,
    );
    const style = (container.firstChild as HTMLElement).style;

    expect(style.maxWidth).toBe("460px");
    expect(style.padding).toBe("24px");
  });
});

describe("Container", () => {
  it("lets maxWidth override the size preset", () => {
    const { container } = render(<Container maxWidth={460}>Sign in</Container>);
    expect((container.firstChild as HTMLElement).style.maxWidth).toBe("460px");
  });

  it("falls back to the size preset", () => {
    const { container } = render(<Container size="sm">Sign in</Container>);
    expect((container.firstChild as HTMLElement).style.maxWidth).toBe("40rem");
  });
});

describe("Grid", () => {
  it("exposes breakpoint column counts as CSS variables", () => {
    const { container } = render(
      <Grid columns={{ base: 1, sm: 2, lg: 3 }}>
        <div />
      </Grid>,
    );
    const element = container.firstChild as HTMLElement;

    expect(element.dataset.responsive).toBe("true");
    expect(element.style.getPropertyValue("--grid-cols-base")).toBe("1");
    expect(element.style.getPropertyValue("--grid-cols-sm")).toBe("2");
    expect(element.style.getPropertyValue("--grid-cols-lg")).toBe("3");
    expect(element.style.getPropertyValue("--grid-cols-md")).toBe("");
    expect(element.style.gridTemplateColumns).toBe("");
  });

  it("still accepts a fixed column count", () => {
    const { container } = render(
      <Grid columns={4}>
        <div />
      </Grid>,
    );
    expect((container.firstChild as HTMLElement).style.gridTemplateColumns).toBe(
      "repeat(4, minmax(0, 1fr))",
    );
  });
});

describe("Card", () => {
  it("renders a named overlay link instead of nesting anchors", () => {
    render(
      <Card href="/boards/design" title="Design board">
        <p>12 pins</p>
      </Card>,
    );
    const link = screen.getByRole("link", { name: "Design board" });

    expect(link.getAttribute("href")).toBe("/boards/design");
    expect(link.querySelector("a")).toBeNull();
  });

  it("uses linkLabel when the card title is not descriptive enough", () => {
    render(
      <Card href="/boards/design" linkLabel="Open Design board" title="Design board">
        <p>12 pins</p>
      </Card>,
    );
    expect(screen.getByRole("link", { name: "Open Design board" })).toBeTruthy();
  });
});
