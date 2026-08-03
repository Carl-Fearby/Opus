import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DesktopDock } from "@/components/DesktopDock";

const items = [{ id: "documents", icon: "folder", label: "Documents" }];

describe("DesktopDock", () => {
  it("opens an item and exposes its resize control accessibly", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(
      <DesktopDock
        items={items}
        onItemClick={onItemClick}
        size={40}
      />,
    );

    await user.dblClick(screen.getByRole("button", { name: "Open Documents" }));
    expect(onItemClick).toHaveBeenCalledWith(items[0]);
    expect(screen.getByRole("separator", { name: "Resize desktop dock" }))
      .toHaveAttribute("aria-valuenow", "40");
  });

  it("supports keyboard resizing and clamps to configured bounds", async () => {
    const user = userEvent.setup();
    const onSizeChange = vi.fn();
    render(
      <DesktopDock
        items={items}
        maxSize={42}
        minSize={38}
        onSizeChange={onSizeChange}
        size={40}
      />,
    );

    const resize = screen.getByRole("separator", { name: "Resize desktop dock" });
    resize.focus();
    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowDown}");
    expect(onSizeChange.mock.calls.map(([value]) => value)).toEqual([42, 42, 38]);
  });
});
