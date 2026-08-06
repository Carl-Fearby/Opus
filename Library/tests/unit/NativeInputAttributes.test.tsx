import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DateField, TextAreaField, TextField } from "@/components/fields";

describe("native form attributes", () => {
  it("forwards text-entry behaviour and validation attributes", () => {
    render(
      <TextField
        autoCapitalize="words"
        autoComplete="name"
        autoCorrect="off"
        enterKeyHint="next"
        id="full-name"
        inputMode="text"
        label="Full name"
        maxLength={80}
        minLength={2}
        name="fullName"
        pattern="[A-Za-z ]+"
        spellCheck
        type="text"
        value="Carl Fearby"
        onChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Full name");
    expect(input).toHaveAttribute("autocomplete", "name");
    expect(input).toHaveAttribute("autocapitalize", "words");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("enterkeyhint", "next");
    expect(input).toHaveAttribute("inputmode", "text");
    expect(input).toHaveAttribute("maxlength", "80");
    expect(input).toHaveAttribute("minlength", "2");
    expect(input).toHaveAttribute("name", "fullName");
    expect(input).toHaveAttribute("pattern", "[A-Za-z ]+");
    expect(input).toHaveAttribute("spellcheck", "true");
  });

  it("forwards textarea behaviour without losing component-owned attributes", () => {
    render(
      <TextAreaField
        autoComplete="street-address"
        disabled
        id="address"
        inputProps={{ rows: 6, wrap: "soft" }}
        label="Address"
        maxChars={120}
        name="address"
        spellCheck={false}
        value=""
        onChange={vi.fn()}
      />,
    );

    const textarea = screen.getByLabelText("Address");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("autocomplete", "street-address");
    expect(textarea).toHaveAttribute("maxlength", "120");
    expect(textarea).toHaveAttribute("rows", "6");
    expect(textarea).toHaveAttribute("wrap", "soft");
  });

  it("renders an Opus date control with a named hidden value and calendar dialog", async () => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    render(
      <DateField
        id="birthday"
        inputProps={{ min: "1900-01-01", max: "2030-12-31" }}
        label="Birthday"
        name="birthday"
        value="2026-08-05"
        onChange={vi.fn()}
      />,
    );

    const control = screen.getByRole("button", { name: "Birthday" });
    expect(control).toHaveAttribute("aria-haspopup", "dialog");
    expect(control).toHaveTextContent(/\d{1,2}[/.]\d{1,2}[/.]\d{4}/);

    const hidden = document.querySelector('input[name="birthday"]');
    expect(hidden).toHaveAttribute("value", "2026-08-05");

    await user.click(control);
    expect(screen.getByRole("dialog", { name: "Choose date" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
  });
});
