import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SelectField } from "../../components/fields/SelectField";
import { MultiSelectField } from "../../components/fields/MultiSelectField";

const people = ["Ana", "Carl", "Carla", "Dana"];

function SelectHarness({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState("Ana");
  return (
    <SelectField
      id="assignee"
      label="Assignee"
      options={people}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        onChange?.(event.target.value);
      }}
    />
  );
}

function MultiSelectHarness({ onChange }: { onChange?: (value: string[]) => void }) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <MultiSelectField
      id="attendees"
      label="Attendees"
      options={people}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("SelectField typeahead", () => {
  it("commits the option starting with the typed letter while closed", () => {
    const onChange = vi.fn();
    render(<SelectHarness onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Assignee" });

    fireEvent.keyDown(trigger, { key: "c" });

    expect(onChange).toHaveBeenCalledWith("Carl");
    expect(trigger).toHaveTextContent("Carl");
  });

  it("cycles through matches when the same letter is pressed again", () => {
    const onChange = vi.fn();
    render(<SelectHarness onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Assignee" });

    fireEvent.keyDown(trigger, { key: "c" });
    fireEvent.keyDown(trigger, { key: "c" });

    expect(onChange).toHaveBeenLastCalledWith("Carla");
  });

  it("matches a typed prefix", () => {
    const onChange = vi.fn();
    render(<SelectHarness onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Assignee" });

    fireEvent.keyDown(trigger, { key: "c" });
    fireEvent.keyDown(trigger, { key: "a" });
    expect(onChange).toHaveBeenLastCalledWith("Carl");

    fireEvent.keyDown(trigger, { key: "r" });
    fireEvent.keyDown(trigger, { key: "l" });
    fireEvent.keyDown(trigger, { key: "a" });
    expect(onChange).toHaveBeenLastCalledWith("Carla");
  });

  it("highlights without committing while the list is open", () => {
    const onChange = vi.fn();
    render(<SelectHarness onChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Assignee" });

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "d" });

    const dana = screen.getByRole("option", { name: "Dana" });
    expect(trigger).toHaveAttribute("aria-activedescendant", dana.id);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("MultiSelectField typeahead", () => {
  it("opens the list on the matching option and highlights it", () => {
    render(<MultiSelectHarness />);
    const trigger = document.getElementById("attendees") as HTMLButtonElement;

    fireEvent.keyDown(trigger, { key: "c" });

    const carl = screen.getByRole("checkbox", { name: "Carl" });
    expect(carl).toHaveFocus();
    expect(carl).not.toBeChecked();
  });

  it("cycles matches and toggles the highlighted option with Enter", () => {
    const onChange = vi.fn();
    render(<MultiSelectHarness onChange={onChange} />);
    const trigger = document.getElementById("attendees") as HTMLButtonElement;

    fireEvent.keyDown(trigger, { key: "c" });
    fireEvent.keyDown(screen.getByRole("checkbox", { name: "Carl" }), { key: "c" });

    const carla = screen.getByRole("checkbox", { name: "Carla" });
    expect(carla).toHaveFocus();

    fireEvent.keyDown(carla, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["Carla"]);
  });

  it("moves the highlight with the arrow keys without selecting", () => {
    const onChange = vi.fn();
    render(<MultiSelectHarness onChange={onChange} />);
    const trigger = document.getElementById("attendees") as HTMLButtonElement;

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const first = screen.getByRole("checkbox", { name: "Ana" });
    expect(first).toHaveFocus();

    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(screen.getByRole("checkbox", { name: "Carl" })).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
  });
});
