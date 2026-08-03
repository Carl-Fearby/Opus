import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DesktopWindow } from "@/components/DesktopWindow";

describe("DesktopWindow", () => {
  it("renders content and exposes close, minimize, and maximize callbacks", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onMaximize = vi.fn();
    const onMinimize = vi.fn();
    render(
      <DesktopWindow
        onClose={onClose}
        onMaximize={onMaximize}
        onMinimize={onMinimize}
        title="Documents"
      >
        Recent documents
      </DesktopWindow>,
    );

    expect(screen.getByRole("article", { name: "Documents window" })).toBeVisible();
    expect(screen.getByText("Recent documents")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Close Documents" }));
    await user.click(screen.getByRole("button", { name: "Minimize Documents" }));
    await user.click(screen.getByRole("button", { name: "Maximize Documents" }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(onMinimize).toHaveBeenCalledOnce();
    expect(onMaximize).toHaveBeenCalledWith(true);
  });
});
