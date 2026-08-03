import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckboxField } from "../../components/fields/CheckboxField";

function ControlledCheckbox({ onChange }: { onChange: (checked: boolean) => void }) {
  const [checked, setChecked] = useState(false);
  return (
    <CheckboxField
      checked={checked}
      id="terms"
      label="Accept terms"
      onChange={(event) => {
        setChecked(event.target.checked);
        onChange(event.target.checked);
      }}
    />
  );
}

describe("CheckboxField", () => {
  it("toggles and calls onChange when its visible control is pressed", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledCheckbox onChange={onChange} />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
