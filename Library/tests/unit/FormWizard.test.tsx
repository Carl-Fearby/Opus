import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FormWizard, type FormWizardStep } from "../../components/fields/FormWizard";

const steps: FormWizardStep[] = [
  { id: "account", label: "Account", content: <p>Account content</p> },
  { id: "profile", label: "Profile", content: <p>Profile content</p> },
  { id: "review", label: "Review", content: <p>Review content</p> },
];

describe("FormWizard", () => {
  it("moves through steps and completes the final step", () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    render(<FormWizard steps={steps} onComplete={onComplete} onStepChange={onStepChange} />);

    expect(screen.getByText("Account content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Profile content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete" }));

    expect(onStepChange).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenCalledWith(steps[2], 2);
  });

  it("reports validation failure without advancing", () => {
    const onValidationError = vi.fn();
    render(
      <FormWizard
        canAdvance={() => false}
        steps={steps}
        onValidationError={onValidationError}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Account content")).toBeInTheDocument();
    expect(onValidationError).toHaveBeenCalledWith(steps[0], 0);
  });

  it("supports direct step navigation when enabled", () => {
    render(<FormWizard steps={steps} />);
    fireEvent.click(screen.getByRole("button", { name: /Review/ }));
    expect(screen.getByText("Review content")).toBeInTheDocument();
  });
});
