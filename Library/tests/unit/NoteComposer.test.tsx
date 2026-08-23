import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NoteComposer } from "../../components/NoteComposer";

describe("NoteComposer keyboard submission", () => {
  it("submits on Enter while retaining the existing save callback", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onSubmit = vi.fn();
    render(<NoteComposer onSave={onSave} onSubmit={onSubmit} submitOnEnter />);

    const composer = screen.getByPlaceholderText("Add a note...");
    await user.type(composer, "Ship this");
    await user.keyboard("{Enter}");

    expect(onSave).toHaveBeenCalledWith("Ship this", []);
    expect(onSubmit).toHaveBeenCalledWith("Ship this", []);
    expect(composer).toHaveValue("");
  });

  it("retains Shift+Enter for a newline", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<NoteComposer onSubmit={onSubmit} submitOnEnter />);

    const composer = screen.getByPlaceholderText("Add a note...");
    await user.type(composer, "First line");
    await user.keyboard("{Shift>}{Enter}{/Shift}Second line");

    expect(composer).toHaveValue("First line\nSecond line");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
