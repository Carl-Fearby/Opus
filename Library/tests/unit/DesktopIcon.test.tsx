import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DesktopIcon } from "@/components/DesktopIcon";

describe("DesktopIcon", () => {
  it("selects on one click and opens on double click by default", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onSelect = vi.fn();
    render(
      <DesktopIcon
        icon="folder"
        label="Documents"
        onOpen={onOpen}
        onSelect={onSelect}
      />,
    );

    const icon = screen.getByRole("button", { name: "Open Documents" });
    await user.click(icon);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onOpen).not.toHaveBeenCalled();

    await user.dblClick(icon);
    expect(onOpen).toHaveBeenCalled();
  });

  it("opens with Enter for keyboard users", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<DesktopIcon icon="folder" label="Documents" onOpen={onOpen} />);

    screen.getByRole("button", { name: "Open Documents" }).focus();
    await user.keyboard("{Enter}");
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
