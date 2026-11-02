import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListField } from "../../components/fields/ListField";

function ListHarness({
  disabled = false,
  initial = [],
  initialReorderable = true,
  readOnly = false,
}: {
  disabled?: boolean;
  initial?: string[];
  initialReorderable?: boolean;
  readOnly?: boolean;
}) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <ListField
      disabled={disabled}
      id="members"
      label="Team members"
      onChange={setValue}
      readOnly={readOnly}
      reorderable={initialReorderable}
      value={value}
    />
  );
}

function input() {
  return screen.getByLabelText("Team members entry") as HTMLInputElement;
}

describe("ListField", () => {
  it("adds a typed entry when the Add button is clicked", () => {
    render(<ListHarness />);

    fireEvent.change(input(), { target: { value: "Ana" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(screen.getByText("Ana")).toBeTruthy();
    expect(input().value).toBe("");
  });

  it("adds a typed entry when Enter is pressed", () => {
    render(<ListHarness />);

    fireEvent.change(input(), { target: { value: "Carl" } });
    fireEvent.keyDown(input(), { key: "Enter" });

    expect(screen.getByText("Carl")).toBeTruthy();
  });

  it("trims entries and ignores duplicates", () => {
    render(<ListHarness />);

    fireEvent.change(input(), { target: { value: "  Ana  " } });
    fireEvent.keyDown(input(), { key: "Enter" });
    fireEvent.change(input(), { target: { value: "Ana" } });
    fireEvent.keyDown(input(), { key: "Enter" });

    expect(screen.getAllByText("Ana")).toHaveLength(1);
  });

  it("ignores whitespace-only drafts", () => {
    render(<ListHarness />);

    fireEvent.change(input(), { target: { value: "   " } });
    expect((screen.getByRole("button", { name: "Add" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.keyDown(input(), { key: "Enter" });
    expect(screen.getByText("No entries yet")).toBeTruthy();
  });

  it("removes an entry using its row button", () => {
    render(<ListHarness initial={["Ana", "Carl"]} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove Ana" }));

    expect(screen.queryByText("Ana")).toBeNull();
    expect(screen.getByText("Carl")).toBeTruthy();
  });

  it("reorders entries when a row is dragged onto another", () => {
    render(<ListHarness initial={["Ana", "Carl", "Dana"]} />);

    const rows = () => screen.getAllByRole("listitem");
    const dataTransfer = {
      dropEffect: "",
      effectAllowed: "",
      getData: () => "0",
      setData: () => undefined,
    };

    fireEvent.dragStart(rows()[0], { dataTransfer });
    fireEvent.dragOver(rows()[2], { dataTransfer });
    fireEvent.drop(rows()[2], { dataTransfer });

    expect(rows().map((row) => row.textContent)).toEqual(["Carl", "Dana", "Ana"]);
  });

  it("drops an entry after the last row when released below the list", () => {
    render(<ListHarness initial={["Ana", "Carl", "Dana"]} />);

    const rows = () => screen.getAllByRole("listitem");
    const list = screen.getByRole("list");
    const dataTransfer = {
      dropEffect: "",
      effectAllowed: "",
      getData: () => "0",
      setData: () => undefined,
    };

    fireEvent.dragStart(rows()[0], { dataTransfer });
    fireEvent.dragOver(list, { clientY: 9999, dataTransfer });
    fireEvent.drop(list, { clientY: 9999, dataTransfer });

    expect(rows().map((row) => row.textContent)).toEqual(["Carl", "Dana", "Ana"]);
  });

  it("does not reorder when dragging is disabled", () => {
    render(<ListHarness initial={["Ana", "Carl"]} initialReorderable={false} />);

    const rows = screen.getAllByRole("listitem");
    const dataTransfer = {
      dropEffect: "",
      effectAllowed: "",
      getData: () => "0",
      setData: () => undefined,
    };

    fireEvent.dragStart(rows[0], { dataTransfer });
    fireEvent.dragOver(rows[1], { dataTransfer });
    fireEvent.drop(rows[1], { dataTransfer });

    expect(screen.getAllByRole("listitem").map((row) => row.textContent)).toEqual([
      "Ana",
      "Carl",
    ]);
  });

  it("shows an empty message until an entry exists", () => {
    render(<ListHarness />);
    expect(screen.getByText("No entries yet")).toBeTruthy();

    fireEvent.change(input(), { target: { value: "Dana" } });
    fireEvent.keyDown(input(), { key: "Enter" });

    expect(screen.queryByText("No entries yet")).toBeNull();
  });

  it("hides the composer and remove buttons when read-only", () => {
    render(<ListHarness initial={["Ana"]} readOnly />);

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove Ana" })).toBeNull();
    expect(screen.getByText("Ana")).toBeTruthy();
  });

  it("disables the composer when disabled", () => {
    render(<ListHarness disabled initial={["Ana"]} />);

    expect(input().disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Remove Ana" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
