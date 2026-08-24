import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "../../components/Dialog";

describe("Dialog custom actions", () => {
  it("renders custom actions in place of the preset and returns their result", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Dialog
        actions={[
          { label: "No", result: "cancel", variant: "secondary" },
          { label: "Yes", result: "confirm", variant: "primary" },
          { label: "Branch", result: "branch", variant: "tertiary" },
        ]}
        description="Choose the next step."
        open
        title="Continue?"
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("button", { name: "Branch" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "OK" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Branch" }));
    expect(onClose).toHaveBeenCalledWith("branch");
  });
});
