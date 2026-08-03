import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs } from "../../components/Tabs/Tabs";

describe("Tabs", () => {
  it("selects the pressed tab and reports its value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs
        items={[
          { content: "Overview content", label: "Overview", value: "overview" },
          { content: "Activity content", label: "Activity", value: "activity" },
        ]}
        onValueChange={onValueChange}
      />,
    );

    const activity = screen.getByRole("tab", { name: "Activity" });
    await user.click(activity);

    expect(activity).toHaveAttribute("aria-selected", "true");
    expect(onValueChange).toHaveBeenCalledWith("activity");
    expect(screen.getByText("Activity content")).toBeVisible();
  });
});
