import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SelectField } from "../../components/fields/SelectField";
import { TextAreaField } from "../../components/fields/TextAreaField";
import { TextField } from "../../components/fields/TextField";
import { Surface } from "../../components/Surface";
import { Text } from "../../components/Text";

describe("Surface", () => {
  it("renders the box variants and a plain border by default", () => {
    const { container } = render(
      <Surface background="panel" border radius="lg" shadow="md">
        Body
      </Surface>,
    );
    const surface = container.firstElementChild as HTMLElement;

    expect(surface.tagName).toBe("DIV");
    expect(surface.dataset.border).toBe("default");
    expect(surface.dataset.background).toBe("panel");
    expect(surface.dataset.radius).toBe("lg");
    expect(surface.dataset.shadow).toBe("md");
    expect(surface.dataset.padding).toBe("none");
    expect(surface).toHaveTextContent("Body");
  });

  it("accepts an element, a padding preset and an explicit padding length", () => {
    const { container, rerender } = render(
      <Surface as="section" padding="comfortable">
        Body
      </Surface>,
    );
    expect(container.querySelector("section")?.dataset.padding).toBe("comfortable");

    rerender(<Surface padding={20}>Body</Surface>);
    const surface = container.firstElementChild as HTMLElement;
    expect(surface.dataset.padding).toBeUndefined();
    expect(surface.style.padding).toBe("20px");
  });

  it("mixes the tone into the border when an alpha is given", () => {
    const { container } = render(
      <Surface border="accent" borderAlpha={40} tone="danger">
        Body
      </Surface>,
    );
    const surface = container.firstElementChild as HTMLElement;

    expect(surface.dataset.border).toBe("accent");
    expect(surface.dataset.tone).toBe("danger");
    expect(surface.dataset.tint).toBe("true");
    expect(surface.style.getPropertyValue("--surface-border-alpha")).toBe("40%");
  });

  it("clamps the border alpha to 0–100", () => {
    const { container, rerender } = render(<Surface borderAlpha={180}>Body</Surface>);
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue("--surface-border-alpha"),
    ).toBe("100%");

    rerender(<Surface borderAlpha={-20}>Body</Surface>);
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue("--surface-border-alpha"),
    ).toBe("0%");
  });
});

describe("Text typography options", () => {
  it("applies uppercase, tracking, leading and alignment", () => {
    const { container } = render(
      <Text align="center" leading="tight" tracking="wide" uppercase>
        Overdue
      </Text>,
    );
    const text = container.querySelector("p") as HTMLParagraphElement;

    expect(text.dataset.uppercase).toBe("true");
    expect(text.dataset.tracking).toBe("wide");
    expect(text.dataset.leading).toBe("tight");
    expect(text.dataset.align).toBe("center");
  });

  it("reads sizes below 100 as pixels", () => {
    const { container, rerender } = render(<Text size={11}>Caption</Text>);
    const text = container.querySelector("p") as HTMLParagraphElement;

    expect(text.dataset.size).toBeUndefined();
    expect(text.style.fontSize).toBe("11px");

    rerender(<Text size="xs">Caption</Text>);
    expect((container.querySelector("p") as HTMLElement).dataset.size).toBe("xs");
  });

  it("keeps the numeric scale for values of 100 and above", () => {
    const { container } = render(<Text size={200}>Body copy</Text>);
    expect((container.querySelector("p") as HTMLElement).dataset.size).toBe("200");
  });
});

describe("Uncontrolled fields", () => {
  it("accepts a name and default value on TextField", () => {
    render(<TextField defaultValue="Ada" id="name" label="Name" name="name" type="text" />);
    const input = screen.getByLabelText("Name") as HTMLInputElement;

    expect(input.value).toBe("Ada");
    expect(input.name).toBe("name");

    fireEvent.change(input, { target: { value: "Ada Lovelace" } });
    expect(input.value).toBe("Ada Lovelace");
  });

  it("accepts a name and default value on TextAreaField", () => {
    render(
      <TextAreaField defaultValue="Notes" id="notes" label="Notes" name="notes" />,
    );
    expect((screen.getByLabelText("Notes") as HTMLTextAreaElement).value).toBe("Notes");
  });

  it("owns its value on SelectField when no value is passed", () => {
    render(
      <SelectField
        defaultValue="Member"
        id="role"
        label="Role"
        name="role"
        options={["Owner", "Member", "Viewer"]}
      />,
    );

    const trigger = screen.getByRole("combobox", { name: "Role" });
    expect(trigger).toHaveTextContent("Member");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("option", { name: "Viewer" }));

    expect(screen.getByRole("combobox", { name: "Role" })).toHaveTextContent("Viewer");
    expect((document.querySelector("select[name='role']") as HTMLSelectElement).value).toBe("Viewer");
  });
});
