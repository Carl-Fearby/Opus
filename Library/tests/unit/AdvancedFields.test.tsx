import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PercentageField } from "../../components/fields";

describe("advanced form fields", () => {
  it("reports percentage values on a 0–100 scale and preserves an empty value", () => {
    const onChange = vi.fn();
    render(<PercentageField id="completion" label="Completion" value={25} onChange={onChange} />);

    const input = screen.getByRole("spinbutton", { name: "Completion" });
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
    expect(input).toHaveValue(25);

    fireEvent.change(input, { target: { value: "67.5" } });
    fireEvent.change(input, { target: { value: "" } });

    expect(onChange).toHaveBeenNthCalledWith(1, 67.5);
    expect(onChange).toHaveBeenNthCalledWith(2, null);
  });
});
