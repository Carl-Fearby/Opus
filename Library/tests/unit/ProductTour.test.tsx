import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductTour } from "@/components/ProductTour";

describe("ProductTour", () => {
  it("uses a fallback target and moves through the tour", async () => {
    const onComplete = vi.fn();

    render(
      <>
        <button id="tour-fallback" type="button">Fallback</button>
        <ProductTour
          open
          steps={[
            {
              id: "missing",
              target: "#not-on-this-page",
              fallbackTarget: "#tour-fallback",
              title: "First step",
              description: "Uses the local preview target.",
            },
            {
              id: "finish",
              target: "#tour-fallback",
              title: "Final step",
              description: "Completes the tour.",
            },
          ]}
          onComplete={onComplete}
        />
      </>,
    );

    expect(screen.getByRole("heading", { name: "First step" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Final step" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(onComplete).toHaveBeenCalledOnce();
  });
});
